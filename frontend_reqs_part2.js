const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'client', 'src');

// 1. Settings.jsx update
let settingsJsx = fs.readFileSync(path.join(srcPath, 'pages', 'Settings.jsx'), 'utf8');
if (!settingsJsx.includes('currency')) {
  settingsJsx = settingsJsx.replace(
    "const [settings, setSettings] = useState({ shopName: '', shopLogo: '' });",
    "const [settings, setSettings] = useState({ shopName: '', shopLogo: '', currency: '$', invoiceFooter: '' });"
  );
  
  settingsJsx = settingsJsx.replace(
    "const { data } = await axios.put('http://localhost:5000/api/settings', { shopName: settings.shopName, shopLogo: logoUrl }",
    "const { data } = await axios.put('http://localhost:5000/api/settings', { shopName: settings.shopName, shopLogo: logoUrl, currency: settings.currency, invoiceFooter: settings.invoiceFooter }"
  );

  const inputsToAdd = `
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Currency Symbol</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" value={settings.currency} onChange={e=>setSettings({...settings, currency: e.target.value})} placeholder="e.g. $ or Rs or ₹" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Invoice Footer Text</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" value={settings.invoiceFooter} onChange={e=>setSettings({...settings, invoiceFooter: e.target.value})} placeholder="e.g. Thank you for your business!" />
              </div>
            </div>
  `;
  settingsJsx = settingsJsx.replace(
    "onChange={e=>setSettings({...settings, shopName: e.target.value})} />\n            </div>",
    "onChange={e=>setSettings({...settings, shopName: e.target.value})} />\n            </div>\n" + inputsToAdd
  );
  fs.writeFileSync(path.join(srcPath, 'pages', 'Settings.jsx'), settingsJsx);
}

// 2. Sidebar.jsx
let sidebarJsx = fs.readFileSync(path.join(srcPath, 'components', 'Sidebar.jsx'), 'utf8');
if (!sidebarJsx.includes('to="/suppliers"')) {
  sidebarJsx = sidebarJsx.replace(
    '<NavLink to="/inventory" className={navLinkClass}>\n          <FaBox /> Inventory\n        </NavLink>',
    '<NavLink to="/inventory" className={navLinkClass}>\n          <FaBox /> Inventory\n        </NavLink>\n        {(user.role === "admin" || user.role === "manager") && (\n          <NavLink to="/suppliers" className={navLinkClass}>\n            <FaStore /> Suppliers\n          </NavLink>\n        )}'
  );
  fs.writeFileSync(path.join(srcPath, 'components', 'Sidebar.jsx'), sidebarJsx);
}

// 3. App.jsx
let appJsx = fs.readFileSync(path.join(srcPath, 'App.jsx'), 'utf8');
if (!appJsx.includes('Suppliers')) {
  appJsx = appJsx.replace("import Customers from './pages/Customers';", "import Customers from './pages/Customers';\nimport Suppliers from './pages/Suppliers';");
  appJsx = appJsx.replace(
    '<Route path="/customers" element={<Customers />} />',
    '<Route path="/customers" element={<Customers />} />\n                <Route path="/suppliers" element={<Suppliers />} />'
  );
  fs.writeFileSync(path.join(srcPath, 'App.jsx'), appJsx);
}
console.log('App, Sidebar, Settings updated.');
