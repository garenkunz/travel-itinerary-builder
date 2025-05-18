// routes/itineraries.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const itineraryController = require('../controllers/itineraryController');

// Temporary route for testing
router.get('/test', (req, res) => {
  res.json({ message: 'Itineraries route is working' });
});

// Route for generating a new itinerary
router.post('/generate', auth, itineraryController.generateItinerary);

// Routes for managing itineraries
router.get('/', auth, itineraryController.getItineraries);
router.get('/:id', auth, itineraryController.getItinerary);
router.put('/:id', auth, itineraryController.updateItinerary);
router.delete('/:id', auth, itineraryController.deleteItinerary);

// Route for creating shareable link
router.post('/:id/share', auth, itineraryController.createShareableLink);

// Route for regenerating an activity
router.post('/:id/regenerate-activity', auth, itineraryController.regenerateActivity);

module.exports = router;