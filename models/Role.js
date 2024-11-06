const {DataTypes, Model } = require('sequelize');
const {sequelize} = require('../config/database');


class Role extends Model {}

Role.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'roles' // Optional: You can specify the table name
  }
);

module.exports = Role;
