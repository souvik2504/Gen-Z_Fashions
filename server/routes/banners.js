const express = require('express');
const Banner = require('../models/Banner');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = 'uploads/banners/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for banner images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get all active banners (public route)
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all banners for admin (admin only)
router.get('/admin', [auth, admin], async (req, res) => {
  try {
    const banners = await Banner.find()
      .sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    console.error('Error fetching admin banners:', error);
    res.status(500).json({ message: error.message });
  }
});

// Upload new banner (admin only)
router.post('/', [auth, admin, upload.single('image')], async (req, res) => {
  try {
    const { title, linkUrl, order } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Banner image is required' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Banner title is required' });
    }

    const banner = new Banner({
      title: title.trim(),
      imageUrl: `/uploads/banners/${req.file.filename}`,
      linkUrl: linkUrl || '#',
      order: parseInt(order) || 0
    });

    await banner.save();

    console.log('✅ Banner created successfully:', banner._id);

    res.status(201).json({
      message: 'Banner uploaded successfully',
      banner
    });

  } catch (error) {
    console.error('❌ Banner upload error:', error);
    
    // Clean up uploaded file if banner creation fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(500).json({ message: error.message });
  }
});

// Update banner (admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { title, linkUrl, order, isActive } = req.body;

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (order !== undefined) updateData.order = parseInt(order);
    if (isActive !== undefined) updateData.isActive = isActive;

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json({
      message: 'Banner updated successfully',
      banner
    });

  } catch (error) {
    console.error('❌ Banner update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete banner (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    // Delete the image file
    const imagePath = path.join(process.cwd(), banner.imageUrl);
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Error deleting banner image:', err);
    });

    await Banner.findByIdAndDelete(req.params.id);

    console.log('✅ Banner deleted successfully:', req.params.id);

    res.json({ message: 'Banner deleted successfully' });

  } catch (error) {
    console.error('❌ Banner delete error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
