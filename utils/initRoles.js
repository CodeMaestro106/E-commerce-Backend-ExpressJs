// utils/initRoles.js
const Role = require('../models/Role');

async function initializeRoles(){
    try{
        const roles = ['ADMIN', 'USER'];

        for(const roleName of roles) {
            const [role, created] = await Role.findOrCreate({
                where: {name: roleName},
                defaults: { name: roleName},
            });

            if(created) {
                console.log(`Role ${roleName} created.`);
            } else {
                console.log(`Role ${roleName} already exists.`);
            }
        }
    } catch (error) {
        console.error('Error initializing roles:', error);
    }
}

module.exports = initializeRoles;