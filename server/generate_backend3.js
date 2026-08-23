const fs = require('fs');
const path = require('path');

const controllers = {
  'supplierController.js': `
const asyncHandler = require('express-async-handler');
const Supplier = require('../models/Supplier');

const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({});
  res.json(suppliers);
});

const createSupplier = asyncHandler(async (req, res) => {
  const supplier = new Supplier(req.body);
  const createdSupplier = await supplier.save();
  res.status(201).json(createdSupplier);
});

module.exports = { getSuppliers, createSupplier };
`,
  'purchaseController.js': `
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
`,
  'customerController.js': `
const asyncHandler = require('express-async-handler');
const Customer = require('../models/Customer');

const getCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find({});
  res.json(customers);
});

const createCustomer = asyncHandler(async (req, res) => {
  const customer = new Customer(req.body);
  const createdCustomer = await customer.save();
  res.status(201).json(createdCustomer);
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (customer) {
    Object.assign(customer, req.body);
    res.json(await customer.save());
  } else {
    res.status(404); throw new Error('Customer not found');
  }
});

module.exports = { getCustomers, createCustomer, updateCustomer };
`,
  'repairController.js': `
const asyncHandler = require('express-async-handler');
const Repair = require('../models/Repair');

const getRepairs = asyncHandler(async (req, res) => {
  const repairs = await Repair.find({}).populate('customer', 'name phone');
  res.json(repairs);
});

const createRepair = asyncHandler(async (req, res) => {
  const repair = new Repair(req.body);
  const createdRepair = await repair.save();
  res.status(201).json(createdRepair);
});

const updateRepairStatus = asyncHandler(async (req, res) => {
  const repair = await Repair.findById(req.params.id);
  if (repair) {
    repair.status = req.body.status || repair.status;
    repair.finalCost = req.body.finalCost || repair.finalCost;
    repair.technicianNotes = req.body.technicianNotes || repair.technicianNotes;
    res.json(await repair.save());
  } else {
    res.status(404); throw new Error('Repair job not found');
  }
});

module.exports = { getRepairs, createRepair, updateRepairStatus };
`,
  'dashboardController.js': `
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);

  const salesToday = await Sale.aggregate([
    { $match: { date: { $gte: today } } },
    { $group: { _id: null, totalSales: { $sum: '$total' } } }
  ]);

  const products = await Product.find({});
  const totalStockValue = products.reduce((acc, p) => acc + (p.stockQty * p.costPrice), 0);
  const lowStockItems = products.filter(p => p.stockQty <= p.lowStockThreshold).length;

  res.json({
    salesToday: salesToday.length > 0 ? salesToday[0].totalSales : 0,
    totalStockValue,
    lowStockItems
  });
});

module.exports = { getDashboardStats };
`
};

const routes = {
  'authRoutes.js': `
const express = require('express');
const router = express.Router();
const { loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;
`,
  'staffRoutes.js': `
const express = require('express');
const router = express.Router();
const { getStaff, createStaff, updateStaff } = require('../controllers/staffController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/').get(protect, isAdmin, getStaff).post(protect, isAdmin, createStaff);
router.route('/:id').put(protect, isAdmin, updateStaff);

module.exports = router;
`,
  'productRoutes.js': `
const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, isManager, isAdmin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProducts).post(protect, isManager, createProduct);
router.route('/:id').put(protect, isManager, updateProduct).delete(protect, isAdmin, deleteProduct);

module.exports = router;
`,
  'saleRoutes.js': `
const express = require('express');
const router = express.Router();
const { createSale, getSales } = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createSale).get(protect, getSales);

module.exports = router;
`,
  'supplierRoutes.js': `
const express = require('express');
const router = express.Router();
const { getSuppliers, createSupplier } = require('../controllers/supplierController');
const { protect, isManager } = require('../middleware/authMiddleware');

router.route('/').get(protect, isManager, getSuppliers).post(protect, isManager, createSupplier);

module.exports = router;
`,
  'purchaseRoutes.js': `
const express = require('express');
const router = express.Router();
const { getPurchases, createPurchase } = require('../controllers/purchaseController');
const { protect, isManager } = require('../middleware/authMiddleware');

router.route('/').get(protect, isManager, getPurchases).post(protect, isManager, createPurchase);

module.exports = router;
`,
  'customerRoutes.js': `
const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer, updateCustomer } = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCustomers).post(protect, createCustomer);
router.route('/:id').put(protect, updateCustomer);

module.exports = router;
`,
  'repairRoutes.js': `
const express = require('express');
const router = express.Router();
const { getRepairs, createRepair, updateRepairStatus } = require('../controllers/repairController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getRepairs).post(protect, createRepair);
router.route('/:id').put(protect, updateRepairStatus);

module.exports = router;
`,
  'dashboardRoutes.js': `
const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, isManager } = require('../middleware/authMiddleware');

router.route('/').get(protect, isManager, getDashboardStats);

module.exports = router;
`
};

const serverJs = `
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/repairs', require('./routes/repairRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.get('/', (req, res) => {
  res.send('Zeesha Mobile API is running...');
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
`;

const envExample = `
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/zeesha_mobile?retryWrites=true&w=majority
JWT_SECRET=supersecretjwtkey123
`;

const writeFiles = (dir, filesObj) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const [filename, content] of Object.entries(filesObj)) {
    fs.writeFileSync(path.join(dir, filename), content.trim());
  }
};

writeFiles(path.join(__dirname, 'controllers'), controllers);
writeFiles(path.join(__dirname, 'routes'), routes);
fs.writeFileSync(path.join(__dirname, 'server.js'), serverJs.trim());
fs.writeFileSync(path.join(__dirname, '.env.example'), envExample.trim());
fs.writeFileSync(path.join(__dirname, '.env'), envExample.trim());

console.log('Rest of backend files generated successfully.');
