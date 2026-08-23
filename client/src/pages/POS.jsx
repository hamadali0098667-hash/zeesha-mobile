import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import { FaSearch, FaShoppingCart, FaTrash, FaCheckCircle, FaUserPlus, FaFileInvoiceDollar, FaBox } from 'react-icons/fa';

const POS = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => { fetchProducts(); fetchCustomers(); }, []);

  const fetchProducts = async () => {
    const { data } = await axios.get('https://zeesha-mobile.vercel.app/api/products', { headers: { Authorization: `Bearer ${user.token}` }});
    setProducts(data);
  };
  const fetchCustomers = async () => {
    const { data } = await axios.get('https://zeesha-mobile.vercel.app/api/customers', { headers: { Authorization: `Bearer ${user.token}` }});
    setCustomers(data);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const addToCart = (product) => {
    const exist = cart.find(x => x.product === product._id);
    if (exist) {
      if (product.stockQty >= exist.quantity + 1) {
        setCart(cart.map(x => x.product === product._id ? { ...exist, quantity: exist.quantity + 1 } : x));
      } else { showToast('⚠️ Insufficient stock in inventory!'); }
    } else {
      if (product.stockQty >= 1) {
        setCart([...cart, { product: product._id, name: product.name, salePrice: product.salePrice, quantity: 1 }]);
      } else { showToast('⚠️ Item Out of stock!'); }
    }
  };

  const removeFromCart = (id) => setCart(cart.filter(x => x.product !== id));

  const subTotal = cart.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
  const tax = subTotal * 0.05; 
  const total = subTotal + tax;

  const generateInvoice = (saleData, customerName) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24); doc.text('ZEESHA MOBILE', 105, 20, null, null, 'center');
    doc.setFontSize(12); doc.setFont('helvetica', 'normal');
    doc.text('Official Sales Receipt', 105, 28, null, null, 'center');
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 45);
    doc.text(`Receipt #: ${saleData._id.substring(0,8).toUpperCase()}`, 140, 45);
    doc.text(`Customer: ${customerName || 'Walk-in Customer'}`, 20, 52);
    doc.text(`Payment: ${saleData.paymentMethod}`, 140, 52);
    doc.text(`Cashier: ${user.name}`, 20, 59);
    
    doc.line(20, 65, 190, 65);
    doc.setFont('helvetica', 'bold');
    doc.text('Item Description', 20, 72);
    doc.text('Qty', 130, 72);
    doc.text('Price', 150, 72);
    doc.text('Amount', 175, 72);
    doc.line(20, 75, 190, 75);
    
    doc.setFont('helvetica', 'normal');
    let y = 82;
    cart.forEach(item => {
      doc.text(item.name.substring(0,40), 20, y);
      doc.text(item.quantity.toString(), 130, y);
      doc.text(`${item.salePrice}`, 150, y);
      doc.text(`${item.salePrice * item.quantity}`, 175, y);
      y += 8;
    });
    
    doc.line(120, y+5, 190, y+5);
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', 140, y+12); doc.text(`${saleData.subTotal}`, 175, y+12);
    doc.setFont('helvetica', 'normal');
    doc.text('Tax (5%):', 140, y+20); doc.text(`${saleData.tax}`, 175, y+20);
    
    doc.line(120, y+25, 190, y+25);
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 140, y+33); doc.text(`${saleData.total}`, 175, y+33);
    
    doc.setFontSize(10); doc.setFont('helvetica', 'italic');
    doc.text('Thank you for shopping at Zeesha Mobile!', 105, y+50, null, null, 'center');
    doc.text('Software developed by Zeesha Mobile Systems.', 105, y+55, null, null, 'center');
    
    doc.save(`Receipt_${saleData._id.substring(0,8)}.pdf`);
  };

  const handleCheckout = async () => {
    try {
      const { data } = await axios.post('https://zeesha-mobile.vercel.app/api/sales', {
        customer: selectedCustomer || null, items: cart, subTotal, tax, total, paymentMethod
      }, { headers: { Authorization: `Bearer ${user.token}` }});
      
      const custName = customers.find(c => c._id === selectedCustomer)?.name;
      generateInvoice(data, custName);
      showToast('✅ Sale Completed Successfully!');
      setCart([]); fetchProducts(); setSelectedCustomer('');
    } catch (err) { showToast('❌ ' + (err.response?.data?.message || 'Error processing sale')); }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.imeiSku?.includes(search) || p.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-[82vh] gap-6 relative">
      {toast && <div className="absolute top-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl z-50 text-lg font-medium animate-bounce flex items-center gap-2"><FaCheckCircle className="text-green-400"/> {toast}</div>}
      
      <div className="flex-[2] bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-200 flex items-center gap-3"><FaBox className="text-indigo-600"/> Products Catalog</h2>
          <div className="relative w-72">
            <input type="text" placeholder="Search product, category, IMEI..." className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" value={search} onChange={e=>setSearch(e.target.value)} />
            <FaSearch className="absolute left-3.5 top-4 text-gray-400" />
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 flex-1">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.length === 0 && <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">No products found matching your search.</p>}
            {filtered.map(p => (
              <div key={p._id} onClick={() => addToCart(p)} className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-5 border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${p.stockQty > 0 ? 'border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1' : 'opacity-60 border-red-200 bg-red-50/30'}`}>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-500 to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="flex justify-between items-start mb-3 z-10">
                     <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wider">{p.brand}</span>
                     <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${p.stockQty > 0 ? 'bg-green-50 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.stockQty > 0 ? `Stock: ${p.stockQty}` : 'Empty'}</span>
                  </div>
                  
                  <div className="h-28 mb-3 flex items-center justify-center">
                    {p.image ? (
                      <img src={p.image?.startsWith('data:') ? p.image : `https://zeesha-mobile.vercel.app${p.image}`} alt={p.name} className="max-h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <FaBox className="text-5xl text-gray-200 dark:text-gray-600 group-hover:text-indigo-200 transition-colors" />
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight mb-1 group-hover:text-indigo-600 transition-colors truncate">{p.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 truncate">{p.model}</p>
                  <div className="flex justify-between items-end mt-auto">
                    <span className="font-black text-2xl text-gray-900 dark:text-gray-100">${p.salePrice}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${p.stockQty > 0 ? 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-gray-100 text-gray-400'} transition-colors`}>+</div>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden min-w-[360px]">
        <div className="p-6 bg-gray-900 text-white flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2"><FaShoppingCart className="text-indigo-400"/> Current Bill</h2>
          <span className="bg-white dark:bg-gray-800/20 px-3 py-1 rounded-lg text-sm font-bold">{cart.reduce((a,b)=>a+b.quantity,0)} Items</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <FaShoppingCart className="text-6xl mb-4 opacity-20" />
              <p className="font-medium text-lg">Cart is empty</p>
              <p className="text-sm">Click on a product to add it.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col group">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-800 dark:text-gray-200 pr-8">{item.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.product); }} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><FaTrash /></button>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Qty: {item.quantity}</span>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">x ${item.salePrice}</span>
                    </div>
                    <span className="font-black text-lg text-indigo-600">${item.salePrice * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-10">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Customer</label>
              <div className="relative">
                <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                  <option value="">Walk-in Customer</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <FaUserPlus className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Payment</label>
              <div className="relative">
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit/Debit Card</option>
                  <option value="UPI">UPI / Transfer</option>
                </select>
                <FaFileInvoiceDollar className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3 mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium"><span>Subtotal</span><span>${subTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium"><span>Tax (5%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800 dark:text-gray-200">Total</span>
              <span className="text-3xl font-black text-indigo-600">${total.toFixed(2)}</span>
            </div>
          </div>
          
          <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] flex justify-center items-center gap-3">
            <FaCheckCircle /> Complete Sale & Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
export default POS;
