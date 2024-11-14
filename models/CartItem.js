const {DataTypes, Model } = require('sequelize');
const {sequelize} = require('../config/database');
const Cart = require('./Cart');
const Product = require('./Product');


class CartItem extends Model {}

CartItem.init(
  {
    cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cart,
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product,
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'CartItem',
    tableName: 'cart_item', // Optional: You can specify the table name
    timestamps: true, // Sequelize will automatically manage createdAt and updatedAt
  }
);

Cart.hasMany(CartItem, {foreignKey: 'cartId'})
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

Product.hasMany(CartItem, {foreignKey: 'productId'});
CartItem.belongsTo(Product, { foreignKey: 'productId' });

module.exports = CartItem;
