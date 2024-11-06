// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const User = require('./models/User');
const Role = require('./models/Role');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Connect to PostgreSQL
connectDB();

// Sync database and create tables if they do not exist
User.sync();
Role.sync();


// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
