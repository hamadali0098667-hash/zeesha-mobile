const asyncHandler = require('express-async-handler');
const Supplier = require('../models/Supplier');

const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({});
  res.json(suppliers);
});

const addSupplier = asyncHandler(async (req, res) => {
  const { name, contact, address } = req.body;
  const supplier = await Supplier.create({ name, contact, address });
  res.status(201).json(supplier);
});

const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(supplier);
});

const deleteSupplier = asyncHandler(async (req, res) => {
  await Supplier.findByIdAndDelete(req.params.id);
  res.json({ message: 'Supplier removed' });
});

module.exports = { getSuppliers, addSupplier, updateSupplier, deleteSupplier };