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
    const { data } = await axios.get('https://zeesha-mobile.vercel.app/api/suppliers', { headers: { Authorization: `Bearer ${user.token}` }});
    setSuppliers(data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://zeesha-mobile.vercel.app/api/suppliers', formData, { headers: { Authorization: `Bearer ${user.token}` }});
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
