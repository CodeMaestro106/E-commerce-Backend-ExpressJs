const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'avatar') {
            cb(null, 'uploads/image/avatars');
        } else if (file.fieldname === 'productImage') {
            cb(null, 'uploads/image/products');
        } else {
            cb(new Error('Invalid field name'), false);
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + path.basename(file.originalname));
    }
});

// Set up multer with fields for avatar and product images

module.exports = upload = multer({ storage: storage });
