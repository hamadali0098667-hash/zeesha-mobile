const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'client', 'src');

// 1. Suppliers.jsx
const suppliersCode = `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FaUserTie, FaPlus } from 'react-icons/fa';

const Suppliers = () => {
  const { user } = useContext(AuthContext);
  const [suppliers, setSuppliers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact: '', address: '' });

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    const { data } = await axios.get('http://localhost:5000/api/suppliers', { headers: { Authorization: \`Bearer \${user.token}\` }});
    setSuppliers(data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/suppliers', formData, { headers: { Authorization: \`Bearer \${user.token}\` }});
      setShowAdd(false); setFormData({name:'', contact:'', address:''});
      fetchSuppliers();
    } catch(err) { alert('Error adding supplier'); }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><FaUserTie className="text-indigo-600"/> Suppliers Directory</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors flex items-center gap-2"><FaPlus/> Add Supplier</button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-gray-800 p-6 shadow-md rounded-xl mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-100 dark:border-gray-700">
          <input required type="text" placeholder="Supplier Name" className="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-3 rounded-lg" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
          <input required type="text" placeholder="Contact No / Email" className="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-3 rounded-lg" value={formData.contact} onChange={e=>setFormData({...formData, contact: e.target.value})} />
          <input type="text" placeholder="Address" className="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-3 rounded-lg" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} />
          <div className="md:col-span-3 flex justify-end">
             <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold">Save Supplier</button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {suppliers.map(s => (
            <li key={s._id} className="p-5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{s.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">{s.contact}</p>
              </div>
              <div className="text-right text-gray-400 dark:text-gray-500 text-sm">
                <p>{s.address || 'No Address Provided'}</p>
              </div>
            </li>
          ))}
          {suppliers.length === 0 && <p className="p-6 text-center text-gray-500">No suppliers found.</p>}
        </ul>
      </div>
    </div>
  );
};
export default Suppliers;
`;
fs.writeFileSync(path.join(srcPath, 'pages', 'Suppliers.jsx'), suppliersCode.trim());

// 2. Customers.jsx with History
let customersCode = fs.readFileSync(path.join(srcPath, 'pages', 'Customers.jsx'), 'utf8');
customersCode = customersCode.replace(
  "return (",
  `
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [history, setHistory] = useState({ sales: [], repairs: [] });
  const [loadingHistory, setLoadingHistory] = useState(false);

  const viewHistory = async (id) => {
    setLoadingHistory(true);
    setSelectedCustomer(id);
    try {
      const { data } = await axios.get(\`http://localhost:5000/api/customers/\${id}/history\`, { headers: { Authorization: \`Bearer \${user.token}\` }});
      setHistory(data);
    } catch(err) { alert('Error fetching history'); }
    setLoadingHistory(false);
  };

  return (`
);

customersCode = customersCode.replace(
  "<h3 className=\"text-lg font-bold text-gray-800 dark:text-gray-200\">{c.name}</h3>",
  "<h3 className=\"text-lg font-bold text-indigo-600 hover:underline cursor-pointer\" onClick={() => viewHistory(c._id)}>{c.name}</h3>"
);

customersCode = customersCode.replace(
  "export default Customers;",
  `
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer History</h2>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-500 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            
            {loadingHistory ? <p className="text-center py-10">Loading...</p> : (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold bg-gray-100 dark:bg-gray-700 p-2 rounded text-gray-900 dark:text-white mb-3">Sales / Purchases</h3>
                  {history.sales.length === 0 ? <p className="text-sm text-gray-500">No purchases found.</p> : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 border dark:border-gray-700 rounded-lg">
                      {history.sales.map(s => (
                        <li key={s._id} className="p-3 text-sm flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{new Date(s.date).toLocaleDateString()}</span>
                          <span className="font-bold text-gray-900 dark:text-white">\${s.total}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold bg-gray-100 dark:bg-gray-700 p-2 rounded text-gray-900 dark:text-white mb-3">Repair Jobs</h3>
                  {history.repairs.length === 0 ? <p className="text-sm text-gray-500">No repairs found.</p> : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 border dark:border-gray-700 rounded-lg">
                      {history.repairs.map(r => (
                        <li key={r._id} className="p-3 text-sm flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{r.deviceDetails} ({r.issueDescription})</span>
                          <span className="font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase text-xs">{r.status}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
  `
);
customersCode += "\nexport default Customers;\n";
fs.writeFileSync(path.join(srcPath, 'pages', 'Customers.jsx'), customersCode);

// 3. Reports.jsx Update
const reportsCode = `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState('sales');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const salesRes = await axios.get('http://localhost:5000/api/sales', { headers: { Authorization: \`Bearer \${user.token}\` }});
      setSales(salesRes.data);
      const prodRes = await axios.get('http://localhost:5000/api/products', { headers: { Authorization: \`Bearer \${user.token}\` }});
      setProducts(prodRes.data);
    } catch(err) { console.error(err); }
  };

  const totalSales = sales.reduce((a, s) => a + s.total, 0);
  const totalStockValue = products.reduce((a, p) => a + (p.costPrice * p.stockQty), 0);
  const lowStockProducts = products.filter(p => p.stockQty <= p.lowStockThreshold);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Business Reports</h1>
      
      <div className="flex gap-4 mb-6">
        <button onClick={()=>setTab('sales')} className={\`px-4 py-2 rounded-lg font-bold transition-colors \${tab==='sales' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'}\`}>Sales Report</button>
        <button onClick={()=>setTab('stock')} className={\`px-4 py-2 rounded-lg font-bold transition-colors \${tab==='stock' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'}\`}>Stock & Inventory</button>
      </div>

      {tab === 'sales' && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Total Sales Volume: <span className="text-green-600">\${totalSales.toFixed(2)}</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Overview of all recorded transactions.</p>
          
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <tr><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Cashier</th><th className="p-3 text-right">Total</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {sales.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 text-gray-600 dark:text-gray-400">{new Date(s.date).toLocaleString()}</td>
                    <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{s.customer?.name || 'Walk-in'}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">{s.cashier?.name || 'Unknown'}</td>
                    <td className="p-3 text-right font-bold text-gray-900 dark:text-white">\${s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'stock' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Total Stock Value</h2>
            <p className="text-3xl font-black text-indigo-600">\${totalStockValue.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">Based on cost price of current inventory.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-red-100 dark:border-red-900/30">
            <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Low Stock Alerts</h2>
            {lowStockProducts.length === 0 ? <p className="text-gray-500">All stock levels are optimal.</p> : (
              <ul className="divide-y divide-red-100 dark:divide-red-900/30">
                {lowStockProducts.map(p => (
                  <li key={p._id} className="py-2 flex justify-between text-sm">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{p.name}</span>
                    <span className="text-red-600 font-bold">{p.stockQty} left</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Reports;
`;
fs.writeFileSync(path.join(srcPath, 'pages', 'Reports.jsx'), reportsCode.trim());

console.log('Frontend React pages for Req 1,2,3 generated.');
