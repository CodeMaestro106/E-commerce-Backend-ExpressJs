const { where } = require('sequelize');
const Category = require('../models/Category');


const bcrypt = require('bcryptjs');


// Get All categories info
const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        return res.status(200).send({ categories });
    } catch(error) {
        return res.status(500).send({error : error.message})
    }
};

// Create new category
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            res.status(400).send({ msg: "Name is required" });
        }

        // check if category already exists
        let category = await Category.findOne({
            where: {name: name}
        })
        // If category exists, return an error message
        if (category) {
            return res.status(400).send({ msg: 'Category already exists'});
        }

        category = new Category({
            name: name
        })

        await category.save();

        // Return success response
        res.status(201).send( {
            msg:'new category created',
            category: category
        })

    }catch(error){
        // Return error response
        return res.status(500).send({error : "Can not create category"});
    }
}

// update category
const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if category already exists
        let category = await Category.findByPk(req.params.id)

        // If category does not exist, return an error message 
        if(!category){
            return res.status(404).send({
                msg: 'category not found'
            })
        }

        // update the Product's info (if necessary)
        await category.update({
            name : name,
        });

        return res.status(200).send({
            msg: 'update category successfully',
            category: category
        })

    }catch (error) {
        return res.status(500).send({
            msg: error.message
        })
    }
}

// delete category by admin
const deleteCategory = async (req, res) => {
    try {
        // find category by Id
        const category = await Category.findByPk(req.params.id);

        // If category does not exist, return an error message
        if(!category) {
            return res.status(404).send({
                msg: 'category not found'
            })
        }

        // delete category if necessary
        await category.destroy();

        return res.status(200).send( { msg : "category has been deleted successfully"} )

    } catch(error) {
        return res.status(500).send({
            msg : error.message
        })
    }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
