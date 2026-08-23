const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, 'client', 'src');

// 1. UPDATE Settings.jsx
const settingsFile = path.join(clientPath, 'pages', 'Settings.jsx');
let settingsContent = fs.readFileSync(settingsFile, 'utf8');

if (!settingsContent.includes('newCategory')) {
  // Add newCategory state
  settingsContent = settingsContent.replace(
    "const [settings, setSettings] = useState({ shopName: '', shopLogo: '', currency: '$', invoiceFooter: '' });",
    "const [settings, setSettings] = useState({ shopName: '', shopLogo: '', currency: '$', invoiceFooter: '', categories: [] });\n  const [newCategory, setNewCategory] = useState('');"
  );

  // Add categories to PUT request
  settingsContent = settingsContent.replace(
    "currency: settings.currency, invoiceFooter: settings.invoiceFooter }",
    "currency: settings.currency, invoiceFooter: settings.invoiceFooter, categories: settings.categories }"
  );

  // Add Category Management UI
  const categoryUI = `
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Product Categories</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {settings.categories?.map((cat, idx) => (
                  <span key={idx} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 border border-indigo-200 dark:border-indigo-800">
                    {cat}
                    <button type="button" onClick={() => setSettings({...settings, categories: settings.categories.filter((_, i) => i !== idx)})} className="text-indigo-500 hover:text-red-500 font-bold">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" className="w-full md:w-1/2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" value={newCategory} onChange={e=>setNewCategory(e.target.value)} placeholder="New Category Name" />
                <button type="button" onClick={() => {
                  if(newCategory && !settings.categories.includes(newCategory)) {
                    setSettings({...settings, categories: [...settings.categories, newCategory]});
                    setNewCategory('');
                  }
                }} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700">Add</button>
              </div>
            </div>
  `;
  settingsContent = settingsContent.replace(
    "            <button type=\"submit\" disabled={uploadingLogo}",
    categoryUI + "\n            <button type=\"submit\" disabled={uploadingLogo}"
  );
  fs.writeFileSync(settingsFile, settingsContent);
}

// 2. UPDATE Reports.jsx
const reportsFile = path.join(clientPath, 'pages', 'Reports.jsx');
let reportsContent = fs.readFileSync(reportsFile, 'utf8');

if (!reportsContent.includes("tab === 'purchases'")) {
  reportsContent = reportsContent.replace(
    "const [products, setProducts] = useState([]);",
    "const [products, setProducts] = useState([]);\n  const [purchases, setPurchases] = useState([]);"
  );

  reportsContent = reportsContent.replace(
    "setProducts(prodRes.data);",
    "setProducts(prodRes.data);\n      const purRes = await axios.get('http://localhost:5000/api/purchases', { headers: { Authorization: `Bearer ${user.token}` }});\n      setPurchases(purRes.data);"
  );

  reportsContent = reportsContent.replace(
    "<button onClick={()=>setTab('stock')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${tab==='stock' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'}`}>Stock & Inventory</button>",
    `<button onClick={()=>setTab('stock')} className={\`px-4 py-2 rounded-lg font-bold transition-colors \${tab==='stock' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'}\`}>Stock & Inventory</button>
        <button onClick={()=>setTab('purchases')} className={\`px-4 py-2 rounded-lg font-bold transition-colors \${tab==='purchases' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'}\`}>Supplier Purchases</button>`
  );

  const purchaseTab = `
      {tab === 'purchases' && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Total Purchases Volume: <span className="text-indigo-600">\${purchases.reduce((a, p) => a + p.totalCost, 0).toFixed(2)}</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Overview of all stock-in transactions grouped by supplier.</p>
          
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
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
                    <td className="p-3 text-right font-bold text-gray-900 dark:text-white">\${p.totalCost}</td>
                  </tr>
                ))}
                {purchases.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-500">No purchases found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
  `;
  reportsContent = reportsContent.replace("    </div>\n  );\n};\nexport default Reports;", purchaseTab + "\n    </div>\n  );\n};\nexport default Reports;");
  fs.writeFileSync(reportsFile, reportsContent);
}

// 3. UPDATE Inventory.jsx
const inventoryFile = path.join(clientPath, 'pages', 'Inventory.jsx');
let inventoryContent = fs.readFileSync(inventoryFile, 'utf8');

if (!inventoryContent.includes('shopSettings')) {
  inventoryContent = inventoryContent.replace(
    "const [products, setProducts] = useState([]);",
    "const [products, setProducts] = useState([]);\n  const [shopSettings, setShopSettings] = useState({ categories: [] });"
  );
  inventoryContent = inventoryContent.replace(
    "fetchProducts();\n  },",
    "fetchProducts();\n    axios.get('http://localhost:5000/api/settings').then(res => setShopSettings(res.data)).catch(e=>console.log(e));\n  },"
  );
  inventoryContent = inventoryContent.replace(
    '<input type="text" placeholder="Category"',
    '<select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="border border-gray-200 dark:border-gray-700 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">\n              <option value="">Select Category</option>\n              {shopSettings.categories?.map(c => <option key={c} value={c}>{c}</option>)}\n            </select>'
  );
  // Remove the old input completely (string replace will grab the rest of the old tag which might be messy, so I will use Regex)
  inventoryContent = inventoryContent.replace(/<input type="text" placeholder="Category"[\s\S]*?onChange=\{e => setNewProduct\(\{ \.\.\.newProduct, category: e\.target\.value \}\)\} \/>/, 
    '<select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="border border-gray-200 dark:border-gray-700 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">\n              <option value="">Select Category</option>\n              {shopSettings.categories?.map(c => <option key={c} value={c}>{c}</option>)}\n            </select>'
  );
  fs.writeFileSync(inventoryFile, inventoryContent);
}

console.log('Frontend updated for Categories and Supplier Reports.');
