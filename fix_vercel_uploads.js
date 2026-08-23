const fs = require('fs');
const path = require('path');

const uploadMiddlewarePath = path.join(__dirname, 'server', 'middleware', 'uploadMiddleware.js');
const uploadRoutesPath = path.join(__dirname, 'server', 'routes', 'uploadRoutes.js');

// 1. Change uploadMiddleware to use memoryStorage
const uploadMiddlewareCode = `const multer = require('multer');

// Use Memory Storage for Vercel (read-only filesystem)
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|jfif|gif/;
  const extname = filetypes.test(file.originalname.toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;`;

fs.writeFileSync(uploadMiddlewarePath, uploadMiddlewareCode);

// 2. Change uploadRoutes to convert buffer to base64
const uploadRoutesCode = `const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No image uploaded');
  }
  
  // Convert buffer to base64 data URI
  const base64Image = \`data:\${req.file.mimetype};base64,\${req.file.buffer.toString('base64')}\`;
  
  res.send(base64Image);
});

module.exports = router;`;

fs.writeFileSync(uploadRoutesPath, uploadRoutesCode);

console.log('Uploads converted to memory/base64 for Vercel');
