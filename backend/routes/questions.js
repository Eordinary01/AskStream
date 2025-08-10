const express = require('express');
const auth = require('../middleware/auth');
const Question = require('../models/Question');
const Organization= require('../models/Organization');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { organizationId, content,isAnonymous } = req.body;

    const organization = await Organization.findById(organizationId);

    if (!organization.allowMessages) {
      return res.status(403).json({ message: 'Currently Messaging is Off!' });
    }

    // Determine last message time: use lastMessageTime if set, else date
    const lastQuestion = await Question.findOne({ user: req.user.id, organization: organizationId }).sort({ date: -1 });

    let lastMessageTimestamp = null;
    if (lastQuestion) {
      if (lastQuestion.lastMessageTime) {
        lastMessageTimestamp = new Date(lastQuestion.lastMessageTime).getTime();
      } else if (lastQuestion.date) {
        lastMessageTimestamp = new Date(lastQuestion.date).getTime();
      }
    }

    const COOLDOWN_TIME = organization.cooldownTime || 60000;

    // Enforce one question per user if enabled
    if (organization.oneQuestionPerUser) {
      if (lastQuestion) {
        return res.status(403).json({ message: 'You have already asked a question for this organization.' });
      }
    }
    // Else enforce cooldown if timestamp is present
    else if (lastMessageTimestamp && (Date.now() - lastMessageTimestamp) < COOLDOWN_TIME) {
      return res.status(429).json({
        message: `Please wait ${Math.ceil((COOLDOWN_TIME - (Date.now() - lastMessageTimestamp)) / 1000)} seconds before asking again.`
      });
    }

    const newQuestion = new Question({
      user: req.user.id,
      organization: organizationId,
      content,
      isAnonymous: !!isAnonymous,
      lastMessageTime: new Date()
    });

    const question = await newQuestion.save();
    res.json(question);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



 
router.get('/:orgUrl', async (req, res) => {
  try {
    const organization = await Organization.findOne({ uniqueUrl: req.params.orgUrl });
    if (!organization) {
      return res.status(404).json({ msg: 'Organization not found' });
    }
    let questions = await Question.find({ organization: organization._id })
      .populate('user', 'username')
      .sort({ date: -1 });

    questions = questions.map(q => {
      const obj = q.toObject();
      if (obj.isAnonymous) {
        obj.user = { username: "Anonymous" };
      }
      return obj;
    });
    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
