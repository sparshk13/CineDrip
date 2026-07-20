const express = require('express');
const auth = require('../middleware/auth');
const Watchlist = require('../models/Watchlist');

const router = express.Router();

// POST /api/watchlist
router.post('/', auth, async (req, res) => {
  try {
    const { tmdbId, movieTitle, posterPath } = req.body;

    if (!tmdbId) {
      return res.status(400).json({ message: 'tmdbId is required' });
    }

    const existing = await Watchlist.findOne({ userId: req.user.id, tmdbId });
    if (existing) {
      return res.status(409).json({ message: 'Already in watchlist' });
    }

    const item = await Watchlist.create({
      userId: req.user.id,
      tmdbId,
      movieTitle,
      posterPath,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/watchlist
router.get('/', auth, async (req, res) => {
  try {
    const items = await Watchlist.find({ userId: req.user.id }).sort({ addedAt: -1 });
    res.status(200).json({ items, count: items.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/watchlist/:tmdbId
router.delete('/:tmdbId', auth, async (req, res) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId);
    const deleted = await Watchlist.findOneAndDelete({ userId: req.user.id, tmdbId });
    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Removed from watchlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
