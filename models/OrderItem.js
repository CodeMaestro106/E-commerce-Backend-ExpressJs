const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");
const Order = require("./Order");
const Product = require("./Product");

class OrderItem extends Model {}

OrderItem.init(
  {
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
  },
  {
    sequelize,
    modelName: "OrderItem",
    tableName: "order_item", // Optional: You can specify the table name
    timestamps: true, // Sequelize will automatically manage createdAt and updatedAt
  }
);

Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

module.exports = OrderItem;
