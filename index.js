// server.js
const express = require('express');
const cors = require('cors');

// set init information
require('dotenv').config();

// db setting
const { connectDB } = require('./config/database');


// route setting
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// model setting
const User = require('./models/User');
const Role = require('./models/Role');

// insert utils such as role initialize
const initializeRoles = require('./utils/initRoles');
const initializeAdminUsers = require('./utils/initAdminUser');


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Connect to PostgreSQL
connectDB();

// Sync database and create tables if they do not exist
User.sync();
Role.sync();

// init role with "ADMIN" and "USER"
initializeRoles();
initializeAdminUsers();

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
