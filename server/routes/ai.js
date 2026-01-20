const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('multer');
const { analyzeProductImage, listAvailableModels } = require('../services/aiProductAnalyzer');

const upload = multer({ dest: 'uploads/' });

// Debug route to list available models
router.get('/models', async (req, res) => {
  try {
    await listAvailableModels();
    res.json({ message: 'Check server console for available models' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/analyze-product-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log("📸 Processing image:", req.file.path);
    console.log("🔑 GEMINI_API_KEY set:", !!process.env.GEMINI_API_KEY);
    
    const result = await analyzeProductImage(req.file.path);
    
    // Clean up uploaded file
    const fs = require('fs');
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to delete temp file:", err);
    });
    
    res.json(result);
  } catch (err) {
    console.error("❌ AI Analysis Error:", err.message);
    console.error("Stack:", err.stack);
    
    // Clean up uploaded file on error
    const fs = require('fs');
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
      });
    }
    
    res.status(500).json({ 
      message: 'AI analysis failed',
      error: err.message 
    });
  }
});

module.exports = router;
