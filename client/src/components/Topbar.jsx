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