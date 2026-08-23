const fs = require('fs');
const path = require('path');

const pages = {
  'Purchases.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Purchases = () => {
  const { user } = useContext(AuthContext);
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
  }, []);

  const fetchPurchases = async () => {
    const { data } = await axios.get('http://localhost:5000/api/purchases', { headers: { Authorization: \`Bearer \${user.token}\` }});
    setPurchases(data);
  };

  const fetchSuppliers = async () => {
    const { data } = await axios.get('http://localhost:5000/api/suppliers', { headers: { Authorization: \`Bearer \${user.token}\` }});
    setSuppliers(data);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Purchases & Suppliers</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 mb-6">
        <h2 className="text-xl mb-4">Suppliers</h2>
        <ul className="divide-y divide-gray-200">
          {suppliers.map(s => (
            <li key={s._id} className="py-2 flex justify-between">
              <span>{s.name} ({s.contact})</span>
              <span className="text-gray-500">{s.address}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
        <h2 className="text-xl mb-4">Purchase History</h2>
        <table className="min-w-full divide-y divide-gray-200">
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
                <td className="px-6 py-4">$\${p.totalCost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Purchases;
`
};

const appJsx = `
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Customers from './pages/Customers';
import Repairs from './pages/Repairs';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Purchases from './pages/Purchases';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="pos" element={<POS />} />
            <Route path="inventory" element={<ProtectedRoute roles={['admin', 'manager']}><Inventory /></ProtectedRoute>} />
            <Route path="purchases" element={<ProtectedRoute roles={['admin', 'manager']}><Purchases /></ProtectedRoute>} />
            <Route path="customers" element={<Customers />} />
            <Route path="repairs" element={<Repairs />} />
            <Route path="reports" element={<ProtectedRoute roles={['admin', 'manager']}><Reports /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute roles={['admin']}><Settings /></ProtectedRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
`;

const writeFiles = (dir, filesObj) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const [filename, content] of Object.entries(filesObj)) {
    fs.writeFileSync(path.join(dir, filename), content.trim());
  }
};

writeFiles(path.join(__dirname, 'client', 'src', 'pages'), pages);
fs.writeFileSync(path.join(__dirname, 'client', 'src', 'App.jsx'), appJsx.trim());
console.log('Purchases page and final App.jsx generated.');
