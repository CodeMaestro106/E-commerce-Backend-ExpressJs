const { DataTypes, Model } = require('sequelize');
const {sequelize} = require('../config/database');
const Role = require('./Role');

class User extends Model {}

User.init(
    {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        roleId: {
            type: DataTypes.INTEGER,
            references: {
              model: Role,
              key: 'id'
            }
        },
        otp: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        otpExpiry: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users' // Optional: You can specify the table name
    }
)


User.belongsTo(Role, { foreignKey: 'roleId' });

module.exports = User;
