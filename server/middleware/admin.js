const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // The auth middleware should have already verified the token and set req.userId
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get the user from database
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // Add user to request object for use in routes
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error in admin middleware' });
  }
};
