const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const serverDir = path.join(__dirname, 'server');
const clientDir = path.join(__dirname, 'client');

console.log('Installing multer...');
execSync('npm install multer', { cwd: serverDir, stdio: 'inherit' });

// Create uploads directory
const uploadsDir = path.join(serverDir, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// 1. Backend: uploadMiddleware.js
const uploadMiddleware = `
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, \`\${file.fieldname}-\${Date.now()}\${path.extname(file.originalname)}\`);
  }
});

const checkFileType = (file, cb) => {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
};

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;
`;
fs.writeFileSync(path.join(serverDir, 'middleware', 'uploadMiddleware.js'), uploadMiddleware.trim());

// 2. Backend: uploadRoutes.js
const uploadRoutes = `
const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

router.post('/', upload.single('image'), (req, res) => {
  res.send(\`/\${req.file.path.replace(/\\\\/g, '/')}\`);
});

module.exports = router;
`;
fs.writeFileSync(path.join(serverDir, 'routes', 'uploadRoutes.js'), uploadRoutes.trim());

// 3. Backend: Setting Model & Controller
const settingModel = `
const mongoose = require('mongoose');
const settingSchema = new mongoose.Schema({
  shopName: { type: String, default: 'Zeesha Mobile' },
  shopLogo: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('Setting', settingSchema);
`;
fs.writeFileSync(path.join(serverDir, 'models', 'Setting.js'), settingModel.trim());

const settingController = `
const asyncHandler = require('express-async-handler');
const Setting = require('../models/Setting');

const getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) settings = await Setting.create({});
  res.json(settings);
});

const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) settings = new Setting();
  
  settings.shopName = req.body.shopName || settings.shopName;
  settings.shopLogo = req.body.shopLogo !== undefined ? req.body.shopLogo : settings.shopLogo;
  
  await settings.save();
  res.json(settings);
});

module.exports = { getSettings, updateSettings };
`;
fs.writeFileSync(path.join(serverDir, 'controllers', 'settingController.js'), settingController.trim());

const settingRoutes = `
const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/').get(getSettings).put(protect, isAdmin, updateSettings);
module.exports = router;
`;
fs.writeFileSync(path.join(serverDir, 'routes', 'settingRoutes.js'), settingRoutes.trim());

// 4. Backend: Modify Product.js model
let productModel = fs.readFileSync(path.join(serverDir, 'models', 'Product.js'), 'utf8');
if (!productModel.includes('image:')) {
  productModel = productModel.replace('name: { type: String, required: true },', "name: { type: String, required: true },\n  image: { type: String, default: '' },");
  fs.writeFileSync(path.join(serverDir, 'models', 'Product.js'), productModel);
}

// 5. Backend: Update server.js
let serverJs = fs.readFileSync(path.join(serverDir, 'server.js'), 'utf8');
if (!serverJs.includes('uploadRoutes')) {
  serverJs = serverJs.replace("app.use('/api/dashboard', require('./routes/dashboardRoutes'));", 
    "app.use('/api/dashboard', require('./routes/dashboardRoutes'));\napp.use('/api/upload', require('./routes/uploadRoutes'));\napp.use('/api/settings', require('./routes/settingRoutes'));\n");
  serverJs = serverJs.replace("app.get('/', (req, res)", "app.use('/uploads', express.static(require('path').join(__dirname, '/uploads')));\n\napp.get('/', (req, res)");
  fs.writeFileSync(path.join(serverDir, 'server.js'), serverJs);
}

console.log('Backend image logic added.');
