import { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaHome, FaBox, FaUsers, FaWrench, FaChartBar, FaCog, FaShoppingCart, FaMobileAlt, FaStore, FaTimes } from 'react-icons/fa';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useContext(AuthContext);
  const [shopSettings, setShopSettings] = useState({ shopName: 'Zeesha Mobile', shopLogo: '' });

  useEffect(() => {
    axios.get('https://zeesha-mobile.vercel.app/api/settings').then(res => {
      if(res.data) setShopSettings(res.data);
    }).catch(err => console.log(err));
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <FaHome className="mr-3 text-lg" />, roles: ['admin', 'manager', 'cashier'] },
    { name: 'POS / Sales', path: '/pos', icon: <FaShoppingCart className="mr-3 text-lg" />, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Inventory', path: '/inventory', icon: <FaBox className="mr-3 text-lg" />, roles: ['admin', 'manager'] },
    { name: 'Purchases & Suppliers', path: '/purchases', icon: <FaStore className="mr-3 text-lg" />, roles: ['admin', 'manager'] },
    { name: 'Customers', path: '/customers', icon: <FaUsers className="mr-3 text-lg" />, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Repairs & Services', path: '/repairs', icon: <FaWrench className="mr-3 text-lg" />, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Sales Reports', path: '/reports', icon: <FaChartBar className="mr-3 text-lg" />, roles: ['admin', 'manager'] },
    { name: 'Settings & Staff', path: '/settings', icon: <FaCog className="mr-3 text-lg" />, roles: ['admin'] },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-2xl transition-transform duration-300 transform lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-20 flex items-center justify-between px-4 border-b border-gray-700/50 bg-black/20">
        <div className="flex items-center">
          <FaMobileAlt className="text-3xl text-indigo-400 mr-3" />
          {shopSettings.shopLogo ? (
            <img src={shopSettings.shopLogo?.startsWith('data:') ? shopSettings.shopLogo : `https://zeesha-mobile.vercel.app${shopSettings.shopLogo}`} alt="Logo" className="h-10 object-contain mr-2" />
          ) : null}
          <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300 uppercase truncate">{shopSettings.shopName}</h1>
        </div>
        <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
          <FaTimes className="text-2xl" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <nav className="space-y-2 px-4">
          {menuItems.map(item => {
            if (item.roles.includes(user?.role)) {
              return (
                <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={({isActive}) => `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 translate-x-1' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}>
                  {item.icon} {item.name}
                </NavLink>
              );
            }
            return null;
          })}
        </nav>
      </div>
      <div className="p-4 bg-gray-900/50 border-t border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
            <p className="text-xs text-indigo-300 uppercase tracking-widest">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
