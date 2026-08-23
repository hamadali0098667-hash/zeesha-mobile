const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, 'client', 'src');

// 1. UPDATE Customers.jsx
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

// 2. UPDATE POS.jsx
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

console.log('Frontend Email logic injected.');
