const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, 'server');

// 1. Settings Update (Req 4)
let settingModel = fs.readFileSync(path.join(serverDir, 'models', 'Setting.js'), 'utf8');
if (!settingModel.includes('currency:')) {
  settingModel = settingModel.replace("shopLogo: { type: String, default: '' }", "shopLogo: { type: String, default: '' },\n  currency: { type: String, default: '$' },\n  invoiceFooter: { type: String, default: 'Thank you for your business!' }");
  fs.writeFileSync(path.join(serverDir, 'models', 'Setting.js'), settingModel);
}

let settingController = fs.readFileSync(path.join(serverDir, 'controllers', 'settingController.js'), 'utf8');
if (!settingController.includes('settings.currency =')) {
  settingController = settingController.replace(
    "settings.shopLogo = req.body.shopLogo !== undefined ? req.body.shopLogo : settings.shopLogo;",
    "settings.shopLogo = req.body.shopLogo !== undefined ? req.body.shopLogo : settings.shopLogo;\n  settings.currency = req.body.currency || settings.currency;\n  settings.invoiceFooter = req.body.invoiceFooter || settings.invoiceFooter;"
  );
  fs.writeFileSync(path.join(serverDir, 'controllers', 'settingController.js'), settingController);
}

// 2. Suppliers Backend (Req 1)
const supplierController = `
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
`;
fs.writeFileSync(path.join(serverDir, 'controllers', 'supplierController.js'), supplierController.trim());

const supplierRoutes = `
const express = require('express');
const router = express.Router();
const { getSuppliers, addSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect, isManagerOrAdmin } = require('../middleware/authMiddleware');

router.route('/').get(protect, isManagerOrAdmin, getSuppliers).post(protect, isManagerOrAdmin, addSupplier);
router.route('/:id').put(protect, isManagerOrAdmin, updateSupplier).delete(protect, isManagerOrAdmin, deleteSupplier);

module.exports = router;
`;
fs.writeFileSync(path.join(serverDir, 'routes', 'supplierRoutes.js'), supplierRoutes.trim());

// 3. Customer History Endpoint (Req 2)
let customerController = fs.readFileSync(path.join(serverDir, 'controllers', 'customerController.js'), 'utf8');
if (!customerController.includes('getCustomerHistory')) {
  customerController += `
const Sale = require('../models/Sale');
const Repair = require('../models/Repair');

const getCustomerHistory = asyncHandler(async (req, res) => {
  const sales = await Sale.find({ customer: req.params.id }).populate('items.product', 'name');
  const repairs = await Repair.find({ customer: req.params.id });
  res.json({ sales, repairs });
});
module.exports.getCustomerHistory = getCustomerHistory;
`;
  fs.writeFileSync(path.join(serverDir, 'controllers', 'customerController.js'), customerController);
  
  let customerRoutes = fs.readFileSync(path.join(serverDir, 'routes', 'customerRoutes.js'), 'utf8');
  customerRoutes = customerRoutes.replace(
    "const { getCustomers, addCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');",
    "const { getCustomers, addCustomer, updateCustomer, deleteCustomer, getCustomerHistory } = require('../controllers/customerController');"
  );
  customerRoutes += `\nrouter.route('/:id/history').get(protect, getCustomerHistory);`;
  fs.writeFileSync(path.join(serverDir, 'routes', 'customerRoutes.js'), customerRoutes);
}

// 4. Update Server.js for supplier routes
let serverJs = fs.readFileSync(path.join(serverDir, 'server.js'), 'utf8');
if (!serverJs.includes('supplierRoutes')) {
  serverJs = serverJs.replace("app.use('/api/products'", "app.use('/api/suppliers', require('./routes/supplierRoutes'));\napp.use('/api/products'");
  fs.writeFileSync(path.join(serverDir, 'server.js'), serverJs);
}

console.log('Backend requirements 1, 2, 4 added successfully.');
