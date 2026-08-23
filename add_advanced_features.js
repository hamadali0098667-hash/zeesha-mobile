const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'client', 'src');

const pages = {
  'Dashboard.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ salesToday: 0, totalStockValue: 0, lowStockItems: 0, salesTrend: [], topProducts: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/dashboard', { headers: { Authorization: \`Bearer \${user.token}\` }});
        setStats(data);
      } catch (error) { console.error(error); }
    };
    if (user.role === 'admin' || user.role === 'manager') fetchStats();
  }, [user]);

  const barData = {
    labels: stats.salesTrend?.map(s => s._id) || [],
    datasets: [{ label: 'Sales ($)', data: stats.salesTrend?.map(s => s.total) || [], backgroundColor: 'rgba(79, 70, 229, 0.6)' }]
  };

  const pieData = {
    labels: stats.topProducts?.map(p => p.name) || [],
    datasets: [{ data: stats.topProducts?.map(p => p.qty) || [], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'] }]
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      {(user.role === 'admin' || user.role === 'manager') ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
              <h3 className="text-gray-500 text-sm font-medium">Today's Sales</h3>
              <p className="text-3xl font-bold">$\${stats.salesToday}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <h3 className="text-gray-500 text-sm font-medium">Total Stock Value</h3>
              <p className="text-3xl font-bold">$\${stats.totalStockValue}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <h3 className="text-gray-500 text-sm font-medium">Low Stock Alerts</h3>
              <p className="text-3xl font-bold text-red-600">\${stats.lowStockItems}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-center font-bold mb-4">7-Day Sales Trend</h3>
                <Bar data={barData} />
             </div>
             <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                <h3 className="text-center font-bold mb-4">Top Selling Products</h3>
                <div className="w-64"><Pie data={pieData} /></div>
             </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl">Welcome, {user.name}!</h2>
          <p className="mt-2 text-gray-600">Use the sidebar to manage sales, customers, and repairs.</p>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
`,
  'NotFound.jsx': `
import { Link } from 'react-router-dom';
const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-full mt-20">
    <h1 className="text-6xl font-bold text-gray-800">404</h1>
    <p className="text-xl mt-4 text-gray-600">Page Not Found</p>
    <Link to="/" className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded">Go Home</Link>
  </div>
);
export default NotFound;
`,
  'POS.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { jsPDF } from 'jspdf';

const POS = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    const { data } = await axios.get('http://localhost:5000/api/products', { headers: { Authorization: \`Bearer \${user.token}\` }});
    setProducts(data);
  };

  const fetchCustomers = async () => {
    const { data } = await axios.get('http://localhost:5000/api/customers', { headers: { Authorization: \`Bearer \${user.token}\` }});
    setCustomers(data);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const addToCart = (product) => {
    const exist = cart.find(x => x.product === product._id);
    if (exist) {
      if (product.stockQty >= exist.quantity + 1) {
        setCart(cart.map(x => x.product === product._id ? { ...exist, quantity: exist.quantity + 1 } : x));
      } else { showToast('Insufficient stock!'); }
    } else {
      if (product.stockQty >= 1) {
        setCart([...cart, { product: product._id, name: product.name, salePrice: product.salePrice, quantity: 1 }]);
      } else { showToast('Out of stock!'); }
    }
  };

  const removeFromCart = (id) => setCart(cart.filter(x => x.product !== id));

  const subTotal = cart.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
  const tax = subTotal * 0.05; // 5% tax example
  const total = subTotal + tax;

  const generateInvoice = (saleData, customerName) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Zeesha Mobile - Invoice', 20, 20);
    doc.setFontSize(12);
    doc.text(\`Date: \${new Date().toLocaleDateString()}\`, 20, 30);
    doc.text(\`Customer: \${customerName || 'Walk-in'}\`, 20, 40);
    doc.text(\`Payment Method: \${saleData.paymentMethod}\`, 20, 50);
    doc.text('Items:', 20, 60);
    let y = 70;
    cart.forEach(item => {
      doc.text(\`- \${item.name} (x\${item.quantity}) : $\${item.salePrice * item.quantity}\`, 20, y);
      y += 10;
    });
    doc.text(\`Subtotal: $\${saleData.subTotal}\`, 20, y + 10);
    doc.text(\`Tax: $\${saleData.tax}\`, 20, y + 20);
    doc.setFontSize(14);
    doc.text(\`Total: $\${saleData.total}\`, 20, y + 30);
    doc.save('invoice.pdf');
  };

  const handleCheckout = async () => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/sales', {
        customer: selectedCustomer || null, items: cart, subTotal, tax, total, paymentMethod
      }, { headers: { Authorization: \`Bearer \${user.token}\` }});
      
      const custName = customers.find(c => c._id === selectedCustomer)?.name;
      generateInvoice(data, custName);
      showToast('Sale Completed! Invoice downloaded.');
      setCart([]); fetchProducts(); setSelectedCustomer('');
    } catch (err) { showToast(err.response?.data?.message || 'Error processing sale'); }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.imeiSku?.includes(search));

  return (
    <div className="flex h-[85vh] gap-4 relative">
      {toast && <div className="absolute top-0 right-0 bg-gray-800 text-white px-4 py-2 rounded shadow z-50">{toast}</div>}
      <div className="flex-1 bg-white p-4 shadow rounded flex flex-col">
        <h2 className="text-xl mb-4 font-bold">Products</h2>
        <input type="text" placeholder="Search product / IMEI..." className="border p-2 mb-4 w-full rounded" value={search} onChange={e=>setSearch(e.target.value)} />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
          {filtered.map(p => (
            <div key={p._id} className={\`border p-4 rounded cursor-pointer transition \${p.stockQty > 0 ? 'hover:shadow-md hover:border-indigo-400' : 'opacity-50 bg-gray-100'}\`} onClick={() => addToCart(p)}>
              <h3 className="font-semibold text-gray-800 truncate">{p.name}</h3>
              <p className="text-sm text-gray-500">IMEI/SKU: {p.imeiSku}</p>
              <div className="flex justify-between mt-2">
                <span className="font-bold text-indigo-600">$\${p.salePrice}</span>
                <span className="text-sm">Stock: {p.stockQty}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-1/3 min-w-[300px] bg-gray-50 border p-4 shadow rounded flex flex-col">
        <h2 className="text-xl mb-4 font-bold text-gray-800">Current Bill</h2>
        <div className="flex-1 overflow-y-auto border-b border-gray-200 mb-4 pr-2">
          {cart.length === 0 && <p className="text-center text-gray-500 mt-10">Cart is empty</p>}
          {cart.map((item, index) => (
            <div key={index} className="flex flex-col bg-white p-2 rounded shadow-sm mb-2 relative group">
              <span className="font-medium">{item.name}</span>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Qty: {item.quantity} x $\${item.salePrice}</span>
                <span className="font-bold">$\${item.salePrice * item.quantity}</span>
              </div>
              <button onClick={() => removeFromCart(item.product)} className="absolute top-2 right-2 text-red-500 text-xs hidden group-hover:block">X</button>
            </div>
          ))}
        </div>
        <div className="mb-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500">Customer</label>
            <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="w-full border p-2 rounded">
              <option value="">Walk-in Customer</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Payment</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full border p-2 rounded">
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
        </div>
        <div className="border-t pt-3 mb-4 space-y-1 text-gray-700">
          <div className="flex justify-between"><span>Subtotal:</span><span>$\${subTotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Tax (5%):</span><span>$\${tax.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-xl text-gray-900 mt-2">
            <span>Total:</span><span>$\${total.toFixed(2)}</span>
          </div>
        </div>
        <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow">
          Complete Sale & Print Invoice
        </button>
      </div>
    </div>
  );
};
export default POS;
`,
  'Repairs.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Repairs = () => {
  const { user } = useContext(AuthContext);
  const [repairs, setRepairs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRepair, setNewRepair] = useState({ customer: '', deviceDetails: '', issueDescription: '', estimatedCost: 0 });

  useEffect(() => {
    fetchRepairs();
    fetchCustomers();
  }, []);

  const fetchRepairs = async () => {
    const { data } = await axios.get('http://localhost:5000/api/repairs', { headers: { Authorization: \`Bearer \${user.token}\` }});
    setRepairs(data);
  };
  const fetchCustomers = async () => {
    const { data } = await axios.get('http://localhost:5000/api/customers', { headers: { Authorization: \`Bearer \${user.token}\` }});
    setCustomers(data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/repairs', newRepair, { headers: { Authorization: \`Bearer \${user.token}\` }});
      setShowAddForm(false);
      fetchRepairs();
    } catch (err) { alert('Error adding repair'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(\`http://localhost:5000/api/repairs/\${id}\`, { status }, { headers: { Authorization: \`Bearer \${user.token}\` }});
      fetchRepairs();
    } catch (err) { alert('Error updating status'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Repairs & Service Tracking</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-indigo-600 text-white px-4 py-2 rounded">
          {showAddForm ? 'Cancel' : 'Add Repair Job'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white p-4 shadow rounded mb-6 grid grid-cols-2 gap-4">
          <select required className="border p-2" onChange={e => setNewRepair({...newRepair, customer: e.target.value})}>
            <option value="">Select Customer</option>
            {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input required type="text" placeholder="Device (e.g. iPhone 13 Pro)" className="border p-2" onChange={e => setNewRepair({...newRepair, deviceDetails: e.target.value})} />
          <input required type="text" placeholder="Issue Description" className="border p-2" onChange={e => setNewRepair({...newRepair, issueDescription: e.target.value})} />
          <input required type="number" placeholder="Estimated Cost" className="border p-2" onChange={e => setNewRepair({...newRepair, estimatedCost: e.target.value})} />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded col-span-2">Save Repair Job</button>
        </form>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {repairs.length === 0 && <p className="p-4 text-center">No repair jobs found.</p>}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device & Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {repairs.map(r => (
              <tr key={r._id}>
                <td className="px-6 py-4">{r.customer?.name} ({r.customer?.phone})</td>
                <td className="px-6 py-4">{r.deviceDetails} <br/><span className="text-sm text-gray-500">{r.issueDescription}</span></td>
                <td className="px-6 py-4">
                  <select value={r.status} onChange={(e) => handleStatusChange(r._id, e.target.value)}
                    className={\`border rounded p-1 text-sm font-semibold \${r.status === 'delivered' ? 'bg-gray-200 text-gray-700' : r.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}\`}>
                    <option value="received">Received</option>
                    <option value="in-progress">In-Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
                <td className="px-6 py-4">Est: $\${r.estimatedCost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Repairs;
`,
  'Customers.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Customers = () => {
  const { user } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    const { data } = await axios.get('http://localhost:5000/api/customers', { headers: { Authorization: \`Bearer \${user.token}\` }});
    setCustomers(data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/customers', formData, { headers: { Authorization: \`Bearer \${user.token}\` }});
      setShowAdd(false);
      setFormData({name:'', phone:'', address:''});
      fetchCustomers();
    } catch(err) { alert('Error adding customer'); }
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Customers Directory</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-indigo-600 text-white px-4 py-2 rounded">Add Customer</button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white p-4 shadow rounded mb-6 flex gap-4">
          <input required type="text" placeholder="Name" className="border p-2 flex-1" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
          <input required type="text" placeholder="Phone" className="border p-2 flex-1" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} />
          <input type="text" placeholder="Address" className="border p-2 flex-1" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
        </form>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {customers.map(c => (
            <li key={c._id} className="px-6 py-4 flex justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{c.name}</h3>
                <p className="text-gray-600">{c.phone}</p>
              </div>
              <div className="text-right text-gray-500 text-sm">
                <p>{c.address || 'No Address'}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default Customers;
`
};

const writeFiles = (dir, filesObj) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const [filename, content] of Object.entries(filesObj)) {
    fs.writeFileSync(path.join(dir, filename), content.trim());
  }
};

writeFiles(path.join(srcPath, 'pages'), pages);
console.log('Advanced features applied to Dashboard, POS, Repairs, Customers');
