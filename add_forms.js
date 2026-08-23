const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'client', 'src', 'pages');

const pages = {
  'Inventory.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

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
      setProducts(data);
      setLoading(false);
    } catch (error) { console.error(error); setLoading(false); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/products', newProduct, { headers: { Authorization: \`Bearer \${user.token}\` }});
      setShowAddForm(false);
      setNewProduct({ name: '', brand: '', model: '', imeiSku: '', category: '', costPrice: 0, salePrice: 0, stockQty: 0, lowStockThreshold: 5 });
      fetchProducts();
    } catch (err) { alert(err.response?.data?.message || 'Error adding product'); }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Delete product?')) {
      try {
        await axios.delete(\`http://localhost:5000/api/products/\${id}\`, { headers: { Authorization: \`Bearer \${user.token}\` }});
        fetchProducts();
      } catch (err) { alert('Error deleting product'); }
    }
  };

  const categories = [...new Set(products.map(p => p.category))];
  const filteredProducts = products.filter(p => {
    const matchSearch = (p.name + ' ' + p.model + ' ' + p.imeiSku).toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchSearch && matchCategory;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
        {(user.role === 'manager' || user.role === 'admin') && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">
            {showAddForm ? 'Cancel' : 'Add Product'}
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProduct} className="bg-white p-6 shadow rounded-lg mb-6 grid grid-cols-3 gap-4">
          <input required type="text" placeholder="Name" className="border p-2 rounded" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
          <input type="text" placeholder="Brand" className="border p-2 rounded" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} />
          <input type="text" placeholder="Model" className="border p-2 rounded" value={newProduct.model} onChange={e => setNewProduct({...newProduct, model: e.target.value})} />
          <input required type="text" placeholder="IMEI/SKU" className="border p-2 rounded" value={newProduct.imeiSku} onChange={e => setNewProduct({...newProduct, imeiSku: e.target.value})} />
          <input required type="text" placeholder="Category" className="border p-2 rounded" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
          <input required type="number" placeholder="Cost Price" className="border p-2 rounded" value={newProduct.costPrice} onChange={e => setNewProduct({...newProduct, costPrice: e.target.value})} />
          <input required type="number" placeholder="Sale Price" className="border p-2 rounded" value={newProduct.salePrice} onChange={e => setNewProduct({...newProduct, salePrice: e.target.value})} />
          <input required type="number" placeholder="Initial Stock Qty" className="border p-2 rounded" value={newProduct.stockQty} onChange={e => setNewProduct({...newProduct, stockQty: e.target.value})} />
          <input required type="number" placeholder="Low Stock Threshold" className="border p-2 rounded" value={newProduct.lowStockThreshold} onChange={e => setNewProduct({...newProduct, lowStockThreshold: e.target.value})} />
          <div className="col-span-3 flex justify-end">
             <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Save Product</button>
          </div>
        </form>
      )}

      <div className="mb-4 flex gap-4">
        <input type="text" placeholder="Search by name, model, IMEI..." className="border p-2 rounded flex-1 shadow-sm" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="border p-2 rounded shadow-sm" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? <p className="p-4">Loading...</p> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name & Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IMEI/SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((p) => (
                <tr key={p._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{p.name} {p.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.imeiSku}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">$\${p.salePrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={\`px-2 inline-flex text-xs leading-5 font-semibold rounded-full \${p.stockQty <= p.lowStockThreshold ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}\`}>
                      {p.stockQty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.role === 'admin' && (
                      <button onClick={() => deleteProduct(p._id)} className="text-red-600 hover:text-red-900 ml-4 font-bold">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default Inventory;
`,
  'Purchases.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Purchases = () => {
  const { user } = useContext(AuthContext);
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddPurchase, setShowAddPurchase] = useState(false);

  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', address: '' });
  const [newPurchase, setNewPurchase] = useState({ supplier: '', product: '', quantity: 1, cost: 0 });

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchPurchases = async () => {
    const { data } = await axios.get('http://localhost:5000/api/purchases', { headers: { Authorization: \`Bearer \${user.token}\` }});
    setPurchases(data);
  };
  const fetchSuppliers = async () => {
    const { data } = await axios.get('http://localhost:5000/api/suppliers', { headers: { Authorization: \`Bearer \${user.token}\` }});
    setSuppliers(data);
  };
  const fetchProducts = async () => {
    const { data } = await axios.get('http://localhost:5000/api/products', { headers: { Authorization: \`Bearer \${user.token}\` }});
    setProducts(data);
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/suppliers', newSupplier, { headers: { Authorization: \`Bearer \${user.token}\` }});
      setShowAddSupplier(false);
      setNewSupplier({ name: '', contact: '', address: '' });
      fetchSuppliers();
    } catch(err) { alert('Error adding supplier'); }
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    try {
      const items = [{ product: newPurchase.product, quantity: newPurchase.quantity, cost: newPurchase.cost }];
      const totalCost = newPurchase.quantity * newPurchase.cost;
      await axios.post('http://localhost:5000/api/purchases', { supplier: newPurchase.supplier, items, totalCost }, { headers: { Authorization: \`Bearer \${user.token}\` }});
      setShowAddPurchase(false);
      fetchPurchases();
    } catch(err) { alert('Error adding purchase'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Purchases & Suppliers</h1>
      
      <div className="bg-white shadow sm:rounded-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl">Suppliers</h2>
          <button onClick={() => setShowAddSupplier(!showAddSupplier)} className="bg-indigo-600 text-white px-3 py-1 rounded">Add Supplier</button>
        </div>
        
        {showAddSupplier && (
          <form onSubmit={handleAddSupplier} className="mb-4 grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded">
            <input required type="text" placeholder="Name" className="border p-2" value={newSupplier.name} onChange={e=>setNewSupplier({...newSupplier, name: e.target.value})} />
            <input required type="text" placeholder="Contact" className="border p-2" value={newSupplier.contact} onChange={e=>setNewSupplier({...newSupplier, contact: e.target.value})} />
            <input type="text" placeholder="Address" className="border p-2" value={newSupplier.address} onChange={e=>setNewSupplier({...newSupplier, address: e.target.value})} />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded col-span-3">Save Supplier</button>
          </form>
        )}

        <ul className="divide-y divide-gray-200 border-t mt-4">
          {suppliers.map(s => (
            <li key={s._id} className="py-2 flex justify-between">
              <span className="font-semibold">{s.name} <span className="text-gray-500 font-normal">({s.contact})</span></span>
              <span className="text-gray-500">{s.address}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white shadow sm:rounded-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl">Purchase History (Stock In)</h2>
          <button onClick={() => setShowAddPurchase(!showAddPurchase)} className="bg-indigo-600 text-white px-3 py-1 rounded">New Purchase</button>
        </div>

        {showAddPurchase && (
          <form onSubmit={handleAddPurchase} className="mb-4 grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded">
            <select required className="border p-2" value={newPurchase.supplier} onChange={e=>setNewPurchase({...newPurchase, supplier: e.target.value})}>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <select required className="border p-2" value={newPurchase.product} onChange={e=>setNewPurchase({...newPurchase, product: e.target.value})}>
              <option value="">Select Product to Restock</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.stockQty})</option>)}
            </select>
            <input required type="number" placeholder="Quantity" className="border p-2" value={newPurchase.quantity} onChange={e=>setNewPurchase({...newPurchase, quantity: e.target.value})} />
            <input required type="number" placeholder="Cost Per Unit" className="border p-2" value={newPurchase.cost} onChange={e=>setNewPurchase({...newPurchase, cost: e.target.value})} />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded col-span-4">Complete Restock & Add to Inventory</button>
          </form>
        )}

        <table className="min-w-full divide-y divide-gray-200 border-t mt-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {purchases.map(p => (
              <tr key={p._id}>
                <td className="px-6 py-4">{new Date(p.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">{p.supplier?.name}</td>
                <td className="px-6 py-4 font-bold">$\${p.totalCost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Purchases;
`,
  'Settings.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [staff, setStaff] = useState([]);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'cashier' });

  useEffect(() => {
    if (user.role === 'admin') fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const { data } = await axios.get('http://localhost:5000/api/staff', { headers: { Authorization: \`Bearer \${user.token}\` }});
    setStaff(data);
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/staff', newStaff, { headers: { Authorization: \`Bearer \${user.token}\` }});
      setShowAddStaff(false);
      setNewStaff({ name: '', email: '', password: '', role: 'cashier' });
      fetchStaff();
    } catch(err) { alert(err.response?.data?.message || 'Error adding staff'); }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(\`http://localhost:5000/api/staff/\${id}\`, { isActive: !currentStatus }, { headers: { Authorization: \`Bearer \${user.token}\` }});
      fetchStaff();
    } catch(err) { alert('Error updating status'); }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Settings & Staff Management</h1>
      
      <div className="bg-white shadow sm:rounded-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl">Staff Members</h2>
          {user.role === 'admin' && (
            <button onClick={() => setShowAddStaff(!showAddStaff)} className="bg-indigo-600 text-white px-4 py-2 rounded">Add Staff</button>
          )}
        </div>

        {showAddStaff && (
          <form onSubmit={handleAddStaff} className="mb-6 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
            <input required type="text" placeholder="Name" className="border p-2" value={newStaff.name} onChange={e=>setNewStaff({...newStaff, name: e.target.value})} />
            <input required type="email" placeholder="Email" className="border p-2" value={newStaff.email} onChange={e=>setNewStaff({...newStaff, email: e.target.value})} />
            <input required type="text" placeholder="Password" className="border p-2" value={newStaff.password} onChange={e=>setNewStaff({...newStaff, password: e.target.value})} />
            <select required className="border p-2" value={newStaff.role} onChange={e=>setNewStaff({...newStaff, role: e.target.value})}>
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded col-span-2">Create Staff Account</button>
          </form>
        )}

        <ul className="divide-y divide-gray-200 border-t mt-4">
          {staff.map(s => (
            <li key={s._id} className="py-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">{s.name} <span className="text-sm font-normal text-indigo-600 uppercase bg-indigo-50 px-2 rounded">({s.role})</span></p>
                <p className="text-sm text-gray-600">{s.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={\`px-3 py-1 text-xs rounded-full font-bold \${s.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}\`}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
                {user._id !== s._id && (
                  <button onClick={() => toggleStatus(s._id, s.isActive)} className="text-sm underline text-blue-600 hover:text-blue-800">
                    {s.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default Settings;
`
};

const writeFiles = (dir, filesObj) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const [filename, content] of Object.entries(filesObj)) {
    fs.writeFileSync(path.join(dir, filename), content.trim());
  }
};

writeFiles(srcPath, pages);
console.log('Forms explicitly added to Inventory, Purchases, Settings');
