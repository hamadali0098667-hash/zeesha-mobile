import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { FaSignOutAlt, FaBell, FaSun, FaMoon, FaBars } from 'react-icons/fa';

const Topbar = ({ setSidebarOpen }) => {
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
    <header className="h-20 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-4 lg:px-8 z-10 transition-colors duration-300 w-full">
      <div className="flex items-center">
        <button 
          className="lg:hidden mr-4 p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 focus:outline-none"
          onClick={() => setSidebarOpen(true)}
        >
          <FaBars className="w-6 h-6" />
        </button>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white truncate">Welcome, {user?.name.split(' ')[0]}!</h2>
      </div>
      <div className="flex items-center space-x-2 lg:space-x-6">
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hidden sm:block">
          {darkMode ? <FaSun className="w-6 h-6 text-yellow-400" /> : <FaMoon className="w-6 h-6" />}
        </button>
        <button className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors hidden sm:block">
          <FaBell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
        </button>
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden lg:block"></div>
        <button onClick={logout} className="flex items-center gap-2 px-3 py-2 lg:px-4 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg font-semibold transition-colors duration-200">
          <FaSignOutAlt /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
export default Topbar;
