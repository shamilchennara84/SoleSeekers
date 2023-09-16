// const multer = require('multer');
// const path = require('path');


// const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.gif'];
// const maxFileSize = 5 * 1024 * 1024; // 5MB

// // Configure multer storage and file filter
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/images');
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, file.fieldname + '-' + Date.now() + ext);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const ext = path.extname(file.originalname).toLowerCase();
//   if (allowedFileTypes.includes(ext)) {
//     cb(null, true);
//   } else {
//     console.log(ext);
//     cb(new Error('Invalid file type'));
//   }
// };

// const limits = {
//   fileSize: maxFileSize,
// };

// // Initialize multer with the configured options
// const upload = multer({ storage, fileFilter, limits });

// module.exports = upload;


const multer = require('multer');
const path = require('path');

//set storage
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  },
});

const store = multer({ storage: storage });

module.exports = store;