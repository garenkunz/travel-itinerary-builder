// middleware/premiumCheck.js
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Check if user has premium subscription
    if (user.subscription !== 'premium') {
      return res.status(403).json({
        success: false,
        message: 'This feature requires a premium subscription'
      });
    }
    
    // Check if premium subscription is still valid
    if (user.subscriptionEndDate) {
      const now = new Date();
      if (now > user.subscriptionEndDate) {
        // Subscription expired, downgrade to free
        await User.findByIdAndUpdate(user._id, {
          subscription: 'free',
          subscriptionEndDate: null
        });
        
        return res.status(403).json({
          success: false,
          message: 'Your premium subscription has expired'
        });
      }
    }
    
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};