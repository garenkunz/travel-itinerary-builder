// services/stripeService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a checkout session for subscription
 */
async function createCheckoutSession(customerId, priceId, successUrl, cancelUrl, metadata) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {}
    });
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 */
async function cancelSubscription(subscriptionId) {
  try {
    return await stripe.subscriptions.update(
      subscriptionId,
      { cancel_at_period_end: true }
    );
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

/**
 * Retrieve subscription details
 */
async function getSubscription(subscriptionId) {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
}

module.exports = { 
  createCheckoutSession,
  cancelSubscription,
  getSubscription
};