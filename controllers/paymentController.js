const { setEngine } = require('crypto');
const Stripe = require('stripe');
const calculateTax = false;

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const calculate_tax = async (orderAmount, currency) => {
  const taxCalculation = await stripe.tax.calculations.create({
    currency,
    customer_details: {
      address: {
        line1: '10709 Cleary Blvd',
        city: 'Plantation',
        state: 'FL',
        postal_code: '33322',
        country: 'US',
      },
      address_source: 'shipping',
    },
    line_items: [
      {
        amount: orderAmount,
        reference: 'ProductRef',
        tax_behavior: 'exclusive',
        tax_code: 'txcd_30011000',
      },
    ],
  });

  return taxCalculation;
};

const createPaymentIntent = async (req, res) => {
  // Create a PaymentIntent with the amount, currency, and a payment method type.
  //
  // See the documentation [0] for the full list of supported parameters.
  //
  // [0] https://stripe.com/docs/api/payment_intents/create

  const orderAmount = req.body.amount;
  let paymentIntent;

  try {
    if (calculateTax) {
      let taxCalculation = await calculate_tax(orderAmount, 'usd');

      paymentIntent = await stripe.paymentIntents.create({
        currency: 'usd',
        amount: taxCalculation.amount_total,
        automatic_payment_methods: { enabled: true },
        metadata: { tax_calculation: taxCalculation.id },
      });
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        currency: 'usd',
        amount: orderAmount,
        automatic_payment_methods: { enabled: true },
      });
    }
    console.log(paymentIntent.client_secret);
    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(500).send({
      error: {
        message: e.message,
      },
    });
  }
};

const createCheckoutSession = async (req, res) => {
  try {
    console.log('here');

    const { cartItems } = req.body;

    const line_items = [];

    let totalAmount = 0; // in cents
    // Loop through each product in the cart and create line items
    for (const item of cartItems) {
      const product = await stripe.products.retrieve(
        item.Product.stripeProductId,
      );

      if (!product) {
        throw new Error(`product with ID ${item.Product.stripeProductId} not foun
          d`);
      }

      // Fetch the price associated with the product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true, // Only active prices
      });

      if (!prices.data || prices.data.length === 0) {
        throw new Error(`No active prices found for product ${product.id}`);
      }

      console.log('prices =>', prices.data[0].id);

      const price = prices.data[0]; // Assuming you want the first price found

      const itemAmount = price.unit_amount * item.quantity; // in cents
      totalAmount += itemAmount;

      if (totalAmount > 99999999) {
        throw new Error('Total amount exceeds the Stripe limit of $999,999.99');
      }

      line_items.push({
        // price_data: {
        //   currency: 'usd',
        //   unit_amount: price.unit_amount * 100,
        //   product_data: {
        //     name: product.name,
        //   },
        // },
        price: price.id,
        quantity: item.quantity,
      });
    }

    console.log('pre line items =>', line_items);

    // create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: `${process.env.DOMAIN_URL}/check-out/success/{CHECKOUT_SESSION_ID}`,
      // success_url: `${process.env.DOMAIN_URL}/check-out/success`,
      cancel_url: `${process.env.DOMAIN_URL}/check-out/cancel`,
      metadata: {
        userId: req.user.id,
      },
    });

    console.log('session id=>', session.id);

    //Return the session ID to the client
    res.json({ id: session.id });
  } catch (error) {
    console.log('here error =>', error.message);
    return res.status(500).send({ error: error.message });
  }
};

module.exports = { createPaymentIntent, createCheckoutSession };
