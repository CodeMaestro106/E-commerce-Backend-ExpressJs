const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const nodemailer = require('nodemailer');

const crypto = require('crypto');
const { roles } = require('../config/config');
const { error } = require('console');

// Register a new user
const register = async (req, res) => {
  const { email, username, password } = req.body;

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const userRole = await Role.findOne({ where: { name: 'USER' } });

  if (!userRole) {
    return res.status(400).send('Invalid role.');
  }

  // check if Email already exists
  let user = await User.findOne({
    where: { email: email },
  });
  // If Email exists, return an error message
  if (user) {
    return res.status(400).send({ msg: 'Email already exists' });
  }
  // check if User Name already exists
  user = await User.findOne({
    where: { username: username },
  });

  // If User Name exists, return an error message
  if (user) {
    return res.status(400).send({ msg: 'User Name already exists' });
  }

  try {
    // create user and save database by the req information.
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      roleId: userRole.id,
    });

    // Remove the password field
    const { password, roleId, ...sendUser } = user.dataValues;

    return res.status(201).send({ msg: 'User registered', user: sendUser });
  } catch (error) {
    res.status(500).json({ errors: 'Internal server error' });
  }
};

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Login and get JWT token
const login = async (req, res) => {
  try {
    console.log('login');
    const { email, password } = req.body;

    // find user based on email with model info.
    const user = await User.findOne({
      where: { email },
      include: { model: Role, attributes: ['id', 'name'] },
    });

    // check user is not
    if (!user) {
      return res.status(400).send({ error: 'User is not registered' });
    }

    // check password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Password is not correct' });
    }

    // Generate OTP
    user.otp = crypto.randomBytes(3).toString('hex'); // Generates a 6-digit OTP
    user.otpExpiry = Date.now() + 300000; // OTP valid for 5 minutes
    await user.save();

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${user.otp}`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return res.status(500).json({ msg: 'Error sending OTP' });
      }
      res.status(200).json({ msg: 'OTP sent to your email' });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const logout = async (req, res) => {
  console.log('logout');
  return res.status(200).send({ msg: 'Logged out Succesfully' });
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      where: { email },
      include: { model: Role },
    });

    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    // Clear OTP after verification
    user.otp = undefined;
    user.otpExpiry = undefined;

    const tokenUserInfo = {
      id: user.id,
      role: user.Role.name,
    };

    const accessToken = generateAccessToken(tokenUserInfo);
    const refreshToken = generateRefreshToken(tokenUserInfo);

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).send({
      user: {
        username: user.username,
        email: user.email,
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: 'server error' });
  }
};

const refreshToken = async (req, res) => {
  try {
    console.log('refresh - token => ', req.body.refreshToken);
    const requestRefreshToken = req.body.refreshToken;

    if (!requestRefreshToken) {
      return res.status(400).send({ error: 'Refresh token is required' });
    }
    const user = await User.findOne({
      where: { refreshToken: requestRefreshToken },
      include: { model: Role },
    });

    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    const tokenInfo = {
      id: user.id,
      role: user.Role.name,
    };
    const accessToken = generateAccessToken(tokenInfo);
    const refreshToken = generateRefreshToken(tokenInfo);

    user.refreshToken = refreshToken;
    await user.save();

    console.log(accessToken, refreshToken);
    return res
      .status(200)
      .send({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (error) {
    return res.status(500).json({ msg: 'server error', error: error });
  }
};

// access and refresh token
function generateAccessToken(user) {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: '15h' });
}

module.exports = { register, login, logout, verifyOtp, refreshToken };
