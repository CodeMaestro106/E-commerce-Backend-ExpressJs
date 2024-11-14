const express = require('express');
const router = express.Router();
const { addProductTocart, getCart,deleteCart,getAllCartInfo,deleteProductInCart} = require('../controllers/cartController');
const {authenticate, authorize} = require('../middleware/authMiddleware');

const config = require('../config/config');

// Route to add product to cart or change cart info such as product
// this route had create, update function.
router.post('/add', authenticate, addProductTocart);



// Route to get user's cart
router.route('/')
    .get(authenticate, getCart)
    .delete(authenticate, deleteCart);

// remove product in cart
router.delete('/:productId', authenticate, deleteProductInCart);


// Admin part
// Route to get all user's cart
router.get('/all',authenticate,authorize([config.roles.admin]), getAllCartInfo);

module.exports = router;