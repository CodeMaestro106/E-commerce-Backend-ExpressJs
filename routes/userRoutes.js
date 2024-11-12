const express = require('express');
const { getUserInfo, getAllUsers, updateUserInfo, updateUserInfoByAdmin,deleteUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const config = require('../config/config');
const router = express.Router();

// User routes
router.get('/info', authenticate, getUserInfo);
router.put('/info', authenticate, updateUserInfo);

// Admin routes
router.get('/all-users', authenticate, authorize([config.roles.admin]), getAllUsers);

router.route('/all-users/:id')
    .put(authenticate, authorize([config.roles.admin]), updateUserInfoByAdmin)
    .delete(authenticate, authorize([config.roles.admin]), deleteUser);
    
module.exports = router;
