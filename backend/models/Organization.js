// models/Organization.js
const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [{
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  mode: {
    type: String,
    enum: ['open', 'creator_only'],
    default: 'open'
  },
  allowReplies: {
    type: Boolean,
    default: true
  }
});

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['quiz', 'normal'], required: true },
  options: [{
    text: String,
    isCorrect: Boolean,
  }],
  correctAnswer: { type: String },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  points: { type: Number, default: 10 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // Quiz expiration time
  isActive: { type: Boolean, default: true },
  attemptedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // Track who attempted
});

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answer: mongoose.Schema.Types.Mixed,
  isCorrect: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0 },
  answeredAt: { type: Date, default: Date.now }
});

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  url: { type: String, required: true, unique: true },
  allowMessages: { type: Boolean, default: false },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  cooldownTime: { type: Number, default: 60000 },
  oneQuestionPerUser: { type: Boolean, default: false },
  questions: [questionSchema],
  answers: [answerSchema],
  discussions: [discussionSchema],
  settings: {
    allowQuizCreation: { type: Boolean, default: true },
    allowNormalQuestions: { type: Boolean, default: true },
    autoExpertPromotion: { type: Boolean, default: true },
    expertThreshold: {
      correctAnswers: { type: Number, default: 20 },
      accuracy: { type: Number, default: 80 },
      points: { type: Number, default: 200 },
    },
  },
  createdAt: { type: Date, default: Date.now },
});

// Method to check if user can answer
organizationSchema.methods.canUserAnswer = async function(userId, questionId) {
  const question = this.questions.id(questionId);
  if (!question) return false;
  
  // Check if quiz is expired
  if (question.expiresAt && new Date() > question.expiresAt) {
    return false;
  }
  
  // Check if quiz is active
  if (!question.isActive) {
    return false;
  }
  
  // Check if user already attempted
  if (question.attemptedBy.includes(userId)) {
    return false;
  }
  
  const userAnswers = this.answers.filter(a => 
    a.user.toString() === userId.toString() && 
    a.question.toString() === questionId.toString()
  );
  
  if (userAnswers.length > 0) return false;
  
  if (this.oneQuestionPerUser) {
    const userTotalAnswers = this.answers.filter(a => a.user.toString() === userId.toString());
    if (userTotalAnswers.length > 0) return false;
  }
  
  return true;
};

// Method to check if user can reply to discussion
organizationSchema.methods.canReplyToDiscussion = function(userId, discussionId) {
  const discussion = this.discussions.id(discussionId);
  if (!discussion) return false;
  
  if (discussion.mode === 'creator_only') {
    return this.owner.toString() === userId.toString();
  }
  
  return true;
};

module.exports = mongoose.model('Organization', organizationSchema);