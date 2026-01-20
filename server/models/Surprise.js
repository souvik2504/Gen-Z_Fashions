const mongoose = require('mongoose');

const surpriseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Surprise', surpriseSchema);
