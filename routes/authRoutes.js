// authRoutes.js
const express = require("express");
const { register, login } = require("../controllers/authController");
const router = express.Router();
const {
  validateUserRegister,
  validateUserLogin,
} = require("../validators/userValidation");

// guest
router.post("/register", validateUserRegister, register);
router.post("/login", validateUserLogin, login);

module.exports = router;
