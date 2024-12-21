const { where } = require('sequelize');
const Product = require('../models/Product');
const Category = require('../models/Category');

const fs = require('fs');

// // Get All categories info
// const getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.findAll({
//       include: [{ model: Category }],
//     });
//     return res.status(200).send(products);
//   } catch (error) {
//     return res.status(500).send({ error: error.message });
//   }
// };

// // get Product by Id
// const getProduct = async (req, res) => {
//   try {
//     const product = await Product.findByPk(req.params.id, {
//       include: [{ model: Category }],
//     });

//     // If product not found, send error message
//     if (!product) {
//       return res.status(404).send({ msg: 'Product not found' });
//     }
//     return res.status(200).send(product);
//   } catch (errors) {
//     console.log(errors);
//     return res.status(500).send({
//       msg: errors.message,
//     });
//   }
// };

// // Create new Product by admin
// const createProduct = async (req, res) => {
//   let imgUrl = req.file ? req.file.path : null;
//   try {
//     const { name, price, description, category, stock } = req.body;

//     console.log(req.body);

//     // check if Product already exists
//     let product = await Product.findOne({
//       where: { name: name },
//     });
//     // If Product exists, return an error message
//     if (product) {
//       // In case of an error, remove the uploaded file if it was saved
//       if (imgUrl) {
//         fs.unlinkSync(imgUrl); // Delete the uploaded file
//       }
//       return res.status(400).send({ msg: 'Product already exists' });
//     }

//     const categoryId = await Category.findOne({ where: { name: category } });
//     console.log(category);
//     // If Category does not exits, return an error message
//     if (!categoryId) {
//       // In case of an error, remove the uploaded file if it was saved
//       if (imgUrl) {
//         fs.unlinkSync(imgUrl); // Delete the uploaded file
//       }
//       return res.status(400).send({ msg: 'Category does not correct' });
//     }

//     product = await Product.create({
//       name: name,
//       price: price,
//       description: description,
//       imgUrl: imgUrl,
//       categoryId: categoryId.id,
//       stock: stock,
//     });

//     await product.save();

//     // Return success response
//     res.status(201).send(product);
//   } catch (error) {
//     // In case of an error, remove the uploaded file if it was saved
//     if (imgUrl) {
//       fs.unlinkSync(imgUrl); // Delete the uploaded file
//     }
//     // Return error response
//     return res.status(500).send({ msg: error.message });
//   }
// };

// // update Product by admin
// const updateProduct = async (req, res) => {
//   // Get the uploaded file path
//   let uploadedFilepath = null;

//   try {
//     const { name, price, description, category, stock } = req.body;
//     console.log(req.body);
//     console.log(name);
//     // Check if Product already exists
//     let product = await Product.findByPk(req.params.id);

//     // If Product does not exist, return an error message
//     if (!product) {
//       return res.status(404).send({
//         msg: 'Product not found',
//       });
//     }

//     uploadedFilepath = req.file ? req.file.path : null;

//     const categoryId = await Category.findOne({ where: { name: category } });
//     // If Category does not exits, return an error message
//     if (!categoryId) {
//       if (uploadedFilepath) {
//         // Delete the file if the category is invalid
//         fs.unlinkSync(uploadedFilepath);
//       }
//       return res.status(400).send({ msg: 'Category does not correct' });
//     }

//     // update the Product's info (if necessary)
//     await product.update({
//       name,
//       price,
//       description,
//       imgUrl: uploadedFilepath,
//       categoryId: categoryId.id,
//       stock,
//     });

//     return res.status(200).send(product);
//   } catch (error) {
//     // In case of an error, remove the uploaded file if it was saved
//     if (uploadedFilepath) {
//       fs.unlinkSync(uploadedFilepath); // Delete the uploaded file
//     }
//     return res.status(500).send({
//       msg: error.message,
//     });
//   }
// };

// // delete Product by admin
// const deleteProduct = async (req, res) => {
//   try {
//     // find Product by Id
//     const product = await Product.findByPk(req.params.id);

//     // If Product does not exist, return an error message
//     if (!product) {
//       return res.status(404).send({
//         msg: 'Product not found',
//       });
//     }
//     // remove the uploaded file
//     if (product.dataValues.imgUrl) {
//       fs.unlinkSync(product.dataValues.imgUrl); // Delete the uploaded file
//     }
//     // delete Product if necessary
//     await product.destroy();

//     return res
//       .status(200)
//       .send({ msg: 'Product has been deleted successfully' });
//   } catch (error) {
//     return res.status(500).send({
//       msg: error.message,
//     });
//   }
// };

const {
  transFormProject,
  transFormSendProduct,
  convertImgUrl,
} = require('../services/prodcutService');

const {
  getPrice,
  updateProductPrice,
  deactivatePricesForProduct,
} = require('../services/priceService');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create new Product by admin
const createProduct = async (req, res) => {
  let imgUrl = req.file ? req.file.path : null;
  try {
    const { name, price, description, category, stock } = req.body;

    let product = await Product.findOne({
      where: { name: name },
    });
    // If Product exists, return an error message
    if (product) {
      // In case of an error, remove the uploaded file if it was saved
      if (imgUrl) {
        fs.unlinkSync(imgUrl); // Delete the uploaded file
      }
      return res.status(400).send({ msg: 'Product already exists' });
    }

    const categoryId = await Category.findOne({ where: { name: category } });
    console.log(category);
    // If Category does not exits, return an error message
    if (!categoryId) {
      // In case of an error, remove the uploaded file if it was saved
      if (imgUrl) {
        fs.unlinkSync(imgUrl); // Delete the uploaded file
      }
      return res.status(400).send({ msg: 'Category does not correct' });
    }

    const newImgeUrl = convertImgUrl(imgUrl);

    const newProduct = await stripe.products.create({
      name: name,
      description: description,
      metadata: {
        categoryId: categoryId.id,
        stock: stock.toString(), // Add stock information as metadata
      },
      images: [newImgeUrl],
    });

    console.log(newProduct);

    product = await Product.create({
      stripe_product_id: newProduct.id,
      name: name,
      categoryId: categoryId.id,
    });

    //create the price for the product
    const priceObject = await createNewPrice(newProduct.id, price);
    const sendProduct = transFormProject(
      product.id,
      newProduct,
      categoryId,
      priceObject,
    );

    // Return success response
    res.status(201).send(sendProduct);
  } catch (error) {
    // In case of an error, remove the uploaded file if it was saved
    if (imgUrl) {
      fs.unlinkSync(imgUrl); // Delete the uploaded file
    }
    // Return error response
    return res.status(500).send({ msg: error.message });
  }
};

// Get All categories info
const getAllProducts = async (req, res) => {
  try {
    const products = await stripe.products.list();

    const sendProducts = [];
    for (const product of products.data) {
      const getSendProduct = await transFormSendProduct(product.id);
      if (getSendProduct) {
        sendProducts.push(getSendProduct);
      }
    }

    return res.status(200).send(sendProducts);
  } catch (error) {
    console.log('here', error.message);
    return res.status(500).send({ error: error.message });
  }
};

// get Product by Id
// const getProduct = async (req, res) => {
//   try {
//     const product = await stripe.products.retrieve(req.params.id);

//     // If product not found, send error message
//     if (!product) {
//       return res.status(404).send({ msg: 'Product not found' });
//     }

//     return res.status(200).send(product);
//   } catch (errors) {
//     console.log(errors);
//     return res.status(500).send({
//       msg: errors.message,
//     });
//   }
// };

// update Product by admin
const updateProduct = async (req, res) => {
  // Get the uploaded file path
  let uploadedFilepath = null;

  try {
    const { name, priceId, price, description, category, stock } = req.body;

    //Check if Product already exists
    let product = await Product.findOne({
      where: { stripe_product_id: req.params.id },
    });

    // If Product does not exist, return an error message
    if (!product) {
      return res.status(404).send({
        msg: 'Product not found',
      });
    }

    uploadedFilepath = req.file ? req.file.path : null;

    const categoryId = await Category.findOne({ where: { name: category } });
    // If Category does not exits, return an error message
    if (!categoryId) {
      if (uploadedFilepath) {
        // Delete the file if the category is invalid
        fs.unlinkSync(uploadedFilepath);
      }
      return res.status(400).send({ msg: 'Category does not correct' });
    }

    const newProduct = await stripe.products.update(req.params.id, {
      name: name,
      description: description,
      images: [convertImgUrl(uploadedFilepath)],
      metadata: {
        categoryId: categoryId.id,
        stock: stock.toString(), // Add stock information as metadata
      },
    });

    console.log('new product =>', newProduct);

    const priceObject = await updateProductPrice(req.params.id, priceId, price);

    const sendProduct = transFormProject(
      product.id,
      newProduct,
      categoryId,
      priceObject,
    );

    // Return success response
    res.status(200).send(sendProduct);
  } catch (error) {
    // In case of an error, remove the uploaded file if it was saved
    if (uploadedFilepath) {
      fs.unlinkSync(uploadedFilepath); // Delete the uploaded file
    }
    return res.status(500).send({
      msg: error.message,
    });
  }
};

// delete Product by admin
const deleteProduct = async (req, res) => {
  try {
    console.log(req.params.id);
    const product = await Product.findOne({
      where: {
        stripe_product_id: req.params.id,
      },
    });

    // If Product does not exist, return an error message
    if (!product) {
      return res.status(404).send({
        msg: 'Product not found',
      });
    }
    // remove the uploaded file
    if (product.dataValues.imgUrl) {
      fs.unlinkSync(product.dataValues.imgUrl); // Delete the uploaded file
    }

    // Step 1: Deactivate all prices for the product
    await deactivatePricesForProduct(req.params.id);

    const deleted = await stripe.products.update(req.params.id, {
      active: false,
    });

    if (deleted) {
      // delete Product if necessary
      await product.destroy();

      return res
        .status(200)
        .send({ msg: 'Product has been deleted successfully' });
    } else {
      return res.status(404).send({
        msg: 'Product not found',
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      msg: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  // getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
