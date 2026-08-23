const fs = require('fs');
const path = require('path');

const pages = {
  'Inventory.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Inventory = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: \`Bearer \${user.token}\` }
      });
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Delete product?')) {
      try {
        await axios.delete(\`http://localhost:5000/api/products/\${id}\`, {
          headers: { Authorization: \`Bearer \${user.token}\` }
        });
        fetchProducts();
      } catch (err) {
        alert('Error deleting product');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
        {user.role === 'manager' || user.role === 'admin' ? (
          <button className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">Add Product</button>
        ) : null}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? <p className="p-4">Loading...</p> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{p.name} {p.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">$\${p.salePrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={\`px-2 inline-flex text-xs leading-5 font-semibold rounded-full \${p.stockQty <= p.lowStockThreshold ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}\`}>
                      {p.stockQty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                    {user.role === 'admin' && (
                      <button onClick={() => deleteProduct(p._id)} className="text-red-600 hover:text-red-900">Delete</button>
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
  'POS.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const POS = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

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

  const addToCart = (product) => {
    const exist = cart.find(x => x.product === product._id);
    if (exist) {
      if (product.stockQty >= exist.quantity + 1) {
        setCart(cart.map(x => x.product === product._id ? { ...exist, quantity: exist.quantity + 1 } : x));
      } else {
        alert('Insufficient stock!');
      }
    } else {
      if (product.stockQty >= 1) {
        setCart([...cart, { product: product._id, name: product.name, salePrice: product.salePrice, quantity: 1 }]);
      } else {
        alert('Out of stock!');
      }
    }
  };

  const subTotal = cart.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);

  const handleCheckout = async () => {
    try {
      await axios.post('http://localhost:5000/api/sales', {
        customer: selectedCustomer || null,
        items: cart,
        subTotal,
        tax: 0,
        total: subTotal,
        paymentMethod
      }, { headers: { Authorization: \`Bearer \${user.token}\` }});
      alert('Sale Completed!');
      setCart([]);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing sale');
    }
  };

  return (
    <div className="flex h-full gap-4">
      <div className="flex-1 bg-white p-4 shadow rounded">
        <h2 className="text-xl mb-4">Products</h2>
        <div className="grid grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p._id} className="border p-4 rounded cursor-pointer hover:bg-gray-50" onClick={() => addToCart(p)}>
              <h3 className="font-bold">{p.name}</h3>
              <p>$\${p.salePrice} (Stock: {p.stockQty})</p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-1/3 bg-white p-4 shadow rounded flex flex-col">
        <h2 className="text-xl mb-4">Current Bill</h2>
        <div className="flex-1 overflow-y-auto border-b mb-4">
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between mb-2">
              <span>{item.name} (x{item.quantity})</span>
              <span>$\${item.salePrice * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="mb-4">
          <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="w-full border p-2 mb-2">
            <option value="">Walk-in Customer</option>
            {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full border p-2">
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
          </select>
        </div>
        <div className="flex justify-between font-bold text-xl mb-4">
          <span>Total:</span>
          <span>$\${subTotal}</span>
        </div>
        <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:bg-gray-400">
          Complete Sale
        </button>
      </div>
    </div>
  );
};

export default POS;
`
};

const writeFiles = (dir, filesObj) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const [filename, content] of Object.entries(filesObj)) {
    fs.writeFileSync(path.join(dir, filename), content.trim());
  }
};

writeFiles(path.join(__dirname, 'client', 'src', 'pages'), pages);
console.log('Pages generated.');
