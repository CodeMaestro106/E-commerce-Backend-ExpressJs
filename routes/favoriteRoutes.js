// authRoutes.js
const express = require('express');
const {getFavorite, addProductToFavorite, deleteProductInFavorite} = require('../controllers/favoriteController')
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');


// get, create, update, delete favorite route
router.route('/')
    .get(authenticate, getFavorite)
    

router.route('/:productId')
    .post(authenticate, addProductToFavorite)
    .delete(authenticate, deleteProductInFavorite);

module.exports = router;
