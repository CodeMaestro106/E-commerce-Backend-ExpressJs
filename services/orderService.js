const CartItem = require('../models/CartItem');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const { FLOAT } = require('sequelize');

const { transFormSendProduct } = require('../services/prodcutService');
const User = require('../models/User');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const sendTransOrderItems = async (orderItems) => {
  const sendOrderItems = [];

  for (const item of orderItems) {
    const product = await transFormSendProduct(item.stripeProductId);

    const changedOrderItem = { ...item.dataValues, Product: product };

    sendOrderItems.push(changedOrderItem);
  }

  return sendOrderItems;
};

// Fetch all orders
const getAllOrders = async () => {
  const orders = await Order.findAll({
    include: [
      {
        model: User,
        attributes: ['username'],
      },
    ],
  });

  const transFormOrder = orders.map((order) => {
    const transFormOrder = { ...order.toJSON(), username: order.User.username };
    delete transFormOrder.User;

    return transFormOrder;
  });

  return transFormOrder;
};

// get orders by userId
const getUserOrders = async (userId) => {
  const orders = await Order.findAll({
    where: { userId },
    include: [
      {
        model: OrderItem,
      },
    ],
  });
  return orders;
};

// get order by Session Id
const getOrderBySessionIdService = async (sessionId) => {
  const order = await Order.findOne({
    where: {
      stripeSessionId: sessionId,
    },
    include: [
      {
        model: OrderItem,
      },
    ],
  });

  // check order exist already
  if (!order) {
    return resizeBy.status(404).send({
      msg: 'Order not found',
    });
  }

  const orderItems = await sendTransOrderItems(order.OrderItems);

  console.log(orderItems);
  console.log(order);

  const sendOrder = { totalAmount: order.totalAmount, OrderItems: orderItems };

  console.log(sendOrder);

  return sendOrder;
};

const createOrder = async (userId, sessionId, lineItems, totalAmount) => {
  try {
    // Find the user's cart
    const cart = await Cart.findOne({
      where: { userId: userId, status: 'active' },
    });

    if (!cart) {
      throw new Error('Cart not found');
    }
    // Calculate total amount

    const orderItems = [];
    for (const lineItem of lineItems) {
      const stripeProductId = lineItem.price.product;
      const product = await Product.findOne({
        where: { stripeProductId: stripeProductId },
      });
      const productPrice = lineItem.price.unit_amount;

      const stripeProduct = await stripe.products.retrieve(stripeProductId);

      if (!stripeProduct || stripeProduct.metadata.stock < lineItem.quantity) {
        throw new Error(
          `Insufficient stock for product ${stripeProduct?.name}`,
        );
      }

      //get current quantity from metadata

      console.log('stripeProduct =>', stripeProduct);
      const currentQuantity = parseInt(stripeProduct.metadata.stock || '0', 10);

      const newQuantity = currentQuantity - lineItem.quantity;

      if (newQuantity < 0) {
        console.log(`Product ${stripeProductId} is out of stock`);
        continue;
      }

      await stripe.products.update(stripeProductId, {
        metadata: {
          stock: newQuantity.toString(),
        },
      });

      orderItems.push({
        productId: product.id,
        stripeProductId: stripeProductId,
        quantity: lineItem.quantity,
        price: productPrice,
      });
    }

    // Clerar the cart after order is placed
    await CartItem.destroy({ where: { cartId: cart.id } });

    // Mark cart as ordered
    cart.status = 'ordered';
    await cart.save();

    // Create the order
    const order = await Order.create({
      userId: userId,
      totalAmount: totalAmount,
      stripeSessionId: sessionId,
    });

    // Create order items
    for (const orderItem of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        productId: orderItem.productId,
        stripeProductId: orderItem.stripeProductId,
        quantity: orderItem.quantity,
        price: orderItem.price,
      });
    }
  } catch (error) {
    console.log(error);
    throw new Error(`Create order Error ${error}`);
  }
};

// Create an order from cart by userId
const createOrderFromCart = async (userId) => {
  // Find the user's cart
  const cart = await Cart.findOne({
    where: { userId: userId, status: 'active' },
  });

  if (!cart) {
    throw new Error('Cart not found');
  }

  // Get cart Items
  const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });

  // Calculate total amount
  let totalAmount = 0;

  const orderItems = [];

  for (const cartItem of cartItems) {
    const product = await Product.findByPk(cartItem.productId);

    if (!product || product.stock < cartItem.quantity) {
      throw new Error(
        `Insufficient stock for product ${product?.name || cartItem.productId}`,
      );
    }

    // Deduct stock
    product.stock -= cartItem.quantity;
    await product.save();

    console.log('product.price => ', product.price);
    console.log('cartItem.quantity => ', cartItem.quantity);

    totalAmount += product.price * parseFloat(cartItem.quantity);

    orderItems.push({
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      price: product.price,
    });
  }

  // Clerar the cart after order is placed
  await CartItem.destroy({ where: { cartId: cart.id } });

  // Mark cart as ordered
  cart.status = 'ordered';
  await cart.save();

  // Create the order
  const order = await Order.create({ userId, totalAmount });

  // Create order items
  for (const orderItem of orderItems) {
    await OrderItem.create({
      orderId: order.id,
      productId: orderItem.productId,
      quantity: orderItem.quantity,
      price: orderItem.price,
    });
  }

  return order;
};

const handleOrderRefund = async (orderId) => {
  const order = await Order.findByPk(orderId, { include: ['orderItems'] });
  if (!order) throw new Error('Order not found');

  if (order.status !== 'Paid') {
    throw new Error('Only paid orders can be refunded');
  }

  // Restock products
  for (const item of order.orderItems) {
    const product = await Product.findByPk(item.productId);
    product.stock += item.quantity;
    await product.save();
  }

  // Update order status to Refunded
  order.status = 'Refunded';
  await order.save();
};

module.exports = {
  getAllOrders,
  getOrderBySessionIdService,
  getUserOrders,
  createOrderFromCart,
  createOrder,
};
