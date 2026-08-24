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

const deletePurchase = asyncHandler(async (req, res) => { const p = await Purchase.findById(req.params.id); if(p) { for(let i of p.items){ const prod = await Product.findById(i.product); if(prod){ prod.stockQty -= i.quantity; await prod.save(); } } await p.deleteOne(); res.json({message: 'Deleted'}); } else { res.status(404); throw new Error('Not found'); } }); const updatePurchase = asyncHandler(async (req, res) => { const p = await Purchase.findById(req.params.id); if(p) { for(let i of p.items){ const prod = await Product.findById(i.product); if(prod){ prod.stockQty -= i.quantity; await prod.save(); } } p.supplier = req.body.supplier || p.supplier; p.items = req.body.items || p.items; p.totalCost = req.body.totalCost || p.totalCost; await p.save(); for(let i of p.items){ const prod = await Product.findById(i.product); if(prod){ prod.stockQty += i.quantity; await prod.save(); } } res.json(p); } else { res.status(404); throw new Error('Not found'); } }); module.exports = { getPurchases, createPurchase, deletePurchase, updatePurchase };
