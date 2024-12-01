const User = require('../models/User');
const Role = require('../models/Role');

const bcrypt = require('bcryptjs');

// Get user info
const getUserInfo = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [{ model: Role }],
  });

  // Destructuring to extract username, Role.name, and email using spread operator
  const {
    username,
    email,
    Role: { name: roleName },
  } = user.dataValues;

  return res
    .status(200)
    .send({ username: username, email: email, roleName: roleName });
};

// Update user info by user
const updateUserInfo = async (req, res) => {
  const { username, password } = req.body;
  // find user by id
  const user = await User.findByPk(req.user.id);

  if (!user) {
    return res.status(404).send({ error: 'User not found.' });
  }

  // // Compare the old password with the stored password
  // const isMatch = await bcrypt.compare(password, user.password);
  // if(!isMatch){
  //   return res.status(400).send({error:"Password is incorrect"});
  // }

  try {
    // Update username if provided
    if (username) {
      user.username = username;
    }

    // Update password if a new password is provided
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    return res.status(200).send({ email: user.email, username: user.username });
  } catch (error) {
    return res.status(500).send({ msg: 'server can not response' });
  }
};

//#region Admin

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  const users = await User.findAll({
    include: [{ model: Role }],
  });
  // send client with email, username, role.name
  // Destructuring to extract username, Role.name, and email using spread operator and map function
  const extractedData = users
    .filter((user) => user.Role.name !== 'ADMIN') //Exclude 'ADMIN' role
    .map(({ id, username, email, Role: { name }, createdAt, updatedAt }) => ({
      id,
      username,
      email,
      role: name,
      createdAt,
      updatedAt,
    }));

  return res.status(200).send(extractedData);
};

// Update user info by admin
const updateUserInfoByAdmin = async (req, res) => {
  // Find the user by username
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).send({ msg: 'User not found' });
  }

  try {
    // Destructure input from request body
    const { username } = req.body;

    //Update the user if username is provided
    if (username) {
      user.username = username;
    }

    // save the update user to the database
    await user.save();
    const { id, email, username: sendUsername } = user.dataValues;
    return res
      .status(200)
      .send({ id: id, email: email, username: sendUsername });
  } catch (error) {
    res.status(500).send({ msg: 'Server Error', error: error.message });
  }
};

// Delete user by Admin
const deleteUser = async (req, res) => {
  // find user by req.params.id
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).send({ msg: 'User not found.' });
  }
  try {
    // delete user by req.params.id
    await user.destroy();

    return res.status(204).send('User deleted');
  } catch (error) {
    return res.status(500).send({ msg: error });
  }
};

module.exports = {
  getUserInfo,
  getAllUsers,
  updateUserInfo,
  updateUserInfoByAdmin,
  deleteUser,
};
