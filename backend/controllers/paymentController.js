// controllers/paymentController.js
const User = require('../models/User');

console.log("USING MOCK PAYMENT CONTROLLER");

/**
 * @desc    Get user subscription status
 * @route   GET /api/payments/subscription
 * @access  Private
 */
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Mock subscription status
    const subscriptionStatus = {
      subscription: user.subscription || 'free',
      subscriptionId: user.subscriptionId || null,
      subscriptionEndDate: user.subscriptionEndDate || null
    };
    
    res.status(200).json({
      success: true,
      data: subscriptionStatus
    });
  } catch (error) {
    console.error('Get Subscription Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription status'
    });
  }
};

/**
 * @desc    Create subscription session
 * @route   POST /api/payments/create-subscription
 * @access  Private
 */
exports.createSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user already has an active subscription
    if (user.subscription === 'premium' && user.subscriptionEndDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active premium subscription'
      });
    }
    
    // Mock stripe checkout session
    const mockSession = {
      id: 'mock_session_' + Date.now(),
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/account?subscription=success`
    };
    
    res.status(200).json({
      success: true,
      data: {
        sessionId: mockSession.id,
        url: mockSession.url
      }
    });
  } catch (error) {
    console.error('Create Subscription Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subscription'
    });
  }
};

/**
 * @desc    Cancel subscription
 * @route   POST /api/payments/cancel-subscription
 * @access  Private
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user has an active subscription
    if (user.subscription !== 'premium') {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }
    
    // Mock subscription cancellation
    user.subscription = 'free';
    await user.save();
    
    // Calculate end date (30 days from now for this mock)
    const cancelDate = new Date();
    cancelDate.setDate(cancelDate.getDate() + 30);
    
    res.status(200).json({
      success: true,
      message: 'Your subscription has been canceled and will end on the billing date',
      data: {
        cancelDate
      }
    });
  } catch (error) {
    console.error('Cancel Subscription Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error canceling subscription'
    });
  }
};

/**
 * @desc    Handle Stripe webhook events
 * @route   POST /api/payments/webhook
 * @access  Public
 */
exports.handleWebhook = async (req, res) => {
  console.log('Mock webhook received');
  // Just return a success response for the mock
  res.status(200).json({ received: true });
};