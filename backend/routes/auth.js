const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require('../middleware/auth');
const Organization = require("../models/Organization");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, isCreator, organizationUrl } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    user = new User({ username, email, password, isCreator });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // If user is joining organization, link accordingly
    if (!isCreator && organizationUrl) {
      const trimmedUrl = organizationUrl.trim().toLowerCase();
      const organization = await Organization.findOne({
        uniqueUrl: { $regex: new RegExp(`^${trimmedUrl}$`, 'i') }
      });

      if (!organization) {
        return res.status(400).json({ message: "Invalid organization URL" });
      }
      user.organizations.push(organization._id);
      organization.members.push(user._id);
      await organization.save();
    }

    await user.save();

    // Create JWT payload and sign token
    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '3600' }, // 1 hour expiry, consider refresh tokens for longer sessions
      (err, token) => {
        if (err) throw err;
        // Exclude password from user object before sending
        const userResponse = {
          id: user._id,
          username: user.username,
          email: user.email,
          isCreator: user.isCreator,
          organizations: user.organizations,
          // any other fields to expose safely
        };
        res.json({ token, user: userResponse });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found, please register" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        // Exclude password from user before sending
        const userResponse = {
          id: user._id,
          username: user.username,
          email: user.email,
          isCreator: user.isCreator,
          organizations: user.organizations,
          // any other safe fields
        };
        res.json({ token, user: userResponse });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/user", auth, async (req, res) => {
  try {
    // Explicitly exclude password field
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
