// routes/ml.js
const express = require('express');
const auth = require('../middleware/auth');
const mlGenerator = require('../utils/mlQuestionGenerator');
const Organization = require('../models/Organization');

const router = express.Router();

// Generate ML-based questions
router.post('/generate-questions', auth, async (req, res) => {
  try {
    const { topic, difficulty, count, orgId } = req.body;
    
    // Check if user is org owner
    const organization = await Organization.findById(orgId);
    if (!organization || organization.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Only organization owner can generate questions' });
    }
    
    const questions = mlGenerator.generateQuestions(topic, difficulty, count);
    
    if (questions.length === 0) {
      return res.status(404).json({ msg: 'No questions available for this topic/difficulty' });
    }
    
    // Add questions to organization
    for (const question of questions) {
      organization.questions.push({
        ...question,
        createdBy: req.user.id,
      });
    }
    
    await organization.save();
    
    res.json({ msg: `${questions.length} questions generated and added`, questions });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get available topics and difficulties
router.get('/available', auth, async (req, res) => {
  try {
    res.json({
      topics: mlGenerator.getAvailableTopics(),
      difficulties: mlGenerator.getDifficulties(),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;