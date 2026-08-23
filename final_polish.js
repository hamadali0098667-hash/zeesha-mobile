const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'client', 'src');

const pages = {
  'Login.jsx': `
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FaEye, FaEyeSlash, FaMobileAlt, FaSpinner } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('admin@zeeshamobile.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Email or Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
             <FaMobileAlt className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Zeesha Mobile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Secure Staff Portal</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium text-center animate-pulse">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input required type="email" placeholder="staff@zeeshamobile.com" className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input required type={showPassword ? "text" : "password"} placeholder="Enter your password" className="w-full pl-5 pr-12 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-400 hover:text-indigo-600 transition-colors">
                {showPassword ? <FaEyeSlash className="text-xl"/> : <FaEye className="text-xl"/>}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? <><FaSpinner className="animate-spin mr-2" /> Authenticating...</> : 'Login to System'}
          </button>
        </form>
        <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">Only authorized personnel can access this system.</p>
      </div>
    </div>
  );
};
export default Login;
`
};

const components = {
  'Topbar.jsx': `
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { FaSignOutAlt, FaBell, FaSun, FaMoon } from 'react-icons/fa';

const Topbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <header className="h-20 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-8 z-10 transition-colors duration-300">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome back, {user?.name.split(' ')[0]}! 👋</h2>
      </div>
      <div className="flex items-center space-x-6">
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          {darkMode ? <FaSun className="w-6 h-6 text-yellow-400" /> : <FaMoon className="w-6 h-6" />}
        </button>
        <button className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
          <FaBell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
        </button>
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg font-semibold transition-colors duration-200">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </header>
  );
};
export default Topbar;
`,
  'Layout.jsx': `
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
`
};

const writeFiles = (dir, filesObj) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const [filename, content] of Object.entries(filesObj)) {
    fs.writeFileSync(path.join(dir, filename), content.trim());
  }
};

writeFiles(path.join(srcPath, 'pages'), pages);
writeFiles(path.join(srcPath, 'components'), components);
console.log('Login and Dark Mode features added.');
