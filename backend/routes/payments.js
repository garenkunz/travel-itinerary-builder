// routes/payments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// Temporary route for testing
router.get('/test', (req, res) => {
  res.json({ message: 'Payments route is working' });
});

// Get subscription status
router.get('/subscription', auth, paymentController.getSubscriptionStatus);

// Create subscription
router.post('/create-subscription', auth, paymentController.createSubscription);

// Cancel subscription
router.post('/cancel-subscription', auth, paymentController.cancelSubscription);

// Webhook endpoint (no auth middleware)
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;