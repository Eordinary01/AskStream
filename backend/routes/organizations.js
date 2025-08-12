const express = require("express");
const auth = require("../middleware/auth");
const Organization = require("../models/Organization");
const User = require("../models/User");

const router = express.Router();

// Helper to send consistent JSON errors
const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({ message });
};

router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isCreator) {
      return sendError(res, 403, "Only Creator can create organizations");
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
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/join", auth, async (req, res) => {
  try {
    const { uniqueUrl } = req.body;
    if (!uniqueUrl) return sendError(res, 400, "Organization URL is required");

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return sendError(res, 404, "User not found");

    const org = await Organization.findOne({ uniqueUrl });
    if (!org) return sendError(res, 404, "Organization not found");

    if (org.members.includes(userId)) {
      return sendError(res, 400, "User already a member of this organization");
    }

    // Add user to org's members
    org.members.push(userId);
    await org.save();

    // Add org to user's organizations, if not present
    if (!user.organizations.includes(org._id)) {
      user.organizations.push(org._id);
      await user.save();
    }

    res.json({ message: "Joined organization successfully", organization: org });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/my", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("organizations");
    if (!user) return sendError(res, 404, "User not found");
    res.json(user.organizations);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/:url", async (req, res) => {
  try {
    const org = await Organization.findOne({ uniqueUrl: req.params.url });
    if (!org) return sendError(res, 404, "Organization not found");
    res.json(org);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

router.patch("/:id/toggle-messages", auth, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) return sendError(res, 404, "Organization not found");

    if (organization.owner.toString() !== req.user.id) {
      return sendError(res, 403, "Only the organization owner can toggle message permissions");
    }

    organization.allowMessages = !organization.allowMessages;
    await organization.save();

    res.json(organization);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
