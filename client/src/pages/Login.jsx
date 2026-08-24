import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FaEye, FaEyeSlash, FaMobileAlt, FaSpinner, FaUserShield, FaUserTie, FaCashRegister, FaMoon, FaSun } from 'react-icons/fa';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [email, setEmail] = useState('admin@zeeshamobile.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'Admin') { setEmail('admin@zeeshamobile.com'); setPassword('password123'); }
    if (role === 'Manager') { setEmail('ahmed@123'); setPassword('123'); }
    if (role === 'Cashier') { setEmail('ali@123'); setPassword('123'); }
    // Auto-fill for testing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true); setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err || 'Invalid Email or Password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { name: 'Admin', icon: <FaUserShield className="text-xl mb-1" /> },
    { name: 'Manager', icon: <FaUserTie className="text-xl mb-1" /> },
    { name: 'Cashier', icon: <FaCashRegister className="text-xl mb-1" /> }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center animated-bg transition-colors duration-500 p-4 relative overflow-hidden">
      
      {/* Floating Stars for Attraction */}
      <div className="floating-star w-2 h-2 top-10 left-10" style={{ animationDelay: '0s' }}></div>
      <div className="floating-star w-3 h-3 top-20 right-20" style={{ animationDelay: '1s' }}></div>
      <div className="floating-star w-4 h-4 bottom-20 left-1/4" style={{ animationDelay: '2s' }}></div>
      <div className="floating-star w-2 h-2 bottom-10 right-1/3" style={{ animationDelay: '3s' }}></div>
      <div className="floating-star w-5 h-5 top-1/3 left-1/2" style={{ animationDelay: '1.5s', opacity: 0.3 }}></div>

      {/* Theme Toggle */}
      <button 
        onClick={() => setDarkMode(!darkMode)} 
        className="absolute top-6 right-6 p-4 bg-white/20 dark:bg-black/40 backdrop-blur-md text-white rounded-full shadow-2xl hover:bg-white/30 transition-all border border-white/20 z-10"
        style={{ animation: 'pulseGlow 3s infinite' }}
      >
        {darkMode ? <FaSun className="text-2xl text-yellow-300" /> : <FaMoon className="text-2xl" />}
      </button>

      {/* Main Login Card */}
      <div className="max-w-md w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700 transition-colors duration-300 z-10 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
             <FaMobileAlt className="text-2xl text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight text-center">Zeesha Mobile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium text-center">Mobile Shop Management System</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 text-center">Login As</p>
          <div className="grid grid-cols-3 gap-3">
            {roles.map(role => (
              <button
                key={role.name}
                type="button"
                onClick={() => handleRoleSelect(role.name)}
                className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all duration-200 ${
                  selectedRole === role.name 
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' 
                  : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:border-indigo-300 dark:hover:border-gray-600'
                }`}
              >
                {role.icon}
                <span className="text-xs font-bold">{role.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email / Username</label>
            <input 
              required 
              type="email" 
              placeholder="Enter email address" 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={loading} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter password" 
                className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-gray-900 dark:text-white" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={loading} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-3.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {showPassword ? <FaEyeSlash className="text-lg"/> : <FaEye className="text-lg"/>}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <><FaSpinner className="animate-spin mr-2" /> Authenticating...</> : 'Secure Login'}
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default Login;
