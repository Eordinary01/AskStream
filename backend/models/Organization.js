const mongoose = require('mongoose');
const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  uniqueUrl: {
    type: String,
    required: true,
    unique: true,
  },
  allowMessages: {
    type: Boolean,
    default: false,
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  cooldownTime: { 
    type: Number,
    default: 60000, 
  },
  oneQuestionPerUser: {
    type: Boolean,
    default: false,
  },
});
module.exports = mongoose.model('Organization',organizationSchema);
