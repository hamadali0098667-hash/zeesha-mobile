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
    const { data } = await axios.get('http://localhost:5000/api/purchases', { headers: { Authorization: `Bearer ${user.token}` }});
    setPurchases(data);
  };
  const fetchSuppliers = async () => {
    const { data } = await axios.get('http://localhost:5000/api/suppliers', { headers: { Authorization: `Bearer ${user.token}` }});
    setSuppliers(data);
  };
  const fetchProducts = async () => {
    const { data } = await axios.get('http://localhost:5000/api/products', { headers: { Authorization: `Bearer ${user.token}` }});
    setProducts(data);
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/suppliers', newSupplier, { headers: { Authorization: `Bearer ${user.token}` }});
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
      await axios.post('http://localhost:5000/api/purchases', { supplier: newPurchase.supplier, items, totalCost }, { headers: { Authorization: `Bearer ${user.token}` }});
      setShowAddPurchase(false);
      fetchPurchases();
    } catch(err) { alert('Error adding purchase'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Purchases & Suppliers</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl">Suppliers</h2>
          <button onClick={() => setShowAddSupplier(!showAddSupplier)} className="bg-indigo-600 text-white px-3 py-1 rounded">Add Supplier</button>
        </div>
        
        {showAddSupplier && (
          <form onSubmit={handleAddSupplier} className="mb-4 grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded">
            <input required type="text" placeholder="Name" className="border p-2" value={newSupplier.name} onChange={e=>setNewSupplier({...newSupplier, name: e.target.value})} />
            <input required type="text" placeholder="Contact" className="border p-2" value={newSupplier.contact} onChange={e=>setNewSupplier({...newSupplier, contact: e.target.value})} />
            <input type="text" placeholder="Address" className="border p-2" value={newSupplier.address} onChange={e=>setNewSupplier({...newSupplier, address: e.target.value})} />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded col-span-3">Save Supplier</button>
          </form>
        )}

        <ul className="divide-y divide-gray-200 border-t mt-4">
          {suppliers.map(s => (
            <li key={s._id} className="py-2 flex justify-between">
              <span className="font-semibold">{s.name} <span className="text-gray-500 dark:text-gray-400 font-normal">({s.contact})</span></span>
              <span className="text-gray-500 dark:text-gray-400">{s.address}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl">Purchase History (Stock In)</h2>
          <button onClick={() => setShowAddPurchase(!showAddPurchase)} className="bg-indigo-600 text-white px-3 py-1 rounded">New Purchase</button>
        </div>

        {showAddPurchase && (
          <form onSubmit={handleAddPurchase} className="mb-4 grid grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded">
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
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {purchases.map(p => (
              <tr key={p._id}>
                <td className="px-6 py-4">{new Date(p.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">{p.supplier?.name}</td>
                <td className="px-6 py-4 font-bold">${p.totalCost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Purchases;
