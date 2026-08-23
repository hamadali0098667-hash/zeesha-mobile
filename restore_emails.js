const fs = require('fs');
const path = require('path');

const root = path.join(__dirname);
const serverPath = path.join(root, 'server');
const clientPath = path.join(root, 'client', 'src');

// 1. Add email logic back to saleController.js
const saleCtrlFile = path.join(serverPath, 'controllers', 'saleController.js');
let saleContent = fs.readFileSync(saleCtrlFile, 'utf8');
if (!saleContent.includes('sendEmail = require')) {
  saleContent = saleContent.replace(
    "const Product = require('../models/Product');",
    "const Product = require('../models/Product');\nconst Customer = require('../models/Customer');\nconst sendEmail = require('../utils/sendEmail');"
  );
  const emailLogic = `
  // Decrease stock
  for (const item of items) {
    const product = await Product.findById(item.product);
    product.stockQty -= item.quantity;
    await product.save();
  }

  // Send Email Receipt if customer has email
  if (customer) {
    try {
      const custData = await Customer.findById(customer);
      if (custData && custData.email) {
        const populatedSale = await Sale.findById(createdSale._id).populate('items.product', 'name');
        let itemsHtml = '<table style="width:100%; border-collapse: collapse; margin-top:10px;"><tr><th style="border-bottom:1px solid #ddd; text-align:left; padding:8px;">Item</th><th style="border-bottom:1px solid #ddd; text-align:center; padding:8px;">Qty</th><th style="border-bottom:1px solid #ddd; text-align:right; padding:8px;">Price</th></tr>';
        populatedSale.items.forEach(i => {
          itemsHtml += \`<tr><td style="padding:8px; border-bottom:1px solid #eee;">\${i.product ? i.product.name : 'Unknown Product'}</td><td style="text-align:center; padding:8px; border-bottom:1px solid #eee;">\${i.quantity}</td><td style="text-align:right; padding:8px; border-bottom:1px solid #eee;">$\${i.price}</td></tr>\`;
        });
        itemsHtml += \`<tr><td colspan="2" style="text-align:right; font-weight:bold; padding:8px;">Total:</td><td style="text-align:right; font-weight:bold; padding:8px;">$\${total}</td></tr></table>\`;

        const message = \`
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Zeesha Mobile</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.8;">Thank you for your purchase!</p>
            </div>
            <div style="padding: 20px;">
              <p>Dear <strong>\${custData.name}</strong>,</p>
              <p>Here is the digital receipt for your recent purchase at Zeesha Mobile.</p>
              \${itemsHtml}
              <p style="margin-top: 30px; text-align: center; color: #777; font-size: 12px;">We hope to see you again soon!</p>
            </div>
          </div>
        \`;
        sendEmail({ email: custData.email, subject: 'Your Purchase Receipt - Zeesha Mobile', message }).catch(e => console.error(e));
      }
    } catch(err) {
      console.error(err);
    }
  }

  res.status(201).json(createdSale);
`;
  saleContent = saleContent.replace(
    /  \/\/ Decrease stock[\s\S]*?res\.status\(201\)\.json\(createdSale\);/,
    emailLogic.trim()
  );
  fs.writeFileSync(saleCtrlFile, saleContent);
}

// 2. Add email to Customers.jsx
const customersFile = path.join(clientPath, 'pages', 'Customers.jsx');
let custContent = fs.readFileSync(customersFile, 'utf8');
if (!custContent.includes("email: ''")) {
  custContent = custContent.replace(
    "const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });",
    "const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });"
  );
  custContent = custContent.replace(
    "setNewCustomer({ name: '', phone: '', address: '' });",
    "setNewCustomer({ name: '', phone: '', email: '', address: '' });"
  );
  custContent = custContent.replace(
    '<input required type="text" placeholder="Phone Number" className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={newCustomer.phone} onChange={e=>setNewCustomer({...newCustomer, phone: e.target.value})} />',
    '<input required type="text" placeholder="Phone Number" className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={newCustomer.phone} onChange={e=>setNewCustomer({...newCustomer, phone: e.target.value})} />\n            <input type="email" placeholder="Email Address (For E-Receipts)" className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={newCustomer.email} onChange={e=>setNewCustomer({...newCustomer, email: e.target.value})} />'
  );
  custContent = custContent.replace(
    '<td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{c.phone}</td>',
    '<td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{c.phone}<br/><span className="text-xs text-indigo-500">{c.email}</span></td>'
  );
  fs.writeFileSync(customersFile, custContent);
}

// 3. Add email to POS.jsx
const posFile = path.join(clientPath, 'pages', 'POS.jsx');
let posContent = fs.readFileSync(posFile, 'utf8');
if (!posContent.includes("email: ''")) {
  posContent = posContent.replace(
    "const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });",
    "const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });"
  );
  posContent = posContent.replace(
    "setNewCustomer({ name: '', phone: '', address: '' });",
    "setNewCustomer({ name: '', phone: '', email: '', address: '' });"
  );
  posContent = posContent.replace(
    '<input required type="text" placeholder="Phone" className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg mb-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" value={newCustomer.phone} onChange={e=>setNewCustomer({...newCustomer, phone: e.target.value})} />',
    '<input required type="text" placeholder="Phone" className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg mb-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" value={newCustomer.phone} onChange={e=>setNewCustomer({...newCustomer, phone: e.target.value})} />\n                  <input type="email" placeholder="Email (For Receipt)" className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg mb-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" value={newCustomer.email} onChange={e=>setNewCustomer({...newCustomer, email: e.target.value})} />'
  );
  fs.writeFileSync(posFile, posContent);
}

console.log('Done restoring POS emails');
