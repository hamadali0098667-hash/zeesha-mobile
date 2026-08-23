const fs = require('fs');

let controller = fs.readFileSync('server/controllers/customerController.js', 'utf-8');
controller = controller.replace(
  "module.exports = { getCustomers, createCustomer, updateCustomer };",
  "const deleteCustomer = asyncHandler(async (req, res) => {\n  const customer = await Customer.findById(req.params.id);\n  if (customer) {\n    await Customer.deleteOne({ _id: customer._id });\n    res.json({ message: 'Customer removed' });\n  } else {\n    res.status(404); throw new Error('Customer not found');\n  }\n});\n\nmodule.exports = { getCustomers, createCustomer, updateCustomer, deleteCustomer };"
);
fs.writeFileSync('server/controllers/customerController.js', controller);

let routes = fs.readFileSync('server/routes/customerRoutes.js', 'utf-8');
routes = routes.replace(
  "const { getCustomers, createCustomer, updateCustomer, getCustomerHistory } = require('../controllers/customerController');",
  "const { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomerHistory } = require('../controllers/customerController');"
);
routes = routes.replace(
  "router.route('/:id').put(protect, updateCustomer);",
  "router.route('/:id').put(protect, updateCustomer).delete(protect, deleteCustomer);"
);
fs.writeFileSync('server/routes/customerRoutes.js', routes);

console.log('Backend Customer routes updated!');
