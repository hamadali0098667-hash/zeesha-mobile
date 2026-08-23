const fs = require('fs');
const path = require('path');

const controllers = {
  'authController.js': `
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && user.isActive && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password / Account deactivated');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { loginUser, getUserProfile };
`,
  'staffController.js': `
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private/Admin
const getStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({}).select('-password');
  res.json(staff);
});

// @desc    Create a staff member
// @route   POST /api/staff
// @access  Private/Admin
const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password, role });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private/Admin
const updateStaff = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    if (req.body.password) {
      user.password = req.body.password;
    }
    if (req.body.isActive !== undefined) {
        user.isActive = req.body.isActive;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { getStaff, createStaff, updateStaff };
`,
  'productController.js': `
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Manager
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product(req.body);
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Manager
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    Object.assign(product, req.body);
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await Product.deleteOne({_id: product._id});
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
`,
  'saleController.js': `
const asyncHandler = require('express-async-handler');
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// @desc    Create a sale
// @route   POST /api/sales
// @access  Private
const createSale = asyncHandler(async (req, res) => {
  const { customer, items, subTotal, tax, total, paymentMethod } = req.body;

  if (items && items.length === 0) {
    res.status(400);
    throw new Error('No sale items');
  }

  // Validate stock
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    if (product.stockQty < item.quantity) {
        res.status(400);
        throw new Error('Insufficient stock for ' + product.name);
    }
  }

  const sale = new Sale({
    customer: customer || null,
    items,
    subTotal,
    tax,
    total,
    paymentMethod,
    cashier: req.user._id
  });

  const createdSale = await sale.save();

  // Decrease stock
  for (const item of items) {
    const product = await Product.findById(item.product);
    product.stockQty -= item.quantity;
    await product.save();
  }

  res.status(201).json(createdSale);
});

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
const getSales = asyncHandler(async (req, res) => {
  const sales = await Sale.find({}).populate('cashier', 'name').populate('customer', 'name');
  res.json(sales);
});

module.exports = { createSale, getSales };
`
};

const writeFiles = (dir, filesObj) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const [filename, content] of Object.entries(filesObj)) {
    fs.writeFileSync(path.join(dir, filename), content.trim());
  }
};

writeFiles(path.join(__dirname, 'controllers'), controllers);
console.log('Controllers generated successfully.');
