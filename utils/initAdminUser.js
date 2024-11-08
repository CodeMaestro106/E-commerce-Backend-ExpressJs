// utils/initRoles.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Role = require('../models/Role');

async function initializeAdminUsers(){
    try{
        // hase admin password
        const adminPasword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

        // finde admin role info in role database
        const adminRole = await Role.findOne({ where: { name: "ADMIN" } });

        const adminUser = {
            username: process.env.ADMIN_USERNAME,
            email: process.env.ADMIN_EMAIL,
            password: adminPasword,
            roleId: adminRole.dataValues.id
        };

        const [initAdminUser, created] = await User.findOrCreate({
            where: {email:adminUser.email, username:adminUser.username},
            defaults: adminUser,
        });
           
        if(created) {
            console.log(`Admin User ${initAdminUser.dataValues.username} created.`);
        } else {
            console.log(`Admin User ${initAdminUser.dataValues.username} already exists.`);
        }
        
    } catch (error) {
        console.error('Error initializing roles:', error);
    }
}

module.exports = initializeAdminUsers;