import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

import { Link } from 'react-router-dom';
import { FaShoppingCart, FaWrench, FaUsers } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ salesToday: 0, totalStockValue: 0, lowStockItems: 0, salesTrend: [], topProducts: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/dashboard', { headers: { Authorization: `Bearer ${user.token}` }});
        setStats(data);
      } catch (error) { console.error(error); }
    };
    if (user.role === 'admin' || user.role === 'manager') fetchStats();
  }, [user]);

  const barData = {
    labels: stats.salesTrend?.map(s => s._id) || [],
    datasets: [{ label: 'Sales ($)', data: stats.salesTrend?.map(s => s.total) || [], backgroundColor: 'rgba(79, 70, 229, 0.6)' }]
  };

  const pieData = {
    labels: stats.topProducts?.map(p => p.name) || [],
    datasets: [{ data: stats.topProducts?.map(p => p.qty) || [], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'] }]
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Dashboard</h1>
      {(user.role === 'admin' || user.role === 'manager') ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-indigo-500">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Today's Sales</h3>
              <p className="text-3xl font-bold">${stats.salesToday}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Stock Value</h3>
              <p className="text-3xl font-bold">${stats.totalStockValue}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-red-500">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Low Stock Alerts</h3>
              <p className="text-3xl font-bold text-red-600">{stats.lowStockItems}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="text-center font-bold mb-4">7-Day Sales Trend</h3>
                <Bar data={barData} />
             </div>
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center">
                <h3 className="text-center font-bold mb-4">Top Selling Products</h3>
                <div className="w-64"><Pie data={pieData} /></div>
             </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-2">Welcome back, {user.name}! 👋</h2>
              <p className="text-indigo-100 text-lg">Ready for another great day at Zeesha Mobile? What would you like to do?</p>
            </div>
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Link to="/pos" className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center group cursor-pointer hover:-translate-y-2">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform"><FaShoppingCart /></div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">New Sale (POS)</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Create a new bill and process checkout.</p>
            </Link>
            
            <Link to="/repairs" className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center group cursor-pointer hover:-translate-y-2">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform"><FaWrench /></div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Repair Jobs</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Log a new device for repair or update status.</p>
            </Link>
            
            <Link to="/customers" className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center group cursor-pointer hover:-translate-y-2">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform"><FaUsers /></div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Customer History</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">View customer records and past purchases.</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;