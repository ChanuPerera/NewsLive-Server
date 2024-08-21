const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  publishedDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reporter",
    required: true,
  },
  articleType: {
    type: String,
    enum: ['General', 'Sport', 'Health', 'Political', 'Educational', 'Criminal', 'Accident'],
    required: true,
  },
  newsHeading: {
    type: String,
    required: true,
  },
  newsDescription: {
    type: String,
    required: true,
  },
  newsDescriptionLong: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String, 
    required: true,
  },
  publicationType: {
    type: Number,
    enum: [0, 1, 2],
    required: true,
  },
});

module.exports = mongoose.model('Article', articleSchema);
