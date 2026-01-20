const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const auth = require('../middleware/auth');
const generateToken = require('../utils/generateToken');
const grantWelcomeCoupon = require('../utils/welcomeCoupon');

const router = express.Router();

// Add this at the top with other initializations
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { google } = require('googleapis');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const welcomeCoupon = await grantWelcomeCoupon(user._id);

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      welcomeCoupon
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

     let welcomeCoupon = null;
      if (!user.loyalty?.hasReceivedWelcomeCoupon) {
        welcomeCoupon = await grantWelcomeCoupon(user._id);
      }

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      welcomeCoupon
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Google Login
router.post('/google-login', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    console.log('=== Google Auth Debug ===');
    console.log('Received access_token:', access_token ? 'Present' : 'Missing');
    
    if (!access_token) {
      return res.status(400).json({ message: 'Access token is required' });
    }

    // Use Google People API instead of userinfo endpoint
    console.log('Fetching user info from Google People API...');
    const response = await fetch(`https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    if (!response.ok) {
      console.error('Google People API response not OK:', response.status, response.statusText);
      return res.status(400).json({ message: 'Invalid Google access token' });
    }
    
    const userInfo = await response.json();
    console.log('Google People API response:', userInfo);

    // Extract email and name from People API response
    const email = userInfo.emailAddresses?.[0]?.value;
    const name = userInfo.names?.[0]?.displayName;

    if (!email) {
      console.error('No email in Google response');
      return res.status(400).json({ message: 'No email found in Google account' });
    }

    // Check if user exists
    let user = await User.findOne({ email: email });
    let isNewUser = false;
    let welcomeCoupon = null;

    if (!user) {
      // Create new user
      console.log('Creating new user...');
      user = new User({
        name: name,
        email: email,
        googleId: userInfo.resourceName, // Use resourceName as unique ID
        role: 'user'
      });
      await user.save();
      isNewUser = true;
      console.log('New user created:', user.email);
      
      // 🔥 Grant welcome coupon for new Google user
      welcomeCoupon = await grantWelcomeCoupon(user._id);
      if (welcomeCoupon) {
        console.log(`✅ Welcome coupon granted to new Google user: ${welcomeCoupon.code}`);
      }

    } else {
      // Update existing user with Google ID if not set
      if (!user.googleId) {
        user.googleId = userInfo.resourceName;
        await user.save();
      }
      console.log('Existing user found:', user.email);

      // 🔥 Safety net: Grant welcome coupon if somehow missed for existing user
      if (!user.loyalty?.hasReceivedWelcomeCoupon) {
        welcomeCoupon = await grantWelcomeCoupon(user._id);
        if (welcomeCoupon) {
          console.log(`✅ Welcome coupon granted to existing Google user: ${welcomeCoupon.code}`);
        }
      }
    }

    // 🔥 NEW: Send welcome email for new Google users
    if (isNewUser) {
      console.log('📧 Sending welcome email to new Google user...');
      const { sendWelcomeEmail } = require('../utils/emailService');
      
      // Send welcome email asynchronously (don't wait for it to complete)
      sendWelcomeEmail(user.email, user.name, welcomeCoupon)
        .then(result => {
          if (result.success) {
            console.log(`✅ Welcome email sent to ${user.email}`);
          } else {
            console.error(`❌ Failed to send welcome email to ${user.email}:`, result.error);
          }
        })
        .catch(error => {
          console.error(`❌ Welcome email error for ${user.email}:`, error);
        });
    }

    // Generate JWT token
    const token = generateToken(user._id);
    console.log('JWT token generated successfully');

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      isNewUser,
      welcomeCoupon
    });

  } catch (error) {
    console.error('=== Google Auth Error ===');
    console.error('Error details:', error);
    
    res.status(500).json({ 
      message: 'Google authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});
// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔥 NEW: GET user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});


// UPDATE user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    // Validate input
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if email is already taken by another user
    const currentUser = await User.findById(req.userId);
    if (email !== currentUser.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: req.userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Prepare update data
    const updateData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || ''
    };

    // 🔥 FIX: Handle structured address object (not string)
    if (address && typeof address === 'object') {
      updateData.address = {
        street: address.street?.trim() || '',
        city: address.city?.trim() || '',
        state: address.state?.trim() || '',
        zipCode: address.zipCode?.trim() || '',
        country: address.country?.trim() || 'India'
      };
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Failed to update profile' });
  }
});



module.exports = router;
