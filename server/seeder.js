const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    const adminUser = {
      name: 'Admin User',
      email: 'admin@zeeshamobile.com',
      password: 'password123',
      role: 'admin',
    };
    await User.create(adminUser);
    console.log('Data Imported - Default Admin created (admin@zeeshamobile.com / password123)');
    process.exit();
  } catch (error) {
    console.error('Error: ' + error.message);
    process.exit(1);
  }
};

importData();
