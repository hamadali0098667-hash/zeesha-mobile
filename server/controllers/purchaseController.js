const asyncHandler = require('express-async-handler');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');

const getPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find({}).populate('supplier', 'name');
  res.json(purchases);
});

const createPurchase = asyncHandler(async (req, res) => {
  const { supplier, items, totalCost } = req.body;
  if (!items || items.length === 0) {
    res.status(400); throw new Error('No purchase items');
  }

  const purchase = new Purchase({ supplier, items, totalCost });
  const createdPurchase = await purchase.save();

  // Increase stock
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stockQty += item.quantity;
      await product.save();
    }
  }

  res.status(201).json(createdPurchase);
});

module.exports = { getPurchases, createPurchase };