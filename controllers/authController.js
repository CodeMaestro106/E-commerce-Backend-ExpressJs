const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const config = require('../config/config');

// Register a new user
const register = async (req, res) => {

  const { email, username, password } = req.body;

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const userRole = await Role.findOne({ where: { name: "USER" } });

  if (!userRole) {
    return res.status(400).send('Invalid role.');
  }

  try {
    // create user and save database by the req information.
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      roleId: userRole.id
    });

    // Remove the password field
    const { password, roleId, ...sendUser} = user.dataValues;

    return res.status(201).send({ msg: 'User registered', user: sendUser});

  } catch (error) {
    
    // check that username and email is unique
    if (error.name === 'SequelizeUniqueConstraintError') {
      const errorMessages = error.errors.map(err => err.message);
      return res.status(400).json({ errors: errorMessages });
    }

    res.status(500).json({ message: "Internal server error" });

  }
};

// Login and get JWT token
const login = async (req, res) => {
  
  const { email, password } = req.body;

  // find user based on email with model info.
  const user = await User.findOne({ where: { email }, include: { model: Role, attributes: ['id','name'] } });

  // check user is not
  if (!user) {
    return res.status(400).send({error:'User is not registered'});
  }

  // check password is correct
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send({error:'Password is not correct'});
  }


  if (user && user.Role) {

    const token = jwt.sign({ id: user.id, role: user.Role.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).send({ token });

  } else {
    return res.status(500).send("user info is not correct");
  }
  
};

module.exports = { register, login };
