const asyncHandler = require('express-async-handler');
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// @desc    Create a sale
// @route   POST /api/sales
// @access  Private
const createSale = asyncHandler(async (req, res) => {
  const { customer, items, subTotal, tax,
      taxRate: taxRate || 0,
      discount: discount || 0, total, paymentMethod } = req.body;

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
      taxRate: taxRate || 0,
      discount: discount || 0,
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
