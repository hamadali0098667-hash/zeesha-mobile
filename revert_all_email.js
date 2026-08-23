const fs = require('fs');
const path = require('path');

const root = path.join(__dirname);
const serverPath = path.join(root, 'server');
const clientPath = path.join(root, 'client', 'src');

// 1. Revert authController.js
const authCtrlFile = path.join(serverPath, 'controllers', 'authController.js');
const authCtrlCode = `const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (user.isActive === false) {
      res.status(401);
      throw new Error('Account has been deactivated');
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

module.exports = { loginUser };`;
fs.writeFileSync(authCtrlFile, authCtrlCode);

// 2. Revert authRoutes.js
const authRoutesFile = path.join(serverPath, 'routes', 'authRoutes.js');
const authRoutesCode = `const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');

router.post('/login', loginUser);

module.exports = router;`;
fs.writeFileSync(authRoutesFile, authRoutesCode);

// 3. Revert Login.jsx
const loginFile = path.join(clientPath, 'pages', 'Login.jsx');
const loginCode = `import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-2">Zeesha Mobile</h1>
          <p className="text-gray-500 dark:text-gray-400">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;`;
fs.writeFileSync(loginFile, loginCode);

// 4. Revert saleController.js
const saleCtrlFile = path.join(serverPath, 'controllers', 'saleController.js');
const saleCtrlCode = `const asyncHandler = require('express-async-handler');
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

module.exports = { createSale, getSales };`;
fs.writeFileSync(saleCtrlFile, saleCtrlCode);

// 5. Revert Customers.jsx and POS.jsx
const customersFile = path.join(clientPath, 'pages', 'Customers.jsx');
let custContent = fs.readFileSync(customersFile, 'utf8');
custContent = custContent.replace(
  "const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });",
  "const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });"
);
custContent = custContent.replace(
  "setNewCustomer({ name: '', phone: '', email: '', address: '' });",
  "setNewCustomer({ name: '', phone: '', address: '' });"
);
custContent = custContent.replace(
  /<input type="email" placeholder="Email Address \(For E-Receipts\)"[\s\S]*?\/>/,
  ""
);
custContent = custContent.replace(
  /<br\/>.*?<span className="text-xs text-indigo-500">\{c\.email\}<\/span>/,
  ""
);
fs.writeFileSync(customersFile, custContent);

const posFile = path.join(clientPath, 'pages', 'POS.jsx');
let posContent = fs.readFileSync(posFile, 'utf8');
posContent = posContent.replace(
  "const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });",
  "const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });"
);
posContent = posContent.replace(
  "setNewCustomer({ name: '', phone: '', email: '', address: '' });",
  "setNewCustomer({ name: '', phone: '', address: '' });"
);
posContent = posContent.replace(
  /<input type="email" placeholder="Email \(For Receipt\)"[\s\S]*?\/>/,
  ""
);
fs.writeFileSync(posFile, posContent);

console.log('Successfully removed all email logic and reverted to simple project.');
