// authRoutes.js
const express = require("express");
const router = express.Router();
const { resolve } = require("path");

const calculateTax = false;

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2023-10-16",
//   appInfo: {
//     // For sample support and debugging, not required for production:
//     name: "stripe-samples/accept-a-payment/payment-element",
//     version: "0.0.2",
//     url: "https://github.com/stripe-samples",
//   },
// });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.get("/config", (req, res) => {
  console.log("config");
  return res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

router.get("/", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  return res.sendFile(path);
});

const calculate_tax = async (orderAmount, currency) => {
  const taxCalculation = await stripe.tax.calculations.create({
    currency,
    customer_details: {
      address: {
        line1: "10709 Cleary Blvd",
        city: "Plantation",
        state: "FL",
        postal_code: "33322",
        country: "US",
      },
      address_source: "shipping",
    },
    line_items: [
      {
        amount: orderAmount,
        reference: "ProductRef",
        tax_behavior: "exclusive",
        tax_code: "txcd_30011000",
      },
    ],
  });

  return taxCalculation;
};

router.get("/create-payment-intent", async (req, res) => {
  // Create a PaymentIntent with the amount, currency, and a payment method type.
  //
  // See the documentation [0] for the full list of supported parameters.
  //
  // [0] https://stripe.com/docs/api/payment_intents/create
  console.log("create");
  let orderAmount = 1400;
  let paymentIntent;

  try {
    if (calculateTax) {
      let taxCalculation = await calculate_tax(orderAmount, "usd");

      paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: taxCalculation.amount_total,
        automatic_payment_methods: { enabled: true },
        metadata: { tax_calculation: taxCalculation.id },
      });
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: orderAmount,
        automatic_payment_methods: { enabled: true },
      });
    }

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

module.exports = router;
