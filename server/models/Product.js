const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: '' },
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