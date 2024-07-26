const express = require('express');
const auth = require('../middleware/auth');
const Question = require('../models/Question');
const Organization= require('../models/Organization');
const router = express.Router();

const COOLDOWN_TIME = 60000;


router.post('/', auth, async (req, res) => {
    try {
      const { organizationId, content } = req.body;


      const organization = await Organization.findById(organizationId);

      // check for message
      if(!organization.allowMessages){
        return res.status(403).json({message:'Currently Messaging is Off!!'});
      }


      // check cooldown
      const lastQuestion= await Question.findOne({user:req.user.id,organization:organizationId}).sort({date:-1});

      if(lastQuestion && Date.now() - lastQuestion.date.getTime() < COOLDOWN_TIME){
        return res.status(429).json({message:'Pls wait until the CoolDown gets Over!'});
      }







      const newQuestion = new Question({
        user: req.user.id,
        organization: organizationId,
        content
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
      const questions = await Question.find({ organization: organization._id })
        .populate('user', 'username')
        .sort({ date: -1 });
      res.json(questions);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  module.exports = router;