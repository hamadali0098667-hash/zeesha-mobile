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
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

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
        {user.role === 'manager' || user.role === 'admin' ? (
          <button className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">Add Product</button>
        ) : null}
      </div>

      <div className="mb-4 flex gap-4">
        <input type="text" placeholder="Search by name, model, IMEI..." className="border p-2 rounded flex-1" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="border p-2 rounded" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
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
`
};

const writeFiles = (dir, filesObj) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const [filename, content] of Object.entries(filesObj)) {
    fs.writeFileSync(path.join(dir, filename), content.trim());
  }
};

writeFiles(path.join(__dirname, 'client', 'src', 'pages'), pages);
console.log('Inventory page updated.');
