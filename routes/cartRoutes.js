const express = require("express");
const router = express.Router();
const {
  addProductTocart,
  getCart,
  deleteCart,
  getAllCartInfo,
  deleteProductInCart,
  updateProudctInfoInCart,
} = require("../controllers/cartController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const config = require("../config/config");

// create new cart and add product in cart.
router.post("/add", authenticate, addProductTocart);

// Route to get user's cart
router.route("/").get(authenticate, getCart).delete(authenticate, deleteCart);

// update product info or remove product in cart
router
  .route("/:productId")
  .put(authenticate, updateProudctInfoInCart)
  .delete(authenticate, deleteProductInCart);

// Admin part
// Route to get all user's cart
router.get(
  "/all",
  authenticate,
  authorize([config.roles.admin]),
  getAllCartInfo
);

module.exports = router;
