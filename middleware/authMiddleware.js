const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

// Authentication middleware
const authenticate = (req, res, next) => {

  // get token from request info
  const token = req.header('Authorization')?.split(' ')[1];
  // if token is empty, return 403 error
  if (!token) {
    return res.status(403).send({error:'Access denied.'});
  }
  try {
    // decoded token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send({msg:'Invalid token.', error: error});
  }
};

// Authorization middleware
const authorize = (roles = []) => {
  return (req, res, next) => {

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).send('Permission denied.');
    }
    next();
  };
};

module.exports = { authenticate, authorize };
