// authRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");
const config = require("../config/config");
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const upload = require("../config/upload");

// get by user and admin route
router.get("/", getAllProducts);
router.get("/:id", getProduct);

// create, update, delete product by admin route
router
  .route("/")
  .post(
    authenticate,
    authorize([config.roles.admin]),
    upload.single("productImage"),
    createProduct
  );

router
  .route("/:id")
  .put(
    authenticate,
    authorize([config.roles.admin]),
    upload.single("productImage"),
    updateProduct
  )
  .delete(authenticate, authorize([config.roles.admin]), deleteProduct);

module.exports = router;
