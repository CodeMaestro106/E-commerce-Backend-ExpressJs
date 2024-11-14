const { where } = require('sequelize');
const Product = require('../models/Product');
const Category = require('../models/Category');

const fs = require('fs')



// Get All categories info
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        return res.status(200).send({ products });
    } catch(error) {
        return res.status(500).send({error : error.message})
    }
};

// get Product by Id
const getProduct = async (req, res) => {
    try {
        
        const product = await Product.findByPk(req.params.id);
        // If product not found, send error message
        if(!product) {
            res.status(404).send( { msg : 'Product not found'} );
        }

        return res.status(200).send({product});
    }catch(errors){
        return res.status(500).send( {
            msg: errors.message
        })
    }
}

// Create new Product by admin
const createProduct = async (req, res) => {
    
    try {
        let imgUrl = req.file ? req.file.path : null;
        const { name, price, description, category } = req.body;

        // check if Product already exists
        let product = await Product.findOne({
            where: {name: name}
        })
        // If Product exists, return an error message
        if (product) {
            // In case of an error, remove the uploaded file if it was saved
            if (imgUrl) {
                fs.unlinkSync(imgUrl); // Delete the uploaded file
            }
            return res.status(400).send({ msg: 'Product already exists'});
        }

        const categoryId = await Category.findOne({ where: { name: category } });

        // If Category does not exits, return an error message
        if (!categoryId) {
            // In case of an error, remove the uploaded file if it was saved
            if (imgUrl) {
                fs.unlinkSync(imgUrl); // Delete the uploaded file
            }
            return res.status(400).send( { msg: 'Category does not correct'})
        }

        product = await Product.create({
            name: name,
            price: price,
            description: description,
            imgUrl: imgUrl,
            categoryId:categoryId.id
        })

        await product.save();

        // Return success response
        res.status(201).send( {
            msg:'new Product created',
            product: product
        })

    }catch(error){
        // In case of an error, remove the uploaded file if it was saved
        if (imgUrl) {
            fs.unlinkSync(imgUrl); // Delete the uploaded file
        }
        // Return error response
        return res.status(500).send({error : error.message});
    }
}

// update Product by admin
const updateProduct = async (req, res) => {
    // Get the uploaded file path
    let uploadedFilepath = null;
    
    try {
        const { name, price, description, category } = req.body;
        // Check if Product already exists
        let product = await Product.findByPk(req.params.id)

        // If Product does not exist, return an error message 
        if(!product){
            return res.status(404).send({
                msg: 'Product not found'
            })
        }
        
        uploadedFilepath = req.file ? req.file.path : null;
        
        const categoryId = await Category.findOne( {where: { name: category}} )
        // If Category does not exits, return an error message
        if (!categoryId) {
            if(uploadedFilepath){
                // Delete the file if the category is invalid
                fs.unlinkSync(uploadedFilepath);
            }
            return res.status(400).send( { msg: 'Category does not correct'})
        }

        // update the Product's info (if necessary)
        await product.update({
            name,
            price,
            description,
            imgUrl : uploadedFilepath,
            categoryId: categoryId.id
        });

        return res.status(200).send({
            msg: 'update Product successfully',
            product: product
        })

    } catch (error) {
        // In case of an error, remove the uploaded file if it was saved
        if (uploadedFilepath) {
            fs.unlinkSync(uploadedFilepath); // Delete the uploaded file
        }
        return res.status(500).send({
            msg: error.message
        })
    }
}

// delete Product by admin
const deleteProduct = async (req, res) => {
    try {
        // find Product by Id
        const product = await Product.findByPk(req.params.id);

        // If Product does not exist, return an error message
        if(!product) {
            return res.status(404).send({
                msg: 'Product not found'
            })
        }
        // remove the uploaded file
        if (product.dataValues.imgUrl) {
            fs.unlinkSync(product.dataValues.imgUrl); // Delete the uploaded file
        }
        // delete Product if necessary
        await product.destroy();

        return res.status(200).send( { msg : "Product has been deleted successfully"} )

    } catch(error) {
        return res.status(500).send({
            msg : error.message
        })
    }
}

module.exports = { getAllProducts, getProduct,createProduct, updateProduct, deleteProduct };
