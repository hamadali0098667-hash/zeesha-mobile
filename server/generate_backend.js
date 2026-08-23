const fs = require('fs');
const path = require('path');

const models = {
  'User.js': `
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'cashier'], default: 'cashier' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
`,
  'Product.js': `
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String },
  model: { type: String },
  imeiSku: { type: String, unique: true },
  category: { type: String, required: true },
  costPrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  stockQty: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
`,
  'Supplier.js': `
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
`,
  'Purchase.js': `
const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    cost: { type: Number, required: true }
  }],
  totalCost: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
`,
  'Sale.js': `
const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    salePrice: { type: Number, required: true }
  }],
  subTotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'Other'], required: true },
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
`,
  'Customer.js': `
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
`,
  'Repair.js': `
const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  deviceDetails: { type: String, required: true },
  issueDescription: { type: String, required: true },
  status: { type: String, enum: ['received', 'in-progress', 'completed', 'delivered'], default: 'received' },
  estimatedCost: { type: Number, default: 0 },
  finalCost: { type: Number, default: 0 },
  technicianNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Repair', repairSchema);
`,
  'Setting.js': `
const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  shopName: { type: String, default: 'Zeesha Mobile' },
  address: { type: String, default: '' },
  currency: { type: String, default: 'USD' },
  invoiceFooter: { type: String, default: 'Thank you for your business!' }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
`
};

const ObjectUtils = {
  middlewares: {
    'authMiddleware.js': `
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

const isManager = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a manager');
  }
};

module.exports = { protect, isAdmin, isManager };
`,
    'errorHandler.js': `
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
`
  },
  dbConfig: {
    'db.js': `
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected: ' + conn.connection.host);
  } catch (error) {
    console.error('Error: ' + error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
`
  }
};

const writeFiles = (dir, filesObj) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const [filename, content] of Object.entries(filesObj)) {
    fs.writeFileSync(path.join(dir, filename), content.trim());
  }
};

writeFiles(path.join(__dirname, 'models'), models);
writeFiles(path.join(__dirname, 'middleware'), ObjectUtils.middlewares);
writeFiles(path.join(__dirname, 'config'), ObjectUtils.dbConfig);

console.log('Base backend files generated successfully.');
