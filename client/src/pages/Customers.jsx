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
    const { data } = await axios.get('https://zeesha-mobile.vercel.app/api/customers', { headers: { Authorization: `Bearer ${user.token}` }});
    setCustomers(data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://zeesha-mobile.vercel.app/api/customers', formData, { headers: { Authorization: `Bearer ${user.token}` }});
      setShowAdd(false);
      setFormData({name:'', phone:'', address:''});
      fetchCustomers();
    } catch(err) { alert(err.response?.data?.message || err.message || 'Error adding customer'); }
  };

  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [history, setHistory] = useState({ sales: [], repairs: [] });
  const [loadingHistory, setLoadingHistory] = useState(false);

  const viewHistory = async (id) => {
    setLoadingHistory(true);
    setSelectedCustomer(id);
    try {
      const { data } = await axios.get(`https://zeesha-mobile.vercel.app/api/customers/${id}/history`, { headers: { Authorization: `Bearer ${user.token}` }});
      setHistory(data);
    } catch(err) { alert('Error fetching history'); }
    setLoadingHistory(false);
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Customers Directory</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-indigo-600 text-white px-4 py-2 rounded">Add Customer</button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-gray-800 p-4 shadow rounded mb-6 flex gap-4">
          <input required type="text" placeholder="Name" className="border p-2 flex-1" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
          <input required type="text" placeholder="Phone" className="border p-2 flex-1" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} />
          <input type="text" placeholder="Address" className="border p-2 flex-1" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {customers.map(c => (
            <li key={c._id} className="px-6 py-4 flex justify-between">
              <div>
                <h3 className="text-lg font-bold text-indigo-600 hover:underline cursor-pointer" onClick={() => viewHistory(c._id)}>{c.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{c.phone}</p>
              </div>
              <div className="text-right text-gray-500 dark:text-gray-400 text-sm">
                <p>{c.address || 'No Address'}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>


      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer History</h2>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-500 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            
            {loadingHistory ? <p className="text-center py-10 text-gray-500">Loading...</p> : (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold bg-gray-100 dark:bg-gray-700 p-2 rounded text-gray-900 dark:text-white mb-3">Sales / Purchases</h3>
                  {history.sales.length === 0 ? <p className="text-sm text-gray-500">No purchases found.</p> : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 border dark:border-gray-700 rounded-lg">
                      {history.sales.map(s => (
                        <li key={s._id} className="p-3 text-sm flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{new Date(s.date).toLocaleDateString()}</span>
                          <span className="font-bold text-gray-900 dark:text-white">${s.total}</span>
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
    </div>
  );
};
export default Customers;
