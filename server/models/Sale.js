const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, name: { type: String, required: true },
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
