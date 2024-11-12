const { DataTypes, Model } = require('sequelize');
const {sequelize} = require('../config/database');
const Category = require('./Category');

class Product extends Model {}

Product.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        imgUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: Category,
              key: 'id'
            }
        },
    },
    {
        sequelize,
        modelName: 'Product',
        tableName: 'products' // Optional: You can specify the table name
    }
)

Product.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports = Product;
