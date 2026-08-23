const fs = require('fs');
const path = require('path');

const pages = {
  'Customers.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Customers = () => {
  const { user } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data } = await axios.get('http://localhost:5000/api/customers', { headers: { Authorization: \`Bearer \${user.token}\` }});
    setCustomers(data);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Customers</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {customers.map(c => (
            <li key={c._id} className="px-6 py-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-bold">{c.name}</h3>
                  <p className="text-gray-600">{c.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{c.address || 'No Address'}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Customers;
`,
  'Repairs.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Repairs = () => {
  const { user } = useContext(AuthContext);
  const [repairs, setRepairs] = useState([]);

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    const { data } = await axios.get('http://localhost:5000/api/repairs', { headers: { Authorization: \`Bearer \${user.token}\` }});
    setRepairs(data);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Repairs & Services</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device & Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {repairs.map(r => (
              <tr key={r._id}>
                <td className="px-6 py-4">{r.customer?.name} ({r.customer?.phone})</td>
                <td className="px-6 py-4">{r.deviceDetails} - {r.issueDescription}</td>
                <td className="px-6 py-4">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {r.status}
                  </span>
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
  'Reports.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      const { data } = await axios.get('http://localhost:5000/api/sales', { headers: { Authorization: \`Bearer \${user.token}\` }});
      setSales(data);
    };
    fetchSales();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Sales Report</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
        <h2 className="text-xl mb-4">Total Sales: $\${sales.reduce((acc, s) => acc + s.total, 0)}</h2>
        <ul className="divide-y divide-gray-200">
          {sales.map(s => (
            <li key={s._id} className="py-2 flex justify-between">
              <span>{new Date(s.date).toLocaleDateString()} - {s.customer?.name || 'Walk-in'}</span>
              <span className="font-bold">$\${s.total}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Reports;
`,
  'Settings.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    if (user.role === 'admin') {
      fetchStaff();
    }
  }, []);

  const fetchStaff = async () => {
    const { data } = await axios.get('http://localhost:5000/api/staff', { headers: { Authorization: \`Bearer \${user.token}\` }});
    setStaff(data);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Settings & Staff Management</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
        <h2 className="text-xl mb-4">Staff Members</h2>
        <ul className="divide-y divide-gray-200">
          {staff.map(s => (
            <li key={s._id} className="py-2 flex justify-between items-center">
              <div>
                <p className="font-bold">{s.name} ({s.role})</p>
                <p className="text-sm text-gray-600">{s.email}</p>
              </div>
              <div>
                <span className={\`px-2 text-xs rounded-full \${s.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}\`}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
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

writeFiles(path.join(__dirname, 'client', 'src', 'pages'), pages);
console.log('Pages generated.');
