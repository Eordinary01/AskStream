// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register user

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, isCreator } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    
    // Check for admin creation from env
    let role = 'user';
    let creatorStatus = isCreator || false;
    
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      role = 'admin';
      creatorStatus = true;
    } else if (isCreator) {
      role = 'creator';  // Set role to creator if isCreator is true
      creatorStatus = true;
    }
    
    // Create new user
    user = new User({
      username,
      email,
      password,
      isCreator: creatorStatus,
      role: role,  // This will be 'creator' for creators, 'user' for regular users
    });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();
    
    // Create JWT
    const payload = {
      user: {
        id: user.id,
      },
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            username: user.username, 
            role: user.role,  // This will be 'creator'
            isCreator: user.isCreator 
          } 
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Create JWT
    const payload = {
      user: {
        id: user.id,
      },
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, isCreator: user.isCreator } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get current user
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Validate token
router.get('/validate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(401).json({ msg: 'Invalid token' });
    }
    res.json({ valid: true, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;