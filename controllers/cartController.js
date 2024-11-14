const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');


// Create or update cart item
const addProductTocart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        // Find the cart for the user : This is related in the case that user add product in car first time
        let cart = await Cart.findOne({
            where: {userId: userId, status: "active"},
            include: [CartItem]
        })

        // If no cart, create a new cart
        if (!cart) {
            cart = await Cart.create( {
                userId: userId,
                status: "active",
                totalPrice: 0
            });
        }

        // Cehck if the product already exists in the cart
        const existingItem = await CartItem.findOne({
            where : {
                cartId: cart.id,
                productId: productId
            }
        })

        // Fetch the product details to get the price
        const product = await Product.findByPk(productId);

        if(!product) {
            return res.status(404).json({
                error: 'Product not found'
            });
        }

        const price = product.price;
        let total = 0;

        if ( existingItem ) {
            // If the product already exists in the cart, update quantity and total
            existingItem.quantity += Number(quantity);
            total = parseFloat(existingItem.quantity) * (price);  // Add the total to existingItem.total
            console.log( total + " " + quantity + " " + price)
            existingItem.total = total;

            await existingItem.save();
        } else {
            total = parseFloat(quantity) * (price);
            // If the product does not exist, create a new cart item
            await CartItem.create({
                cartId: cart.id,
                productId: productId,
                quantity: quantity,
                total: total
            });
        }

        // Recalculate the cart's total price
        const updatedCart = await Cart.findOne({
            where: { id: cart.id},
            include: [CartItem]
        });


        let newTotalPrice = 0;

        updatedCart.CartItems.forEach(item => {
            newTotalPrice += Number(item.total);
        });

        updatedCart.totalPrice = newTotalPrice;
        await updatedCart.save();
        
        return res.status(200).send(updatedCart);

    } catch (errors) {
        return res.status(500).send({
            msg : "server error",
            error: errors.message
        })
    }
}


// Get the user's current cart

const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
         
        const cart = await Cart.findOne({
            where: {
                userId: userId,
                status: "active"
            },
            include: [CartItem]
        });

        // check cart exist already.
        if(!cart){
            return res.status(404).send({
                error: "Cart not found"
            })
        }
        
        return res.status(200).send(cart)

    } catch (errors) {
        res.status(500).send({ msg: "server error", error: errors.message})
    }
}

// Get the user's current cart

const getAllCartInfo = async (req, res) => {
    try {
         
        const cart = await Cart.findAll({
            include: [CartItem]
        });

        // check cart exist already.
        if(!cart){
            return res.status(404).send({
                error: "Cart not found"
            })
        }
        return res.status(200).send(cart)

    } catch (errors) {
        res.status(500).send({ msg: "server error", error: errors.message})
    }
}

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

        // Optionally, you can update the cart's total price if needed:
        const updatedCart = await Cart.findOne({ where: { userId, status: 'active' } });
        updatedCart.totalPrice = await calculateTotalPrice(updatedCart.id); // Update total price
        await updatedCart.save();

        return res.status(200).json({ message: 'Product removed from cart' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting product from cart', error });
    }
};

// Function to calculate the total price of the cart after a product is removed
const calculateTotalPrice = async (cartId) => {
    const cartItems = await CartItem.findAll({ where: { cartId } });
    let total = 0;
    cartItems.forEach(item => {
        total += item.total;
    });
    return total;
};


const deleteCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({
            where: {
                userId: userId,
                status: "active"
            }
        })

        if(!cart) {
            return res.status(404).json({ error : 'cart not found'})
        }

        await CartItem.destroy({
            where: {
                cartId: cart.id
            }
        });

        await cart.destroy();
        return res.status(200).send({msg: 'cart deleted successfully'});


    } catch(errors) {
        return res.status(500).send({
            msg : "server error",
            error: errors
        })
    }
}


module.exports = cartController = {addProductTocart, getCart, deleteCart, deleteProductInCart,getAllCartInfo}