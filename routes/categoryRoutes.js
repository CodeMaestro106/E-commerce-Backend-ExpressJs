// authRoutes.js
const express = require("express");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");
const config = require("../config/config");

// get, create, update, delete category route
router
  .route("/")
  .get(authenticate, authorize([config.roles.admin]), getCategories)
  .post(authenticate, authorize([config.roles.admin]), createCategory);

router
  .route("/:id")
  .put(authenticate, authorize([config.roles.admin]), updateCategory)
  .delete(authenticate, authorize([config.roles.admin]), deleteCategory);

module.exports = router;
