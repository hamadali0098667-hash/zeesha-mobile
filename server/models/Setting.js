const mongoose = require('mongoose');
const settingSchema = new mongoose.Schema({
  shopName: { type: String, default: 'Zeesha Mobile' },
  shopLogo: { type: String, default: '' },
  currency: { type: String, default: '$' },
  invoiceFooter: { type: String, default: 'Thank you for your business!' },
  categories: { type: [String], default: ['Smartphones', 'Feature Phones', 'Accessories', 'Spare Parts'] }
}, { timestamps: true });
module.exports = mongoose.model('Setting', settingSchema);