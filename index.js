// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

// set init information
require('dotenv').config();

// db setting
const { connectDB } = require('./config/database');

// route setting
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const orderRoutes = require('./routes/orderRoutes');

//payment
const paymentRoutes = require('./routes/paymentRoutes');

// model setting
const User = require('./models/User');
const Role = require('./models/Role');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const CartItem = require('./models/CartItem');
const Favorite = require('./models/Favorite');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');

// insert utils such as role initialize
const initializeRoles = require('./utils/initRoles');
const initializeAdminUsers = require('./utils/initAdminUser');
const { authenticate } = require('./middleware/authMiddleware');

const { createOrder } = require('./services/orderService');

const bodyParser = require('body-parser');

const app = express();

app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith('/checkout')) {
        req.rawBody = buf.toString();
      }
    },
  }),
);

// app.use(cors());
app.use(
  cors({
    origin: ['http://localhost:4200', 'http://localhost:64584'],
    credentials: true,
  }),
);
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Example Express setup to serve static images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// user route
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// product route
app.use('/product', productRoutes);
app.use('/category', categoryRoutes);

// cart route
app.use('/cart', cartRoutes);

// favorite route
app.use('/favorite', favoriteRoutes);

// order route
app.use('/order', orderRoutes);

// payment route
app.use('/pay', paymentRoutes);

const {} = require('./services/orderService');
const { stat } = require('fs');
// Webhook endpoint to handle stripe events
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Use raw body parser for Stripe webhook signature verification
// app.use(bodyParser.raw({ type: 'application/json' }));

app.post(
  '/checkout/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    console.log('stripe webhook');

    // console.log(req.body);
    const sig = req.headers['stripe-signature'];

    const stripePayload = req.rawBody || req.body;

    let event;
    try {
      try {
        event = stripe.webhooks.constructEvent(
          stripePayload,
          sig.toString(),
          process.env.STRIPE_WEBHOOK_SECRET,
        );
      } catch (err) {
        console.error(
          '⚠️  Webhook signature verification failed.',
          err.message,
        );
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;

          //Extract user Information
          const { userId } = { ...session.metadata };

          console.log('session metadata =>', userId);
          console.log('session id =>', session.id);

          // const lineItems = await stripe.checkout.sessions.listLineItems(
          //   session.id,
          // );

          const retrieveSession = await stripe.checkout.sessions.retrieve(
            session.id,
            {
              expand: ['line_items'], // Include line items in the response
            },
          );
          console.log(retrieveSession);

          const totalAmount = retrieveSession.amount_total;

          const lineItems = retrieveSession.line_items.data;

          await createOrder(userId, session.id, lineItems, totalAmount);
        }

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Respond to Stripe
      res.status(200).send('Event received');
    } catch (error) {
      console.error('webhook error:', error.message);
      res.status(400).send();
    }
  },
);

const startServer = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully.');

    // Initialize models in order
    await Role.sync();
    console.log('Role table created.');

    await User.sync();
    console.log('User table created.');

    await Category.sync();
    console.log('Category table created.');

    await Product.sync();
    console.log('Product table created.');

    await Cart.sync();
    console.log('Cart table created.');

    await CartItem.sync();
    console.log('CartItem table created.');

    await Favorite.sync();
    console.log('Favorite table created.');

    await Order.sync();
    console.log('Order table created.');

    await OrderItem.sync();
    console.log('OrderItem table created.');

    // Seed initial data
    await initializeRoles();
    await initializeAdminUsers();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

startServer();
