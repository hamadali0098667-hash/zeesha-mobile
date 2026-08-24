const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Settings.jsx', 'utf-8');

const sidebarHtml = `
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Sidebar Display</label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" value={settings.sidebarPreference || 'Both'} onChange={e=>setSettings({...settings, sidebarPreference: e.target.value})}>
                  <option value="Both">Logo & Name</option>
                  <option value="Logo">Logo Only</option>
                  <option value="Text">Name Only</option>
                </select>
              </div>
`;

content = content.replace(
  /(<div>\s*<label[^>]*>Invoice Footer Text<\/label>)/,
  sidebarHtml + '\n              $1'
);

fs.writeFileSync('client/src/pages/Settings.jsx', content);
