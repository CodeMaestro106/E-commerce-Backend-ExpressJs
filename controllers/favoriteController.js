const { where } = require('sequelize');
const Favorite = require('../models/Favorite');
const Product = require('../models/Product');
const { transFormSendProduct } = require('../services/prodcutService');

// Get All favorite product info
const getFavorite = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.findAll({
      where: { userId },
      include: [Product],
    });

    if (favorites.length === 0) {
      return res.status(404).send({ msg: 'No favorites found' });
    }

    const sendProducts = [];

    for (const item of favorites) {
      console.log(item.Product.stripeProductId);
      const product = await transFormSendProduct(item.Product.stripeProductId);
      sendProducts.push(product);
    }

    return res.status(200).send(sendProducts);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Create new favorite
const addProductToFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    console.log(userId);
    console.log(productId);

    // check if Favorite already exists
    const favorite = await Favorite.findOne({
      where: {
        userId: userId,
        productId: productId,
      },
    });

    // If Favorite exists, return an error message
    if (favorite) {
      return res
        .status(400)
        .send({ msg: 'Product is already in your favorites' });
    }

    // console.log(favorite);

    await Favorite.create({ userId, productId });

    // const product = await Product.findByPk(productId);
    // console.log('add product id', product.dataValues);
    // Return success response

    const product = await Product.findByPk(productId);
    const stripeProductId = product.stripeProductId;

    const sendStripeProduct = await transFormSendProduct(stripeProductId);

    res.status(201).send(sendStripeProduct);
  } catch (error) {
    console.log('add favorite error', error.message);
    // Return error response
    return res.status(500).send({ error: 'Can not create favorites' });
  }
};

// delete favorites by admin
const deleteProductInFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    // find favorite by Id
    const favorite = await Favorite.findOne({
      where: {
        userId,
        productId,
      },
    });

    // If product exist in favorite, return an error message
    if (!favorite) {
      return res.status(404).send({
        msg: 'Product not found in your favorites',
      });
    }

    // delete favorite if necessary
    await favorite.destroy();

    console.log('delete product true');
    return res.status(200).send({
      msg: 'product has been deleted in favorite list successfully',
      resutl: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      msg: error.message,
    });
  }
};

module.exports = { getFavorite, addProductToFavorite, deleteProductInFavorite };
