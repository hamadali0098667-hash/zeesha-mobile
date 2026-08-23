const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');
const Customer = require('./models/Customer');
const Purchase = require('./models/Purchase');
const Sale = require('./models/Sale');
const Repair = require('./models/Repair');

dotenv.config();

const clearData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    await Supplier.deleteMany();
    await Customer.deleteMany();
    await Purchase.deleteMany();
    await Sale.deleteMany();
    await Repair.deleteMany();

    console.log('All business data wiped! Database is fresh and clean.');
    process.exit();
  } catch (error) {
    console.error('Error: ' + error.message);
    process.exit(1);
  }
};

clearData();
