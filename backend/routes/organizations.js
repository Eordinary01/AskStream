const express = require("express");
const auth = require("../middleware/auth");
const Organization = require("../models/Organization");
const User = require("../models/User");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isCreator) {
      return res.status(403).send({ message: "Only Creator can create organizations" });
    }

    const { name, cooldownTime, oneQuestionPerUser } = req.body;
    const uniqueUrl = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

    const newOrg = new Organization({
      name,
      owner: req.user.id,
      uniqueUrl,
      cooldownTime: cooldownTime || 60000,
      oneQuestionPerUser: oneQuestionPerUser || false,
    });

    const org = await newOrg.save();

    user.organizations.push(org._id);
    await user.save();

    res.json(org);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// In your organizations router file

router.post('/join', auth, async (req, res) => {
  try {
    const { uniqueUrl } = req.body;
    if (!uniqueUrl) return res.status(400).json({ msg: 'Organization URL is required' });

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const org = await Organization.findOne({ uniqueUrl });
    if (!org) return res.status(404).json({ msg: 'Organization not found' });

    // Check if user already member
    if (org.members.includes(userId)) {
      return res.status(400).json({ msg: 'User already a member of this organization' });
    }

    // Add user to org's members
    org.members.push(userId);
    await org.save();

    // Optionally add org to user's organizations (if tracked)
    if (!user.organizations.includes(org._id)) {
      user.organizations.push(org._id);
      await user.save();
    }

    res.json({ msg: 'Joined organization successfully', organization: org });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


router.get('/my', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).populate('organizations');
      res.json(user.organizations);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  router.get('/:url', async (req, res) => {
    try {
      const org = await Organization.findOne({ uniqueUrl: req.params.url });
      if (!org) {
        return res.status(404).json({ msg: 'Organization not found' });
      }
      res.json(org);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  router.patch('/:id/toggle-messages',auth,async(req,res)=>{
    try {
      const organization = await Organization.findById(req.params.id);
      if (!organization) {
        return res.status(404).json({ msg: 'Organization not found' });
      }
      if (organization.owner.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Only the organization owner can toggle message permissions' });
      }
      organization.allowMessages = !organization.allowMessages;
      await organization.save();
      res.json(organization);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  module.exports = router;
