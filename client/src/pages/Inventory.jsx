import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaBoxOpen } from 'react-icons/fa';

const Inventory = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [shopSettings, setShopSettings] = useState({ categories: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', brand: '', model: '', imeiSku: '', category: '', costPrice: 0, salePrice: 0, stockQty: 0, lowStockThreshold: 5, image: '' });

  useEffect(() => { fetchProducts(); axios.get('https://zeesha-mobile.vercel.app/api/settings').then(res => setShopSettings(res.data)).catch(e=>console.log(e)); }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('https://zeesha-mobile.vercel.app/api/products', { headers: { Authorization: `Bearer ${user.token}` }});
      setProducts(data); setLoading(false);
    } catch (error) { setLoading(false); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setUploadingImage(true);
    let imageUrl = '';
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const res = await axios.post('https://zeesha-mobile.vercel.app/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }});
        imageUrl = res.data;
      }
      const productToSave = { ...newProduct, image: imageUrl };
      await axios.post('https://zeesha-mobile.vercel.app/api/products', productToSave, { headers: { Authorization: `Bearer ${user.token}` }});
      setShowAddForm(false); setNewProduct({ name: '', brand: '', model: '', imeiSku: '', category: '', costPrice: 0, salePrice: 0, stockQty: 0, lowStockThreshold: 5, image: '' });
      setImageFile(null);
      fetchProducts();
    } catch (err) { alert(err.response?.data?.message || 'Error adding product'); }
    finally { setUploadingImage(false); }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Delete product?')) {
      try { await axios.delete(`https://zeesha-mobile.vercel.app/api/products/${id}`, { headers: { Authorization: `Bearer ${user.token}` }}); fetchProducts(); }
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
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-3"><FaBoxOpen className="text-indigo-600"/> Inventory Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage products, stock levels, and pricing.</p>
        </div>
        {(user.role === 'manager' || user.role === 'admin') && (
          <button onClick={() => setShowAddForm(!showAddForm)} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${showAddForm ? 'bg-gray-200 text-gray-800 dark:text-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30'}`}>
            {showAddForm ? 'Cancel' : <><FaPlus /> Add New Product</>}
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 p-8 shadow-xl rounded-2xl mb-8 border border-gray-100 dark:border-gray-700 animate-fade-in-down">
          <h2 className="text-xl font-bold mb-6 border-b pb-2">Add New Product Details</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="col-span-2"><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Product Name</label><input required type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /></div>
            <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Brand</label><input type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} /></div>
            <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Model</label><input type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.model} onChange={e => setNewProduct({...newProduct, model: e.target.value})} /></div>
            
            <div className="col-span-2"><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">IMEI / Serial / SKU</label><input required type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.imeiSku} onChange={e => setNewProduct({...newProduct, imeiSku: e.target.value})} /></div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-800 dark:text-white" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                <option value="">Select Category</option>
                {shopSettings.categories?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Cost Price ($)</label><input required type="number" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.costPrice} onChange={e => setNewProduct({...newProduct, costPrice: e.target.value})} /></div>
            <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Sale Price ($)</label><input required type="number" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.salePrice} onChange={e => setNewProduct({...newProduct, salePrice: e.target.value})} /></div>
            <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Initial Stock Qty</label><input required type="number" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.stockQty} onChange={e => setNewProduct({...newProduct, stockQty: e.target.value})} /></div>
            <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Low Stock Alert at</label><input required type="number" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newProduct.lowStockThreshold} onChange={e => setNewProduct({...newProduct, lowStockThreshold: e.target.value})} /></div>
            
            <div className="col-span-full">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Product Image</label>
              <div className="flex items-center gap-4">
                {imageFile && <img src={URL.createObjectURL(imageFile)} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-300" />}
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>
            </div>

            <div className="col-span-full flex justify-end mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
               <button type="submit" disabled={uploadingImage} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 hover:bg-green-700 transition-colors disabled:opacity-50">
                 {uploadingImage ? 'Uploading & Saving...' : 'Save Product to Database'}
               </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96">
              <FaSearch className="absolute left-4 top-4 text-gray-400" />
              <input type="text" placeholder="Search by name, IMEI..." className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={search} onChange={e => setSearch(e.target.value)} />
           </div>
           <div className="relative w-full md:w-64">
              <FaFilter className="absolute left-4 top-4 text-gray-400" />
              <select className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
           </div>
        </div>

        {loading ? <div className="p-10 text-center text-gray-500 dark:text-gray-400 font-medium">Loading inventory data...</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">IMEI / SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price (Cost/Sale)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:bg-gray-900 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-4">
                         {p.image ? (
                           <img src={{p.image?.startsWith('data:') ? p.image : `https://zeesha-mobile.vercel.app${p.image}`}} alt={p.name} className="h-12 w-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                         ) : (
                           <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                             <FaBoxOpen className="text-xl" />
                           </div>
                         )}
                         <div>
                           <p className="font-bold text-gray-900 dark:text-gray-100">{p.name}</p>
                           <p className="text-sm text-gray-500 dark:text-gray-400">{p.brand} {p.model}</p>
                         </div>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded m-2 inline-block px-2">{p.imeiSku}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="px-3 py-1 bg-gray-100 text-gray-600 dark:text-gray-400 rounded-full text-xs font-bold">{p.category}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <p className="font-bold text-indigo-600">${p.salePrice}</p>
                       <p className="text-xs text-gray-400 line-through">${p.costPrice}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${p.stockQty > p.lowStockThreshold ? 'bg-green-500' : p.stockQty > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                        <span className={`font-bold ${p.stockQty > p.lowStockThreshold ? 'text-green-700' : p.stockQty > 0 ? 'text-yellow-700' : 'text-red-700'}`}>
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
