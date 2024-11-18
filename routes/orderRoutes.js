const express = require("express");
const router = express.Router();

const config = require("../config/config");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const {
  getOrders,
  createOrderFromCart,
  getAllOrders,
} = require("../controllers/orderController");

// Create an order from cart
router
  .route("/")
  .get(authenticate, getOrders)
  .post(authenticate, createOrderFromCart);

// Get all orders by Admin
router
  .route("/all")
  .get(authenticate, authorize([config.roles.admin]), getAllOrders);

module.exports = router;
