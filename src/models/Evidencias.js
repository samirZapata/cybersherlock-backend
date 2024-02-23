const mongoose = require('mongoose');

const YourModelSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    unique: true,
  },
}, {timestamps: true});

module.exports = mongoose.model('YourModel', YourModelSchema);