const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const config = require('../config/config');

// Register a new user
const register = async (req, res) => {
  const { username, password, role } = req.body;
  console.log(req.body);
  const hashedPassword = await bcrypt.hash(password, 10);
  const userRole = await Role.findOne({ where: { name: role } });

  if (!userRole) return res.status(400).send('Invalid role.');

  try {
    const user = await User.create({
      username,
      password: hashedPassword,
      roleId: userRole.id
    });
    return res.status(201).send('User registered');
  } catch (error) {
    console.log(error);
    return res.status(500).send({msg:'Server error', error:error});
  }
};

// Login and get JWT token
const login = async (req, res) => {
  const { username, password } = req.body;
  // const user = await User.findOne({ where: { username }, include: {model:Role, attributes:['name']} });

  const user = await User.findOne({ where: { username }, include: { model: Role, attributes: ['id','name'] } });

  if (!user) return res.status(400).send('Invalid username or password.');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send('Invalid username or password.');


  if (user && user.Role) {
    const token = jwt.sign({ id: user.id, role: user.Role.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  } else {
    throw new Error('User or role not found');
  }
  
};

module.exports = { register, login };
