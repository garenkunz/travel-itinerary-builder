// File: /backend/routes/itineraries.js

const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const auth = require('../middleware/auth');

// Routes for itineraries
router.post('/', auth, itineraryController.createItinerary);
router.get('/', auth, itineraryController.getUserItineraries);
router.get('/:id', auth, itineraryController.getItineraryById);
router.post('/:id/regenerate-activity', auth, itineraryController.regenerateActivity);
// Add any other routes you need

module.exports = router;