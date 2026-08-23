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
const Sale = require('../models/Sale');
const Repair = require('../models/Repair');

const getCustomerHistory = asyncHandler(async (req, res) => {
  const sales = await Sale.find({ customer: req.params.id }).populate('items.product', 'name');
  const repairs = await Repair.find({ customer: req.params.id });
  res.json({ sales, repairs });
});
module.exports.getCustomerHistory = getCustomerHistory;
