// authRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  createCheckoutSession,
} = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/config', (req, res) => {
  console.log('config');
  return res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

router.post('/create-payment-intent', authenticate, createPaymentIntent);

router.post('/create-checkout-session', authenticate, createCheckoutSession);

module.exports = router;
