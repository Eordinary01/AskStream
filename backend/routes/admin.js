// routes/admin.js
const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Organization = require('../models/Organization');

const router = express.Router();

// Get all organizations (admin only)
router.get('/organizations', [auth, admin], async (req, res) => {
  try {
    const organizations = await Organization.find()
      .populate('owner', 'username email')
      .populate('members', 'username email')
      .sort('-createdAt');
    res.json(organizations);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get all users (admin only)
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort('-createdAt');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get organization by ID (admin only)
router.get('/organizations/:id', [auth, admin], async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('members', 'username email')
      .populate('questions.createdBy', 'username');
    
    if (!organization) {
      return res.status(404).json({ msg: 'Organization not found' });
    }
    
    res.json(organization);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Delete organization (admin only)
router.delete('/organizations/:id', [auth, admin], async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ msg: 'Organization not found' });
    }
    
    await organization.remove();
    res.json({ msg: 'Organization removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Update user role (admin only)
router.put('/users/:id/role', [auth, admin], async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'creator', 'admin'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    user.role = role;
    user.isCreator = role === 'creator' || role === 'admin';
    await user.save();
    
    res.json({ msg: 'User role updated', user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get platform stats (admin only)
router.get('/stats', [auth, admin], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCreators = await User.countDocuments({ isCreator: true });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalOrganizations = await Organization.countDocuments();
    const totalQuestions = await Organization.aggregate([
      { $unwind: '$questions' },
      { $count: 'total' }
    ]);
    
    const totalAnswers = await Organization.aggregate([
      { $unwind: '$answers' },
      { $count: 'total' }
    ]);
    
    res.json({
      totalUsers,
      totalCreators,
      totalAdmins,
      totalOrganizations,
      totalQuestions: totalQuestions[0]?.total || 0,
      totalAnswers: totalAnswers[0]?.total || 0,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;