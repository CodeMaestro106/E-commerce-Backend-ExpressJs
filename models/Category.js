const {DataTypes, Model } = require('sequelize');
const {sequelize} = require('../config/database');


class Category extends Model {}

Category.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Category must be unique"
      },
    }
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'category' // Optional: You can specify the table name
  }
);

module.exports = Category;
