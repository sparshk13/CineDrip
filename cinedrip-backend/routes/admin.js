const express = require('express');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const User = require('../models/User');
const Watchlist = require('../models/Watchlist');

const router = express.Router();

// All admin routes require a valid token AND the admin role.
router.use(auth, requireRole('admin'));

// GET /api/admin/analytics  — dashboard metrics
router.get('/analytics', async (req, res) => {
  try {
    const [totalUsers, onboardedUsers, adminUsers, totalWatchlist, recentUsers, topWatchlisted] =
      await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ isOnboarded: true }),
        User.countDocuments({ role: 'admin' }),
        Watchlist.countDocuments({}),
        User.find({}).sort({ createdAt: -1 }).limit(5).select('username email isOnboarded role createdAt'),
        Watchlist.aggregate([
          { $group: { _id: '$tmdbId', movieTitle: { $first: '$movieTitle' }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),
      ]);

    res.status(200).json({
      totals: {
        users: totalUsers,
        onboardedUsers,
        adminUsers,
        watchlistItems: totalWatchlist,
      },
      onboardingRate: totalUsers ? Math.round((onboardedUsers / totalUsers) * 100) : 0,
      recentUsers,
      topWatchlisted,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users?search=&role=&page=&limit=&sort=
router.get('/users', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = (req.query.search || '').trim();
    const role = req.query.role === 'admin' ? 'admin' : req.query.role === 'user' ? 'user' : null;
    const sortField = req.query.sort === 'email' || req.query.sort === 'createdAt' ? req.query.sort : 'createdAt';
    const sortDir = req.query.order === 'asc' ? 1 : -1;

    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('username email role isOnboarded createdAt')
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      data: users,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/users/:id/role  — body { role: 'user'|'admin' }
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('username email role');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
