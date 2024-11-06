const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(403).send('Access denied.');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send('Invalid token.');
  }
};

// Authorization middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    console.log(roles);
    console.log(req.user.role);

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).send('Permission denied.');
    }
    next();
  };
};

module.exports = { authenticate, authorize };
