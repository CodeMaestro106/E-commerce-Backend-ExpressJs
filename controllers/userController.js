const User = require('../models/User');
const Role = require('../models/Role');

const bcrypt = require('bcryptjs');
const { where } = require('sequelize');

// Get user info
const getUserInfo = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [{ model: Role }]
  });
  return res.json(user);
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  const users = await User.findAll({
    include: [{ model: Role }]
  });
  return res.json(users);
};

// Update user info by user
const updateUserInfo = async (req, res) => {

  console.log("user=>",re.user.id);
  const { username, password, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);

  const isMatch = await bcrypt.compare(password, user.password);
  console.log(isMatch);
  console.log(user.password);
  console.log(password);
  
  if(!isMatch){
    return res.status(400).send("Password valid");
  }
  try{
    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(newPassword, 10);
  
    await user.save();
    return res.json(user);
  }catch(error){
    return res.status(500).send({msg:"server error", error: error});
  }
  
};



// Update user info by admin
const updateUserInfoByAdmin = async (req, res) => {
  
  // Destructure input from request body
  const {username, password, role} = req.body;

  // Find the user by username
  const user = await User.findByPk(req.params.id)

  if(!user){
    return res.status(404).send({msg: "User not found"});
  }

  try {
    //Update the user if username is provided
    if (username) user.username = username;
    
    //Update the password if provided, hashing it
    if(password) user.password = await bcrypt.hash(password, 10);

    // Update the role if provided
    if(role) {
      const newRole = await Role.findOne({where: {name: role}});

      // Check if the role exists
      if(newRole){
        user.roleId = newRole.id;
      }else{
        return res.status(400).send({msg: "Role not found"});
      }
    }

    // save the update user to the database
    await user.save();
    return res.json(user);

  }catch(error){
    res.status(500).send({msg:"Server Error", error: error.message});
  }
  
};

// Admin can delete user
const deleteUser = async (req, res) => {

  // find user by req.params.id
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).send('User not found.');

  await user.destroy();
  return res.status(204).send('User deleted');
};

module.exports = { getUserInfo, getAllUsers, updateUserInfo, updateUserInfoByAdmin, deleteUser };
