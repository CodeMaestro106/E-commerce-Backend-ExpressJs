const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Category = require('../models/Category');
const Product = require('../models/Product');

const { getPrice } = require('../services/priceService');

const transFormSendProduct = async (stripeProductId) => {
  try {
    const priceObject = await getPrice(stripeProductId);

    const product = await stripe.products.retrieve(stripeProductId);

    const category = await Category.findByPk(product.metadata.categoryId);

    const databaseProduct = await Product.findOne({
      where: {
        stripeProductId: stripeProductId,
      },
    });

    if (databaseProduct) {
      const sendProduct = transFormProject(
        databaseProduct.id,
        product,
        category,
        priceObject,
      );

      return sendProduct;
    } else {
      console.warn(
        'No product found in database for stripeProductId:',
        stripeProductId,
      );
      return null; // Or handle the case where the product is not found
    }
  } catch (error) {
    console.error('Error get Product and Prices:', error);
    throw error;
  }
};

const transFormProject = (id, product, category, priceObject) => {
  try {
    const sendProduct = {
      id: id,
      stripeProductId: product.id,
      name: product.name,
      price: priceObject.unit_amount / 100,
      priceId: priceObject.id,
      description: product.description,
      imgUrl: product.images[0],
      categoryId: product.metadata.categoryId,
      category: category.name,
      stock: product.metadata.stock,
      createdAt: product.created,
      updatedAt: product.created,
    };
    return sendProduct;
  } catch (error) {
    console.error('Error deactivating prices:', error);
    throw error;
  }
};

const convertImgUrl = (imgUrl) => {
  return `http://localhost:5000/${imgUrl.replace(/\\/g, '/')}`;
};

module.exports = { transFormSendProduct, transFormProject, convertImgUrl };
