const CartItem = require("../models/CartItem");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const { FLOAT } = require("sequelize");

// Fetch all orders
const getAllOrders = async () => {
  return await Order.findAll();
};

// get orders by userId
const getOrders = async (userId) => {
  const orders = await Order.findAll({
    where: { userId },
    include: [OrderItem],
  });
  return orders;
};

// Create an order from cart by userId
const createOrderFromCart = async (userId) => {
  // Find the user's cart
  const cart = await Cart.findOne({ where: { userId } });

  if (!cart) {
    throw new Error("Cart not found");
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
        `Insufficient stock for product ${product?.name || cartItem.productId}`
      );
    }

    // Deduct stock
    product.stock -= cartItem.quantity;
    await product.save();

    console.log("product.price => ", product.price);
    console.log("cartItem.quantity => ", cartItem.quantity);

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
  cart.status = "ordered";
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
  const order = await Order.findByPk(orderId, { include: ["orderItems"] });
  if (!order) throw new Error("Order not found");

  if (order.status !== "Paid") {
    throw new Error("Only paid orders can be refunded");
  }

  // Restock products
  for (const item of order.orderItems) {
    const product = await Product.findByPk(item.productId);
    product.stock += item.quantity;
    await product.save();
  }

  // Update order status to Refunded
  order.status = "Refunded";
  await order.save();
};

module.exports = { getAllOrders, getOrders, createOrderFromCart };
