const fs = require('fs');
const path = require('path');

const context = {
  'AuthContext.jsx': `
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
`
};

const components = {
  'ProtectedRoute.jsx': `
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
`,
  'Layout.jsx': `
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
`,
  'Sidebar.jsx': `
import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaHome, FaBox, FaUsers, FaWrench, FaChartBar, FaCog, FaShoppingCart } from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        <h1 className="text-xl font-bold tracking-widest uppercase">Zeesha Mobile</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          <NavLink to="/" className={({isActive}) => \`flex items-center px-4 py-2 text-sm rounded-md \${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'}\`}>
            <FaHome className="mr-3" /> Dashboard
          </NavLink>
          <NavLink to="/pos" className={({isActive}) => \`flex items-center px-4 py-2 text-sm rounded-md \${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'}\`}>
            <FaShoppingCart className="mr-3" /> POS / Sales
          </NavLink>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <NavLink to="/inventory" className={({isActive}) => \`flex items-center px-4 py-2 text-sm rounded-md \${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'}\`}>
              <FaBox className="mr-3" /> Inventory
            </NavLink>
          )}
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <NavLink to="/purchases" className={({isActive}) => \`flex items-center px-4 py-2 text-sm rounded-md \${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'}\`}>
              <FaBox className="mr-3" /> Purchases & Suppliers
            </NavLink>
          )}
          <NavLink to="/customers" className={({isActive}) => \`flex items-center px-4 py-2 text-sm rounded-md \${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'}\`}>
            <FaUsers className="mr-3" /> Customers
          </NavLink>
          <NavLink to="/repairs" className={({isActive}) => \`flex items-center px-4 py-2 text-sm rounded-md \${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'}\`}>
            <FaWrench className="mr-3" /> Repairs
          </NavLink>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <NavLink to="/reports" className={({isActive}) => \`flex items-center px-4 py-2 text-sm rounded-md \${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'}\`}>
              <FaChartBar className="mr-3" /> Reports
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/settings" className={({isActive}) => \`flex items-center px-4 py-2 text-sm rounded-md \${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'}\`}>
              <FaCog className="mr-3" /> Settings & Staff
            </NavLink>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
`,
  'Topbar.jsx': `
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Topbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
      <div className="font-semibold text-gray-700"></div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-gray-600">
          <FaUserCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">{user?.name} ({user?.role})</span>
        </div>
        <button onClick={logout} className="text-red-500 hover:text-red-700 flex items-center">
          <FaSignOutAlt className="mr-1" /> Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
`
};

const pages = {
  'Login.jsx': `
import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Zeesha Mobile</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Staff Login Portal</p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            </div>
            <div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
`,
  'Dashboard.jsx': `
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ salesToday: 0, totalStockValue: 0, lowStockItems: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: \`Bearer \${user.token}\` } };
        const { data } = await axios.get('http://localhost:5000/api/dashboard', config);
        setStats(data);
      } catch (error) {
        console.error(error);
      }
    };
    if (user.role === 'admin' || user.role === 'manager') {
      fetchStats();
    }
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      {(user.role === 'admin' || user.role === 'manager') ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
            <h3 className="text-gray-500 text-sm font-medium">Today's Sales</h3>
            <p className="text-3xl font-bold text-gray-900">$\${stats.salesToday}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-medium">Total Stock Value</h3>
            <p className="text-3xl font-bold text-gray-900">$\${stats.totalStockValue}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <h3 className="text-gray-500 text-sm font-medium">Low Stock Alerts</h3>
            <p className="text-3xl font-bold text-gray-900">\${stats.lowStockItems}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl">Welcome, \${user.name}!</h2>
          <p className="mt-2 text-gray-600">Please select an option from the sidebar to begin.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
`
};

const writeFiles = (dir, filesObj) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const [filename, content] of Object.entries(filesObj)) {
    fs.writeFileSync(path.join(dir, filename), content.trim());
  }
};

const clientSrcPath = path.join(__dirname, 'client', 'src');
writeFiles(path.join(clientSrcPath, 'context'), context);
writeFiles(path.join(clientSrcPath, 'components'), components);
writeFiles(path.join(clientSrcPath, 'pages'), pages);
console.log('Base React files generated successfully.');
