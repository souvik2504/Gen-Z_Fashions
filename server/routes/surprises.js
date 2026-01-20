const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Surprise = require('../models/Surprise');

// GET /api/surprises - get all surprises (non-admin: only active)
router.get('/', async (req, res) => {
  try {
    const surprises = await Surprise.find({ active: true });
    res.json(surprises);
  } catch (error) {
    console.error('Error fetching surprises:', error);
    res.status(500).json({ message: 'Failed to fetch surprises' });
  }
});

// ADMIN ROUTES
// GET /api/surprises/admin - all surprises with admin access
router.get('/admin', [auth, admin], async (req, res) => {
  try {
    const surprises = await Surprise.find();
    res.json(surprises);
  } catch (error) {
    console.error('Error fetching admin surprises:', error);
    res.status(500).json({ message: 'Failed to fetch surprises' });
  }
});

// POST /api/surprises - create surprise
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { description, active } = req.body;
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const surprise = new Surprise({ description, active: active !== undefined ? active : true });
    await surprise.save();
    res.status(201).json({ message: 'Surprise created', surprise });
  } catch (error) {
    console.error('Error creating surprise:', error);
    res.status(500).json({ message: 'Failed to create surprise' });
  }
});

// PUT /api/surprises/:id - update surprise
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { description, active } = req.body;
    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;

    const surprise = await Surprise.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!surprise) return res.status(404).json({ message: 'Surprise not found' });

    res.json({ message: 'Surprise updated', surprise });
  } catch (error) {
    console.error('Error updating surprise:', error);
    res.status(500).json({ message: 'Failed to update surprise' });
  }
});

// DELETE /api/surprises/:id - delete surprise
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const surprise = await Surprise.findByIdAndDelete(req.params.id);
    if (!surprise) return res.status(404).json({ message: 'Surprise not found' });

    res.json({ message: 'Surprise deleted' });
  } catch (error) {
    console.error('Error deleting surprise:', error);
    res.status(500).json({ message: 'Failed to delete surprise' });
  }
});

module.exports = router;
