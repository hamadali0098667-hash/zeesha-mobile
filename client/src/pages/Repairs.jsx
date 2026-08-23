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
    const { data } = await axios.get('https://zeesha-mobile.vercel.app/api/repairs', { headers: { Authorization: `Bearer ${user.token}` }});
    setRepairs(data);
  };
  const fetchCustomers = async () => {
    const { data } = await axios.get('https://zeesha-mobile.vercel.app/api/customers', { headers: { Authorization: `Bearer ${user.token}` }});
    setCustomers(data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://zeesha-mobile.vercel.app/api/repairs', newRepair, { headers: { Authorization: `Bearer ${user.token}` }});
      setShowAddForm(false);
      fetchRepairs();
    } catch (err) { alert('Error adding repair'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`https://zeesha-mobile.vercel.app/api/repairs/${id}`, { status }, { headers: { Authorization: `Bearer ${user.token}` }});
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
        <form onSubmit={handleAdd} className="bg-white dark:bg-gray-800 p-4 shadow rounded mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        {repairs.length === 0 && <p className="p-4 text-center">No repair jobs found.</p>}
        <div className="overflow-x-auto w-full"><table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Device & Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800">
            {repairs.map(r => (
              <tr key={r._id}>
                <td className="px-6 py-4">{r.customer?.name} ({r.customer?.phone})</td>
                <td className="px-6 py-4">{r.deviceDetails} <br/><span className="text-sm text-gray-500 dark:text-gray-400">{r.issueDescription}</span></td>
                <td className="px-6 py-4">
                  <select value={r.status} onChange={(e) => handleStatusChange(r._id, e.target.value)}
                    className={`border rounded p-1 text-sm font-semibold ${r.status === 'delivered' ? 'bg-gray-200 text-gray-700 dark:text-gray-300' : r.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    <option value="received">Received</option>
                    <option value="in-progress">In-Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
                <td className="px-6 py-4">Est: $${r.estimatedCost}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  );
};
export default Repairs;
