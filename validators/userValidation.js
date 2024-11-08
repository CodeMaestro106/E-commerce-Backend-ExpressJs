// userValidation.js
const {body, validationResult} = require('express-validator');

// Validation rules for email, username, and password in register request
const validateUserRegister = [
    // Check email
    body('email')
        .isEmail()
        .withMessage('please enter a valid eamil address'),

    // Check username
    body('username')
        .isLength({ min: 3, max: 20})
        .withMessage('Username must be beween 3 and 20 characters'),

    // Check password
    body('password')
        .isLength({min: 8})
        .withMessage('Password must be at least 8 characters')
        .matches(/\d/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-zA-Z]/)
        .withMessage('Password must contain at least one letter'),
    
    // Middleware to catch validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json( { errors: errors.array()});
        }
        next();
    }
];

// Validation rules for email, username, and password in register request
const validateUserLogin = [
    // Check email
    body('email')
        .isEmail()
        .withMessage('please enter a valid eamil address'),

    // Check password
    body('password')
        .isLength({min: 8})
        .withMessage('Password must be at least 8 characters')
        .matches(/\d/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-zA-Z]/)
        .withMessage('Password must contain at least one letter'),
    
    // Middleware to catch validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json( { errors: errors.array()});
        }
        next();
    }
];



module.exports = {validateUserRegister,validateUserLogin};

