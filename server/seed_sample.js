const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');
const Customer = require('./models/Customer');

dotenv.config();
connectDB();

const importSampleData = async () => {
  try {
    await Product.deleteMany();
    await Supplier.deleteMany();
    await Customer.deleteMany();

    const suppliers = await Supplier.insertMany([
      { name: 'Apple Distributions Inc.', contact: '+1-800-MY-APPLE', address: 'Cupertino, CA' },
      { name: 'Samsung Global Supplies', contact: '+82-2-2053-3000', address: 'Seoul, South Korea' },
      { name: 'AliBaba Wholesale', contact: '+86-571-8502-2088', address: 'Hangzhou, China' }
    ]);

    const customers = await Customer.insertMany([
      { name: 'Ali Khan', phone: '0300-1234567', address: 'Karachi, Pakistan' },
      { name: 'John Doe', phone: '0333-9876543', address: 'Lahore, Pakistan' },
      { name: 'Ayesha Tariq', phone: '0311-5555555', address: 'Islamabad, Pakistan' }
    ]);

    const products = await Product.insertMany([
      { name: 'iPhone 15 Pro Max', brand: 'Apple', model: '256GB Titanium', imeiSku: 'IMEI-84739284739', category: 'Smartphones', costPrice: 1000, salePrice: 1199, stockQty: 15, lowStockThreshold: 5 },
      { name: 'iPhone 14', brand: 'Apple', model: '128GB Midnight', imeiSku: 'IMEI-12384738291', category: 'Smartphones', costPrice: 700, salePrice: 799, stockQty: 8, lowStockThreshold: 5 },
      { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', model: '512GB Phantom Black', imeiSku: 'IMEI-99887766554', category: 'Smartphones', costPrice: 1100, salePrice: 1299, stockQty: 10, lowStockThreshold: 3 },
      { name: 'Samsung Galaxy A54', brand: 'Samsung', model: '128GB Awesome Graphite', imeiSku: 'IMEI-55443322110', category: 'Smartphones', costPrice: 350, salePrice: 449, stockQty: 25, lowStockThreshold: 10 },
      { name: 'AirPods Pro (2nd Gen)', brand: 'Apple', model: 'MagSafe USB-C', imeiSku: 'SKU-APP-001', category: 'Accessories', costPrice: 180, salePrice: 249, stockQty: 30, lowStockThreshold: 5 },
      { name: 'Galaxy Buds 2 Pro', brand: 'Samsung', model: 'Graphite', imeiSku: 'SKU-SAM-002', category: 'Accessories', costPrice: 120, salePrice: 179, stockQty: 20, lowStockThreshold: 5 },
      { name: 'Anker 20W Fast Charger', brand: 'Anker', model: 'PowerPort III', imeiSku: 'SKU-ANK-003', category: 'Accessories', costPrice: 10, salePrice: 25, stockQty: 50, lowStockThreshold: 15 },
      { name: 'Spigen Tough Armor Case (S24)', brand: 'Spigen', model: 'Black', imeiSku: 'SKU-SPI-004', category: 'Accessories', costPrice: 15, salePrice: 35, stockQty: 40, lowStockThreshold: 10 }
    ]);

    console.log('Sample Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error: ' + error.message);
    process.exit(1);
  }
};

importSampleData();
