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