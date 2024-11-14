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
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

// model setting
const User = require('./models/User');
const Role = require('./models/Role');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const CartItem = require('./models/CartItem');

const Favorite = require('./models/Favorite');

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
// role
Role.sync();
User.sync();
// product
Category.sync();
Product.sync();
// cart
Cart.sync();
CartItem.sync();
// favorite
Favorite.sync();


// init role with "ADMIN" and "USER"
initializeRoles();
initializeAdminUsers();

// Routes

// user route
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// product route
app.use('/product', productRoutes);
app.use('/category', categoryRoutes);

// cart route
app.use('/cart', cartRoutes);

// favorite route
app.use('/favorite', favoriteRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
