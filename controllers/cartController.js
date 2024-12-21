const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const User = require('../models/User');
const { transFormSendProduct } = require('../services/prodcutService');

const sendTransCartItems = async (CartItems) => {
  const sendCartItems = [];

  for (const item of CartItems) {
    const product = await transFormSendProduct(item.Product.stripe_product_id);

    const ChangedCartItem = { ...item.dataValues, Product: product };

    sendCartItems.push(ChangedCartItem);
  }

  return sendCartItems;
};

// Create or update cart item
const addProductTocart = async (req, res) => {
  try {
    console.log('add Product To Cart');
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Find the cart for the user : This is related in the case that user add product in car first time
    let cart = await Cart.findOne({
      where: { userId: userId, status: 'active' },
      include: [CartItem],
    });

    // If no cart, create a new cart
    if (!cart) {
      cart = await Cart.create({
        userId: userId,
        status: 'active',
      });
    }

    // Cehck if the product already exists in the cart
    const existingItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    let newCartItemId;
    if (existingItem) {
      // If the product already exists in the cart, update quantity and total
      existingItem.quantity = Number(quantity);
      await existingItem.save();
      newCartItemId = existingItem.id;
    } else {
      // If the product does not exist, create a new cart item
      const newCartItem = await CartItem.create({
        cartId: cart.id,
        productId: productId,
        quantity: quantity,
      });
      newCartItemId = newCartItem.id;
    }

    const newcart = await Cart.findOne({
      where: {
        userId: userId,
        status: 'active',
      },
      include: [
        {
          model: CartItem, // Include CartItems
          include: [
            {
              model: Product, // Include Product model for each CartItem
            },
          ],
        },
      ],
    });

    // check cart exist already.
    if (!newcart) {
      return res.status(404).send({
        error: 'Cart not found',
      });
    }

    const sendCartItems = sendTransCartItems(newcart.CartItems);

    return res.status(200).send(sendCartItems);
  } catch (errors) {
    return res.status(500).send({
      msg: 'server error',
      error: errors.message,
    });
  }
};

// Get the user's current cart

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({
      where: {
        userId: userId,
        status: 'active',
      },
      include: [
        {
          model: CartItem, // Include CartItems
          include: [
            {
              model: Product, // Include Product model for each CartItem
            },
          ],
        },
      ],
    });

    // check cart exist already.
    if (!cart) {
      return res.status(404).send({
        error: 'Cart not found',
      });
    }

    const sendCartItems = await sendTransCartItems(cart.CartItems);

    return res.status(200).send(sendCartItems);
  } catch (errors) {
    res.status(500).send({ msg: 'server error', error: errors.message });
  }
};

const updateProudctInfoInCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    const quantity = req.body.quantity;

    if (!quantity) {
      res.status(400).send({
        msg: 'quantity must not be zero',
      });
    }

    // Find the active cart for the user
    const cart = await Cart.findOne({
      where: { userId, status: 'active' },
      include: [CartItem],
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find the cart item associated with the product
    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Product not found in the cart' });
    }

    await cartItem.update({
      quantity: quantity,
    });

    const updateCart = await Cart.findOne({
      where: {
        userId: userId,
        status: 'active',
      },
      include: [
        {
          model: CartItem, // Include CartItems
          include: [
            {
              model: Product, // Include Product model for each CartItem
            },
          ],
        },
      ],
    });

    const sendCartItems = sendTransCartItems(updateCart.CartItems);

    return res.status(200).send(sendCartItems);
  } catch (error) {
    return res.status(500).send({ msg: error });
  }
};

const deleteProductInCart = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from the token
    const productId = req.params.productId; // Get the productId from the route parameter

    // Find the active cart for the user
    const cart = await Cart.findOne({ where: { userId, status: 'active' } });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find the cart item associated with the product
    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Product not found in the cart' });
    }

    // Delete the product from the cart
    await cartItem.destroy();

    return res.status(200).json({ result: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error deleting product from cart', error });
  }
};

const deleteCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({
      where: {
        userId: userId,
        status: 'active',
      },
    });

    if (!cart) {
      return res.status(404).json({ error: 'cart not found' });
    }

    await CartItem.destroy({
      where: {
        cartId: cart.id,
      },
    });

    await cart.destroy();
    return res.status(200).send({ msg: 'cart deleted successfully' });
  } catch (errors) {
    return res.status(500).send({
      msg: 'server error',
      error: errors,
    });
  }
};

// Get the user's current cart by admin

const getAllCartInfo = async (req, res) => {
  try {
    const cart = await Cart.findAll({
      include: [
        { model: User }, // Include User
        {
          model: CartItem, // Include CartItems
          include: [
            {
              model: Product, // Include Product model for each CartItem
            },
          ],
        },
      ],
    });

    // check cart exist already.
    if (!cart) {
      return res.status(404).send({
        error: 'Cart not found',
      });
    }

    const sendCart = [];
    for (const item of cart) {
      const sendCartItems = await sendTransCartItems(item.CartItems);

      const changedCartItems = { ...item.dataValues, CartItems: sendCartItems };

      console.log('send cart Items => ', changedCartItems.CartItems);
      sendCart.push(changedCartItems);
    }

    return res.status(200).send(sendCart);
  } catch (errors) {
    res.status(500).send({ msg: 'server error', error: errors.message });
  }
};

const getCartInfoById = async (req, res) => {
  try {
    const cartId = req.params.cartId;

    const cart = await Cart.findOne({
      where: {
        id: cartId,
      },
      include: [
        {
          model: CartItem, // Include CartItems
          include: [
            {
              model: Product, // Include Product model for each CartItem
            },
          ],
        },
      ],
    });

    // check cart exist already.
    if (!cart) {
      return res.status(404).send({
        error: 'Cart not found',
      });
    }
    const sendCartItems = sendTransCartItems(cart.CartItems);
    console.log('send cart Items =>', sendCartItems);

    return res.status(200).send({ cartItems: sendCartItems });
  } catch (errors) {
    res.status(500).send({ msg: 'server error', error: errors.message });
  }
};

module.exports = cartController = {
  addProductTocart,
  getCart,
  deleteCart,
  deleteProductInCart,
  updateProudctInfoInCart,
  // admin
  getAllCartInfo,
  getCartInfoById,
};
