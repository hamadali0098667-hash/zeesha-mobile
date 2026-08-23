const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'client', 'src');

const components = {
  'Sidebar.jsx': `
import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaHome, FaBox, FaUsers, FaWrench, FaChartBar, FaCog, FaShoppingCart, FaMobileAlt, FaStore } from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <FaHome className="mr-3 text-lg" />, roles: ['admin', 'manager', 'cashier'] },
    { name: 'POS / Sales', path: '/pos', icon: <FaShoppingCart className="mr-3 text-lg" />, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Inventory', path: '/inventory', icon: <FaBox className="mr-3 text-lg" />, roles: ['admin', 'manager'] },
    { name: 'Purchases & Suppliers', path: '/purchases', icon: <FaStore className="mr-3 text-lg" />, roles: ['admin', 'manager'] },
    { name: 'Customers', path: '/customers', icon: <FaUsers className="mr-3 text-lg" />, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Repairs & Services', path: '/repairs', icon: <FaWrench className="mr-3 text-lg" />, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Sales Reports', path: '/reports', icon: <FaChartBar className="mr-3 text-lg" />, roles: ['admin', 'manager'] },
    { name: 'Settings & Staff', path: '/settings', icon: <FaCog className="mr-3 text-lg" />, roles: ['admin'] },
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-2xl transition-all duration-300">
      <div className="h-20 flex items-center justify-center border-b border-gray-700/50 bg-black/20">
        <FaMobileAlt className="text-3xl text-indigo-400 mr-3" />
        <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300 uppercase">Zeesha Mobile</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <nav className="space-y-2 px-4">
          {menuItems.map(item => {
            if (item.roles.includes(user?.role)) {
              return (
                <NavLink key={item.path} to={item.path} className={({isActive}) => \`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 \${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 translate-x-1' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}\`}>
                  {item.icon} {item.name}
                </NavLink>
              );
            }
            return null;
          })}
        </nav>
      </div>
      <div className="p-4 bg-gray-900/50 border-t border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{user?.name}</p>
            <p className="text-xs text-indigo-300 uppercase tracking-widest">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
`,
  'Topbar.jsx': `
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { FaSignOutAlt, FaBell } from 'react-icons/fa';

const Topbar = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 flex items-center justify-between px-8 z-10">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name.split(' ')[0]}! 👋</h2>
      </div>
      <div className="flex items-center space-x-6">
        <button className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
          <FaBell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-gray-200"></div>
        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold transition-colors duration-200">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </header>
  );
};
export default Topbar;
`
};

const pages = {
  'POS.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import { FaSearch, FaShoppingCart, FaTrash, FaCheckCircle, FaUserPlus, FaFileInvoiceDollar } from 'react-icons/fa';

const POS = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => { fetchProducts(); fetchCustomers(); }, []);

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
      } else { showToast('⚠️ Insufficient stock in inventory!'); }
    } else {
      if (product.stockQty >= 1) {
        setCart([...cart, { product: product._id, name: product.name, salePrice: product.salePrice, quantity: 1 }]);
      } else { showToast('⚠️ Item Out of stock!'); }
    }
  };

  const removeFromCart = (id) => setCart(cart.filter(x => x.product !== id));

  const subTotal = cart.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
  const tax = subTotal * 0.05; 
  const total = subTotal + tax;

  const generateInvoice = (saleData, customerName) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24); doc.text('ZEESHA MOBILE', 105, 20, null, null, 'center');
    doc.setFontSize(12); doc.setFont('helvetica', 'normal');
    doc.text('Official Sales Receipt', 105, 28, null, null, 'center');
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(10);
    doc.text(\`Date: \${new Date().toLocaleString()}\`, 20, 45);
    doc.text(\`Receipt #: \${saleData._id.substring(0,8).toUpperCase()}\`, 140, 45);
    doc.text(\`Customer: \${customerName || 'Walk-in Customer'}\`, 20, 52);
    doc.text(\`Payment: \${saleData.paymentMethod}\`, 140, 52);
    doc.text(\`Cashier: \${user.name}\`, 20, 59);
    
    doc.line(20, 65, 190, 65);
    doc.setFont('helvetica', 'bold');
    doc.text('Item Description', 20, 72);
    doc.text('Qty', 130, 72);
    doc.text('Price', 150, 72);
    doc.text('Amount', 175, 72);
    doc.line(20, 75, 190, 75);
    
    doc.setFont('helvetica', 'normal');
    let y = 82;
    cart.forEach(item => {
      doc.text(item.name.substring(0,40), 20, y);
      doc.text(item.quantity.toString(), 130, y);
      doc.text(\`$\${item.salePrice}\`, 150, y);
      doc.text(\`$\${item.salePrice * item.quantity}\`, 175, y);
      y += 8;
    });
    
    doc.line(120, y+5, 190, y+5);
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', 140, y+12); doc.text(\`$\${saleData.subTotal}\`, 175, y+12);
    doc.setFont('helvetica', 'normal');
    doc.text('Tax (5%):', 140, y+20); doc.text(\`$\${saleData.tax}\`, 175, y+20);
    
    doc.line(120, y+25, 190, y+25);
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 140, y+33); doc.text(\`$\${saleData.total}\`, 175, y+33);
    
    doc.setFontSize(10); doc.setFont('helvetica', 'italic');
    doc.text('Thank you for shopping at Zeesha Mobile!', 105, y+50, null, null, 'center');
    doc.text('Software developed by Zeesha Mobile Systems.', 105, y+55, null, null, 'center');
    
    doc.save(\`Receipt_\${saleData._id.substring(0,8)}.pdf\`);
  };

  const handleCheckout = async () => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/sales', {
        customer: selectedCustomer || null, items: cart, subTotal, tax, total, paymentMethod
      }, { headers: { Authorization: \`Bearer \${user.token}\` }});
      
      const custName = customers.find(c => c._id === selectedCustomer)?.name;
      generateInvoice(data, custName);
      showToast('✅ Sale Completed Successfully!');
      setCart([]); fetchProducts(); setSelectedCustomer('');
    } catch (err) { showToast('❌ ' + (err.response?.data?.message || 'Error processing sale')); }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.imeiSku?.includes(search) || p.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-[82vh] gap-6 relative">
      {toast && <div className="absolute top-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl z-50 text-lg font-medium animate-bounce flex items-center gap-2"><FaCheckCircle className="text-green-400"/> {toast}</div>}
      
      <div className="flex-[2] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-100">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3"><FaBox className="text-indigo-600"/> Products Catalog</h2>
          <div className="relative w-72">
            <input type="text" placeholder="Search product, category, IMEI..." className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" value={search} onChange={e=>setSearch(e.target.value)} />
            <FaSearch className="absolute left-3.5 top-4 text-gray-400" />
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.length === 0 && <p className="col-span-full text-center text-gray-500 py-10">No products found matching your search.</p>}
            {filtered.map(p => (
              <div key={p._id} onClick={() => addToCart(p)} className={\`group relative bg-white rounded-2xl p-5 border transition-all duration-300 cursor-pointer overflow-hidden \${p.stockQty > 0 ? 'border-gray-200 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1' : 'opacity-60 border-red-200 bg-red-50/30'}\`}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-500 to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="flex justify-between items-start mb-3">
                   <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wider">{p.brand}</span>
                   <span className={\`px-2.5 py-1 text-xs font-bold rounded-lg \${p.stockQty > 0 ? 'bg-green-50 text-green-700' : 'bg-red-100 text-red-700'}\`}>{p.stockQty > 0 ? \`In Stock: \${p.stockQty}\` : 'Out of Stock'}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                <p className="text-xs text-gray-500 mb-4 truncate">{p.model}</p>
                <div className="flex justify-between items-end">
                  <span className="font-black text-2xl text-gray-900">$\${p.salePrice}</span>
                  <div className={\`w-8 h-8 rounded-full flex items-center justify-center \${p.stockQty > 0 ? 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-gray-100 text-gray-400'} transition-colors\`}>+</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-2xl shadow-xl flex flex-col border border-gray-100 overflow-hidden min-w-[360px]">
        <div className="p-6 bg-gray-900 text-white flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2"><FaShoppingCart className="text-indigo-400"/> Current Bill</h2>
          <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-bold">{cart.reduce((a,b)=>a+b.quantity,0)} Items</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <FaShoppingCart className="text-6xl mb-4 opacity-20" />
              <p className="font-medium text-lg">Cart is empty</p>
              <p className="text-sm">Click on a product to add it.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col group">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-800 pr-8">{item.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.product); }} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><FaTrash /></button>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">Qty: {item.quantity}</span>
                      <span className="text-sm font-medium text-gray-500">x $\${item.salePrice}</span>
                    </div>
                    <span className="font-black text-lg text-indigo-600">$\${item.salePrice * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-10">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Customer</label>
              <div className="relative">
                <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                  <option value="">Walk-in Customer</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <FaUserPlus className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Payment</label>
              <div className="relative">
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit/Debit Card</option>
                  <option value="UPI">UPI / Transfer</option>
                </select>
                <FaFileInvoiceDollar className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex justify-between text-gray-600 font-medium"><span>Subtotal</span><span>$\${subTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600 font-medium"><span>Tax (5%)</span><span>$\${tax.toFixed(2)}</span></div>
            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Total</span>
              <span className="text-3xl font-black text-indigo-600">$\${total.toFixed(2)}</span>
            </div>
          </div>
          
          <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] flex justify-center items-center gap-3">
            <FaCheckCircle /> Complete Sale & Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
export default POS;
`,
  'Inventory.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaBoxOpen } from 'react-icons/fa';

const Inventory = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', brand: '', model: '', imeiSku: '', category: '', costPrice: 0, salePrice: 0, stockQty: 0, lowStockThreshold: 5 });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/products', { headers: { Authorization: \`Bearer \${user.token}\` }});
      setProducts(data); setLoading(false);
    } catch (error) { setLoading(false); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/products', newProduct, { headers: { Authorization: \`Bearer \${user.token}\` }});
      setShowAddForm(false); setNewProduct({ name: '', brand: '', model: '', imeiSku: '', category: '', costPrice: 0, salePrice: 0, stockQty: 0, lowStockThreshold: 5 });
      fetchProducts();
    } catch (err) { alert(err.response?.data?.message || 'Error adding product'); }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Delete product?')) {
      try { await axios.delete(\`http://localhost:5000/api/products/\${id}\`, { headers: { Authorization: \`Bearer \${user.token}\` }}); fetchProducts(); }
      catch (err) { alert('Error deleting product'); }
    }
  };

  const categories = [...new Set(products.map(p => p.category))];
  const filteredProducts = products.filter(p => {
    const matchSearch = (p.name + ' ' + p.model + ' ' + p.imeiSku).toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchSearch && matchCategory;
  });

  return (
    <div className="pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3"><FaBoxOpen className="text-indigo-600"/> Inventory Management</h1>
          <p className="text-gray-500 mt-2">Manage products, stock levels, and pricing.</p>
        </div>
        {(user.role === 'manager' || user.role === 'admin') && (
          <button onClick={() => setShowAddForm(!showAddForm)} className={\`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all \${showAddForm ? 'bg-gray-200 text-gray-800' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30'}\`}>
            {showAddForm ? 'Cancel' : <><FaPlus /> Add New Product</>}
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white p-8 shadow-xl rounded-2xl mb-8 border border-gray-100 animate-fade-in-down">
          <h2 className="text-xl font-bold mb-6 border-b pb-2">Add New Product Details</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label><input required type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Brand</label><input type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Model</label><input type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.model} onChange={e => setNewProduct({...newProduct, model: e.target.value})} /></div>
            
            <div className="col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">IMEI / Serial / SKU</label><input required type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.imeiSku} onChange={e => setNewProduct({...newProduct, imeiSku: e.target.value})} /></div>
            <div className="col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">Category</label><input required type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} /></div>
            
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Cost Price ($)</label><input required type="number" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.costPrice} onChange={e => setNewProduct({...newProduct, costPrice: e.target.value})} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Sale Price ($)</label><input required type="number" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.salePrice} onChange={e => setNewProduct({...newProduct, salePrice: e.target.value})} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Initial Stock Qty</label><input required type="number" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.stockQty} onChange={e => setNewProduct({...newProduct, stockQty: e.target.value})} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Low Stock Alert at</label><input required type="number" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.lowStockThreshold} onChange={e => setNewProduct({...newProduct, lowStockThreshold: e.target.value})} /></div>
            
            <div className="col-span-full flex justify-end mt-4 pt-4 border-t border-gray-100">
               <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 hover:bg-green-700 transition-colors">Save Product to Database</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96">
              <FaSearch className="absolute left-4 top-4 text-gray-400" />
              <input type="text" placeholder="Search by name, IMEI..." className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={search} onChange={e => setSearch(e.target.value)} />
           </div>
           <div className="relative w-full md:w-64">
              <FaFilter className="absolute left-4 top-4 text-gray-400" />
              <select className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
           </div>
        </div>

        {loading ? <div className="p-10 text-center text-gray-500 font-medium">Loading inventory data...</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">IMEI / SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price (Cost/Sale)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                       <p className="font-bold text-gray-900">{p.name}</p>
                       <p className="text-sm text-gray-500">{p.brand} {p.model}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 bg-gray-50 rounded m-2 inline-block px-2">{p.imeiSku}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">{p.category}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <p className="font-bold text-indigo-600">$\${p.salePrice}</p>
                       <p className="text-xs text-gray-400 line-through">$\${p.costPrice}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={\`w-2 h-2 rounded-full \${p.stockQty > p.lowStockThreshold ? 'bg-green-500' : p.stockQty > 0 ? 'bg-yellow-500' : 'bg-red-500'}\`}></span>
                        <span className={\`font-bold \${p.stockQty > p.lowStockThreshold ? 'text-green-700' : p.stockQty > 0 ? 'text-yellow-700' : 'text-red-700'}\`}>
                          {p.stockQty} Unit{p.stockQty !== 1 && 's'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.role === 'admin' && (
                        <button onClick={() => deleteProduct(p._id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"><FaTrash className="text-lg"/></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default Inventory;
`
};

const writeFiles = (dir, filesObj) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const [filename, content] of Object.entries(filesObj)) {
    fs.writeFileSync(path.join(dir, filename), content.trim());
  }
};

writeFiles(path.join(srcPath, 'components'), components);
writeFiles(path.join(srcPath, 'pages'), pages);
console.log('Heavy UI generated.');
