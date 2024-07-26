const express = require("express");
const auth = require("../middleware/auth");
const Organization = require("../models/Organization");
const User = require("../models/User");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.isCreator) {
      return res
        .status(403)
        .send({ message: "Only Creator can create organizations" });
    }

    const { name } = req.body;
    const uniqueUrl = `${name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${Date.now()}`;

    const newOrg = new Organization({
      name,
      owner: req.user.id,
      uniqueUrl,
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
