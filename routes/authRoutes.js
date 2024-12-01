// authRoutes.js
const express = require('express');
const {
  register,
  login,
  logout,
  verifyOtp,
  refreshToken,
} = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-otp', verifyOtp);
router.post('/refresh-token', refreshToken);

module.exports = router;
