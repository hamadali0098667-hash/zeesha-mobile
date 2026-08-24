import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const { user, globalSettings } = useContext(AuthContext);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [tab, setTab] = useState('sales');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const salesRes = await axios.get('https://zeesha-mobile.vercel.app/api/sales', { headers: { Authorization: `Bearer ${user.token}` }});
      setSales(salesRes.data);
      const prodRes = await axios.get('https://zeesha-mobile.vercel.app/api/products', { headers: { Authorization: `Bearer ${user.token}` }});
      setProducts(prodRes.data);
      const purRes = await axios.get('https://zeesha-mobile.vercel.app/api/purchases', { headers: { Authorization: `Bearer ${user.token}` }});
      setPurchases(purRes.data);
    } catch(err) { console.error(err); }
  };

  const totalSales = sales.reduce((a, s) => a + s.total, 0);
  const totalStockValue = products.reduce((a, p) => a + (p.costPrice * p.stockQty), 0);
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Zeesha Mobile - ${tab.toUpperCase()} REPORT`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    if (tab === 'sales') {
      autoTable(doc, {
        startY: 40,
        head: [['Date', 'Invoice ID', 'Customer', 'Items', 'Total']],
        body: sales.map(s => [
          new Date(s.date).toLocaleDateString(),
          s._id.slice(-6).toUpperCase(),
          s.customer?.name || 'Walk-in',
          s.items.reduce((a, b) => a + b.quantity, 0),
          `${globalSettings?.currency || "$"}${s.total}`
        ])
      });
    } else if (tab === 'stock') {
      autoTable(doc, {
        startY: 40,
        head: [['Product', 'Category', 'Stock', 'Value']],
        body: products.map(p => [
          p.name,
          p.category,
          p.stockQty.toString(),
          `${globalSettings?.currency || "$"}${p.costPrice * p.stockQty}`
        ])
      });
    } else {
      autoTable(doc, {
        startY: 40,
        head: [['Date', 'Supplier', 'Items', 'Total Cost']],
        body: purchases.map(p => [
          new Date(p.date).toLocaleDateString(),
          p.supplier?.name || 'Unknown',
          p.items.length.toString(),
          `${globalSettings?.currency || "$"}${p.totalCost}`
        ])
      });
    }
    doc.save(`${tab}-report.pdf`);
  };
  
  const lowStockProducts = products.filter(p => p.stockQty <= p.lowStockThreshold);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Business Reports</h1>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 overflow-x-auto pb-2">
          <button onClick={()=>setTab('sales')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${tab==='sales' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'}`}>Sales Report</button>
          <button onClick={()=>setTab('stock')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${tab==='stock' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'}`}>Stock & Inventory</button>
          <button onClick={()=>setTab('purchases')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${tab==='purchases' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'}`}>Supplier Purchases</button>
        </div>
        <button onClick={exportPDF} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-green-700 transition whitespace-nowrap">
          Export PDF
        </button>
      </div>

      {tab === 'sales' && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Total Sales Volume: <span className="text-green-600">{globalSettings?.currency || "$"}{totalSales.toFixed(2)}</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Overview of all recorded transactions.</p>
          
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <tr><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Cashier</th><th className="p-3 text-right">Total</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {sales.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 text-gray-600 dark:text-gray-400">{new Date(s.date).toLocaleString()}</td>
                    <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{s.customer?.name || 'Walk-in'}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">{s.cashier?.name || 'Unknown'}</td>
                    <td className="p-3 text-right font-bold text-gray-900 dark:text-white">{globalSettings?.currency || "$"}{s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'stock' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Total Stock Value</h2>
            <p className="text-3xl font-black text-indigo-600">{globalSettings?.currency || "$"}{totalStockValue.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">Based on cost price of current inventory.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-red-100 dark:border-red-900/30">
            <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Low Stock Alerts</h2>
            {lowStockProducts.length === 0 ? <p className="text-gray-500">All stock levels are optimal.</p> : (
              <ul className="divide-y divide-red-100 dark:divide-red-900/30">
                {lowStockProducts.map(p => (
                  <li key={p._id} className="py-2 flex justify-between text-sm">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{p.name}</span>
                    <span className="text-red-600 font-bold">{p.stockQty} left</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === 'purchases' && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Total Purchases Volume: <span className="text-indigo-600">{globalSettings?.currency || "$"}{purchases.reduce((a, p) => a + p.totalCost, 0).toFixed(2)}</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Overview of all stock-in transactions grouped by supplier.</p>
          
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <tr><th className="p-3">Date</th><th className="p-3">Supplier Name</th><th className="p-3">Items Count</th><th className="p-3 text-right">Total Cost</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {purchases.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 text-gray-600 dark:text-gray-400">{new Date(p.date).toLocaleString()}</td>
                    <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{p.supplier?.name || 'Deleted Supplier'}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">{p.items.length} items</td>
                    <td className="p-3 text-right font-bold text-gray-900 dark:text-white">{globalSettings?.currency || "$"}{p.totalCost}</td>
                  </tr>
                ))}
                {purchases.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-500">No purchases found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
  
    </div>
  );
};
export default Reports;
