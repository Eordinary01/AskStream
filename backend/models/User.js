// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: 'user',
  },
  isCreator: {
    type: Boolean,
    default: false,
  },
  points: {
    type: Number,
    default: 0,
    min: 0,
  },
  expertise: [{
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'beginner'
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    questionsAnswered: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    }
  }],
  badges: [{
    name: {
      type: String,
      required: true,
    },
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    topic: String,
  }],
  totalQuestionsAnswered: {
    type: Number,
    default: 0,
  },
  totalCorrectAnswers: {
    type: Number,
    default: 0,
  },
  accuracy: {
    type: Number,
    default: 0,
  },
  organizations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Pre-save middleware to synchronize role and isCreator
userSchema.pre('save', function(next) {
  // If isCreator is true, role should be 'creator'
  if (this.isCreator && this.role === 'user') {
    this.role = 'creator';
  }
  
  // If role is 'creator', isCreator should be true
  if (this.role === 'creator' && !this.isCreator) {
    this.isCreator = true;
  }
  
  // If role is 'admin', isCreator should be true
  if (this.role === 'admin') {
    this.isCreator = true;
  }
  
  // Ensure accuracy is always a number between 0-100
  if (this.accuracy && (this.accuracy < 0 || this.accuracy > 100)) {
    this.accuracy = Math.min(100, Math.max(0, this.accuracy));
  }
  
  next();
});

// Method to update expertise when answering questions
userSchema.methods.updateExpertise = async function(topic, isCorrect) {
  if (!topic) {
    throw new Error('Topic is required');
  }
  
  // Normalize topic name (trim and lowercase first letter uppercase)
  const normalizedTopic = topic.trim().charAt(0).toUpperCase() + topic.trim().slice(1).toLowerCase();
  
  const expertiseIndex = this.expertise.findIndex(e => e.topic === normalizedTopic);
  const pointsEarned = isCorrect ? 10 : 0;
  
  if (expertiseIndex === -1) {
    // New topic - add to expertise array
    this.expertise.push({
      topic: normalizedTopic,
      level: 'beginner',
      pointsEarned: pointsEarned,
      questionsAnswered: 1,
      correctAnswers: isCorrect ? 1 : 0,
      accuracy: isCorrect ? 100 : 0,
      earnedAt: new Date(),
      lastUpdated: new Date()
    });
  } else {
    // Update existing topic
    const expertise = this.expertise[expertiseIndex];
    expertise.questionsAnswered += 1;
    expertise.pointsEarned += pointsEarned;
    
    if (isCorrect) {
      expertise.correctAnswers += 1;
    }
    
    // Calculate accuracy percentage
    expertise.accuracy = (expertise.correctAnswers / expertise.questionsAnswered) * 100;
    expertise.lastUpdated = new Date();
    
    // Update level based on performance
    if (expertise.questionsAnswered >= 20 && expertise.accuracy >= 80) {
      if (expertise.level !== 'expert') {
        expertise.level = 'expert';
        
        // Add expert badge
        if (!this.badges.some(b => b.name === `${normalizedTopic} Expert`)) {
          this.badges.push({
            name: `${normalizedTopic} Expert`,
            description: `Became an expert in ${normalizedTopic}`,
            earnedAt: new Date(),
            topic: normalizedTopic
          });
        }
      }
    } else if (expertise.questionsAnswered >= 10 && expertise.accuracy >= 70) {
      if (expertise.level !== 'intermediate') {
        expertise.level = 'intermediate';
      }
    }
  }
  
  // Update global user stats
  this.totalQuestionsAnswered += 1;
  if (isCorrect) {
    this.totalCorrectAnswers += 1;
    this.points += pointsEarned;
  }
  
  // Calculate overall accuracy
  this.accuracy = this.totalQuestionsAnswered > 0 
    ? (this.totalCorrectAnswers / this.totalQuestionsAnswered) * 100 
    : 0;
  
  await this.save();
  return {
    topic: normalizedTopic,
    isCorrect,
    pointsEarned,
    totalPoints: this.points,
    accuracy: this.accuracy,
    expertise: this.expertise[expertiseIndex === -1 ? this.expertise.length - 1 : expertiseIndex]
  };
};

// Method to get user's expertise level for a specific topic
userSchema.methods.getExpertiseLevel = function(topic) {
  const expertise = this.expertise.find(e => e.topic === topic);
  return expertise ? expertise.level : 'beginner';
};

// Method to get user's statistics
userSchema.methods.getStats = function() {
  return {
    points: this.points,
    totalQuestions: this.totalQuestionsAnswered,
    totalCorrect: this.totalCorrectAnswers,
    accuracy: this.accuracy,
    expertiseCount: this.expertise.length,
    badgesCount: this.badges.length,
    expertise: this.expertise,
    badges: this.badges
  };
};

// Static method to get leaderboard
userSchema.statics.getLeaderboard = async function(limit = 10) {
  return await this.find({ role: { $ne: 'admin' } })
    .select('username points accuracy totalQuestionsAnswered')
    .sort({ points: -1 })
    .limit(limit);
};

module.exports = mongoose.model('User', userSchema);