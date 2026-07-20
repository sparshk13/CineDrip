const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// POST /api/taste/save
router.post('/save', auth, async (req, res) => {
  try {
    const { genres, vibes, eras, origins, watchVibe } = req.body;

    if (!genres || !Array.isArray(genres) || genres.length === 0) {
      return res.status(400).json({ message: 'Genres are required' });
    }
    if (!vibes || !Array.isArray(vibes) || vibes.length === 0) {
      return res.status(400).json({ message: 'Vibes are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.taste = { genres, vibes, eras: eras || [], origins: origins || [], watchVibe: watchVibe || '' };
    user.isOnboarded = true;
    await user.save();

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      taste: user.taste,
      isOnboarded: user.isOnboarded,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/taste
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      taste: user.taste,
      isOnboarded: user.isOnboarded,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
