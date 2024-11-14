const {DataTypes, Model } = require('sequelize');
const {sequelize} = require('../config/database');
const User = require('./User');


class Cart extends Model {}

Cart.init(
  {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
    },
    totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'Cart',
    tableName: 'cart', // Optional: You can specify the table name
    timestamps: true, // Sequelize will automatically manage createdAt and updatedAt
  }
);

Cart.belongsTo(User, { foreignKey: 'userId' });

module.exports = Cart;
