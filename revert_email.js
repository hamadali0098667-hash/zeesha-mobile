const fs = require('fs');
const path = require('path');

const root = path.join(__dirname);
const serverPath = path.join(root, 'server');
const clientPath = path.join(root, 'client', 'src');

// 1. Revert saleController.js
const saleCtrlFile = path.join(serverPath, 'controllers', 'saleController.js');
let saleContent = fs.readFileSync(saleCtrlFile, 'utf8');

// Remove sendEmail and Customer import
saleContent = saleContent.replace("const Customer = require('../models/Customer');\n", "");
saleContent = saleContent.replace("const sendEmail = require('../utils/sendEmail');\n", "");

// Remove the email block
const emailRegex = /\/\/ Send Email Receipt if customer has email[\s\S]*?res\.status\(201\)\.json\(createdSale\);/;
saleContent = saleContent.replace(emailRegex, "res.status(201).json(createdSale);");
fs.writeFileSync(saleCtrlFile, saleContent);

// 2. Revert Customers.jsx
const customersFile = path.join(clientPath, 'pages', 'Customers.jsx');
let custContent = fs.readFileSync(customersFile, 'utf8');

custContent = custContent.replace(
  "const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });",
  "const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });"
);
custContent = custContent.replace(
  "setNewCustomer({ name: '', phone: '', email: '', address: '' });",
  "setNewCustomer({ name: '', phone: '', address: '' });"
);
custContent = custContent.replace(
  /<input type="email" placeholder="Email Address \(For E-Receipts\)"[\s\S]*?\/>/,
  ""
);
custContent = custContent.replace(
  /<br\/>.*?<span className="text-xs text-indigo-500">\{c\.email\}<\/span>/,
  ""
);
fs.writeFileSync(customersFile, custContent);

// 3. Revert POS.jsx
const posFile = path.join(clientPath, 'pages', 'POS.jsx');
let posContent = fs.readFileSync(posFile, 'utf8');

posContent = posContent.replace(
  "const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });",
  "const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });"
);
posContent = posContent.replace(
  "setNewCustomer({ name: '', phone: '', email: '', address: '' });",
  "setNewCustomer({ name: '', phone: '', address: '' });"
);
posContent = posContent.replace(
  /<input type="email" placeholder="Email \(For Receipt\)"[\s\S]*?\/>/,
  ""
);
fs.writeFileSync(posFile, posContent);

console.log('Email logic removed.');
