const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './server/.env' });

const Product = require('./server/models/Product');
const Supplier = require('./server/models/Supplier');
const Customer = require('./server/models/Customer');
const Repair = require('./server/models/Repair');
const Purchase = require('./server/models/Purchase');
const Sale = require('./server/models/Sale');
const User = require('./server/models/User');

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'test' });
    console.log('Connected to MongoDB');

    // Fetch cashier user to use for sales
    const cashier = await User.findOne({ role: 'cashier' });
    if (!cashier) console.log('Warning: No cashier found for sale seeding');

    // 1. Seed Suppliers
    const suppliersData = [
      { name: 'Tech World', contact: '03001234567', email: 'contact@techworld.com', address: 'Hafeez Center, Lahore' },
      { name: 'Mobile Hub', contact: '03211234567', email: 'sales@mobilehub.pk', address: 'Saddar, Karachi' }
    ];
    let suppliers = await Supplier.insertMany(suppliersData);
    console.log('✅ Suppliers seeded');

    // 2. Seed Products
    const productsData = [
      { name: 'Samsung Galaxy A15', brand: 'Samsung', model: 'A15', imeiSku: 'IMEI-SA15-001', category: 'Smartphones', costPrice: 45000, salePrice: 52000, stockQty: 10, lowStockThreshold: 3, image: '' },
      { name: 'iPhone 13', brand: 'Apple', model: '13 (128GB)', imeiSku: 'IMEI-IP13-001', category: 'Smartphones', costPrice: 150000, salePrice: 175000, stockQty: 5, lowStockThreshold: 2, image: '' },
      { name: 'Xiaomi Redmi Note 13', brand: 'Xiaomi', model: 'Note 13', imeiSku: 'IMEI-XM13-001', category: 'Smartphones', costPrice: 55000, salePrice: 62000, stockQty: 15, lowStockThreshold: 5, image: '' },
      { name: 'Type-C Fast Charger', brand: 'Generic', model: '30W', imeiSku: 'SKU-CHG-001', category: 'Accessories', costPrice: 1500, salePrice: 2500, stockQty: 50, lowStockThreshold: 10, image: '' },
      { name: 'Wireless Earbuds Pro', brand: 'Audionic', model: 'Pro', imeiSku: 'SKU-EAR-001', category: 'Accessories', costPrice: 3500, salePrice: 5000, stockQty: 20, lowStockThreshold: 5, image: '' }
    ];
    let products = await Product.insertMany(productsData);
    console.log('✅ Products seeded');

    // 3. Seed Customers
    const customersData = [
      { name: 'Ali Khan', phone: '03019876543', email: 'ali@example.com', address: 'Model Town, Lahore' },
      { name: 'Ahmed Raza', phone: '03339876543', email: 'ahmed@example.com', address: 'DHA, Lahore' },
      { name: 'Usman Tariq', phone: '03459876543', email: 'usman@example.com', address: 'Gulberg, Lahore' }
    ];
    let customers = await Customer.insertMany(customersData);
    console.log('✅ Customers seeded');

    // 4. Seed Repairs
    const repairsData = [
      { customer: customers[0]._id, deviceDetails: 'iPhone 11', issueDescription: 'Screen replacement', status: 'completed', estimatedCost: 12000, finalCost: 12000, technicianNotes: 'Replaced with original LCD' },
      { customer: customers[1]._id, deviceDetails: 'Samsung S21', issueDescription: 'Battery issue, draining fast', status: 'in-progress', estimatedCost: 8000, finalCost: 0, technicianNotes: 'Awaiting new battery stock' },
      { customer: customers[2]._id, deviceDetails: 'Redmi Note 10', issueDescription: 'Charging port not working', status: 'received', estimatedCost: 2500, finalCost: 0, technicianNotes: '' }
    ];
    await Repair.insertMany(repairsData);
    console.log('✅ Repairs seeded');

    // 5. Seed a Purchase Workflow (increases stock)
    const purchaseData = {
      supplier: suppliers[0]._id,
      items: [
        { product: products[0]._id, quantity: 5, cost: products[0].costPrice },
        { product: products[3]._id, quantity: 20, cost: products[3].costPrice }
      ],
      totalCost: (5 * products[0].costPrice) + (20 * products[3].costPrice)
    };
    const pur = new Purchase(purchaseData);
    await pur.save();
    
    // increase stock (simulate controller logic)
    products[0].stockQty += 5;
    products[3].stockQty += 20;
    await products[0].save();
    await products[3].save();
    console.log('✅ Purchase workflow seeded');

    // 6. Seed a Sale Workflow (decreases stock)
    if (cashier) {
      const saleData = {
        customer: customers[0]._id,
        items: [
          { product: products[1]._id, name: products[1].name, quantity: 1, salePrice: products[1].salePrice },
          { product: products[4]._id, name: products[4].name, quantity: 2, salePrice: products[4].salePrice }
        ],
        subTotal: products[1].salePrice + (2 * products[4].salePrice),
        tax: 0,
        total: products[1].salePrice + (2 * products[4].salePrice),
        paymentMethod: 'Card',
        cashier: cashier._id
      };
      const sale = new Sale(saleData);
      await sale.save();
      
      // decrease stock
      products[1].stockQty -= 1;
      products[4].stockQty -= 2;
      await products[1].save();
      await products[4].save();
      console.log('✅ Sale workflow seeded');
    }

    console.log('--- ALL SAMPLE DATA SEEDED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
