// routes/organizations.js
const express = require('express');
const auth = require('../middleware/auth');
const Organization = require('../models/Organization');
const User = require('../models/User');

const router = express.Router();

// ─── Create organization ──────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isCreator) return res.status(403).json({ msg: 'Only creators can create organizations' });

    const { name, cooldownTime, oneQuestionPerUser } = req.body;
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const url  = `${base}-${Date.now()}`;

    const org = await new Organization({
      name, owner: req.user.id, url,
      cooldownTime: cooldownTime ?? 60000,
      oneQuestionPerUser: oneQuestionPerUser ?? false,
    }).save();

    user.organizations.push(org._id);
    await user.save();
    res.json(org);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── Add quiz question ────────────────────────────────────────────────────────
router.post('/:orgId/questions', auth, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ msg: 'Organization not found' });
    if (org.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Only owner can add questions' });

    const { text, type, options, correctAnswer, topic, difficulty, points, expiresInHours } = req.body;

    if (type === 'quiz' && (!options || options.length < 2)) {
      return res.status(400).json({ msg: 'Quiz requires at least 2 options' });
    }

    const question = {
      text, type, topic,
      difficulty: difficulty || 'medium',
      points:     points     || 10,
      createdBy:  req.user.id,
      isActive:   true,
      attemptedBy: [],
      ...(expiresInHours > 0 && { expiresAt: new Date(Date.now() + expiresInHours * 3600_000) }),
      ...(type === 'quiz' ? { options } : { correctAnswer }),
    };

    org.questions.push(question);
    await org.save();
    res.json({ msg: 'Question added', question: org.questions[org.questions.length - 1] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── Active questions for members ─────────────────────────────────────────────
router.get('/:orgId/active-questions', auth, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ msg: 'Organization not found' });

    if (!org.members.map(m => m.toString()).includes(req.user.id) && org.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'You must be a member' });
    }

    const now = new Date();
    const answeredIds = org.answers
      .filter(a => a.user.toString() === req.user.id)
      .map(a => a.question.toString());

    const questions = org.questions
      .filter(q => {
        if (q.createdBy.toString() === req.user.id) return false;  // creator can't see own
        if (!q.isActive) return false;
        if (q.expiresAt && new Date(q.expiresAt) < now) return false;
        return true;  // show even if answered — frontend hides it, but we mark it
      })
      .map(q => ({ ...q.toObject(), answered: answeredIds.includes(q._id.toString()) }));

    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── All questions for owner ──────────────────────────────────────────────────
router.get('/:orgId/owner-questions', auth, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ msg: 'Organization not found' });
    if (org.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Only owner' });

    res.json(org.questions.map(q => q.toObject()));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── Answer question ──────────────────────────────────────────────────────────
router.post('/:orgId/questions/:questionId/answer', auth, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ msg: 'Organization not found' });

    const question = org.questions.id(req.params.questionId);
    if (!question) return res.status(404).json({ msg: 'Question not found' });

    // creator cannot answer own question
    if (question.createdBy.toString() === req.user.id) {
      return res.status(400).json({ msg: 'You cannot answer your own question' });
    }

    if (question.attemptedBy.map(id => id.toString()).includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already attempted' });
    }

    if (question.expiresAt && new Date() > question.expiresAt) {
      return res.status(400).json({ msg: 'Question has expired' });
    }

    if (!question.isActive) {
      return res.status(400).json({ msg: 'Question is inactive' });
    }

    // oneQuestionPerUser check
    if (org.oneQuestionPerUser) {
      const alreadyAnswered = org.answers.some(a => a.user.toString() === req.user.id);
      if (alreadyAnswered) return res.status(400).json({ msg: 'You can only answer one question in this organization' });
    }

    const { answer } = req.body;
    let isCorrect = false;
    let pointsEarned = 0;

    if (question.type === 'quiz') {
      const opt = question.options.find(o => o.text === answer);
      if (opt?.isCorrect) { isCorrect = true; pointsEarned = question.points; }
    } else {
      if (answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
        isCorrect = true; pointsEarned = question.points;
      }
    }

    question.attemptedBy.push(req.user.id);
    org.answers.push({ question: req.params.questionId, user: req.user.id, answer, isCorrect, pointsEarned });
    await org.save();

    const user = await User.findById(req.user.id);
    await user.updateExpertise(question.topic, isCorrect);

    res.json({ isCorrect, pointsEarned, userPoints: user.points, userAccuracy: user.accuracy });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── Toggle question active/inactive ─────────────────────────────────────────
router.patch('/:orgId/questions/:questionId/toggle', auth, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ msg: 'Organization not found' });
    if (org.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Only owner' });

    const q = org.questions.id(req.params.questionId);
    if (!q) return res.status(404).json({ msg: 'Question not found' });

    q.isActive = !q.isActive;
    await org.save();
    res.json({ isActive: q.isActive });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── Leaderboard ─────────────────────────────────────────────────────────────
router.get('/:orgId/leaderboard', async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ msg: 'Organization not found' });

    const stats = {};
    org.answers.forEach(a => {
      const uid = a.user.toString();
      if (!stats[uid]) stats[uid] = { userId: a.user, total: 0, correct: 0, points: 0 };
      stats[uid].total++;
      if (a.isCorrect) stats[uid].correct++;
      stats[uid].points += a.pointsEarned;
    });

    const board = await Promise.all(
      Object.values(stats).map(async s => {
        const u = await User.findById(s.userId).select('username');
        return { username: u?.username || 'Unknown', ...s, accuracy: s.total > 0 ? (s.correct / s.total) * 100 : 0 };
      })
    );

    board.sort((a, b) => b.points - a.points);
    res.json(board);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── Join organization ────────────────────────────────────────────────────────
router.post('/join', auth, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ msg: 'URL is required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const org = await Organization.findOne({ url });
    if (!org) return res.status(404).json({ msg: 'Organization not found' });

    if (org.members.map(m => m.toString()).includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already a member' });
    }

    org.members.push(req.user.id);
    await org.save();

    if (!user.organizations.map(o => o.toString()).includes(org._id.toString())) {
      user.organizations.push(org._id);
      await user.save();
    }

    res.json({ msg: 'Joined successfully', organization: org });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── Get user's organizations ─────────────────────────────────────────────────
router.get('/my', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('organizations');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.organizations);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─── Get organization by URL ──────────────────────────────────────────────────
// NOTE: this must come AFTER /my and /join — otherwise Express matches them as :url
router.get('/:url', async (req, res) => {
  try {
    const org = await Organization.findOne({ url: req.params.url })
      .populate('owner', '_id username email')
      .populate('members', '_id username');
    if (!org) return res.status(404).json({ msg: 'Organization not found' });
    res.json(org);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;