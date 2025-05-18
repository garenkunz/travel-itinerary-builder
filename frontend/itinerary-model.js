// models/Itinerary.js
const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: String
  },
  cost: {
    type: String
  },
  category: {
    type: String,
    enum: ['morning', 'afternoon', 'evening']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: String
  },
  notes: String
});

const DaySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  dayNumber: {
    type: Number,
    required: true
  },
  activities: [ActivitySchema]
});

const ItinerarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  budget: {
    type: Number
  },
  interests: [{
    type: String
  }],
  pace: {
    type: String,
    enum: ['Relaxed', 'Balanced', 'Ambitious'],
    default: 'Balanced'
  },
  days: [DaySchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareableLink: {
    type: String
  }
});

ItinerarySchema.index({ destination: 'text' });

module.exports = mongoose.model('Itinerary', ItinerarySchema);
