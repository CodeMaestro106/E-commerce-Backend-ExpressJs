const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");

class Order extends Model {}

Order.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "order", // Optional: You can specify the table name
    timestamps: true, // Sequelize will automatically manage createdAt and updatedAt
  }
);

Order.belongsTo(User, { foreignKey: "userId" });

module.exports = Order;
