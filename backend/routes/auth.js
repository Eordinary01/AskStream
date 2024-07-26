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
      return res.status(400).send({ message: "User Already Exists" });
    }

    user = new User({ username, email, password, isCreator });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    if (!isCreator && organizationUrl) {
      const trimmedUrl = organizationUrl.trim().toLowerCase();
      const organization = await Organization.findOne({
        uniqueUrl: { $regex: new RegExp(`^${trimmedUrl}$`, 'i') }
      });

      if (!organization) {
        return res.status(400).json({ msg: "Invalid organization URL" });
      }
      user.organizations.push(organization._id);
      organization.members.push(user._id);
      await organization.save();
    }
    await user.save();
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ messsage: "User not Found!Pls Register" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token,user });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/user", auth, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });

module.exports = router;
