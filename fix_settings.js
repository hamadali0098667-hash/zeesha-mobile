const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Settings.jsx', 'utf-8');

// 1. sidebarPreference state
content = content.replace(
  "shopName: '', shopLogo: '', currency: '$', invoiceFooter: '', categories: []",
  "shopName: '', shopLogo: '', currency: '$', invoiceFooter: '', categories: [], sidebarPreference: 'Both'"
);

// 2. Add sidebar display dropdown
const sidebarHTML = `
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Sidebar Display</label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" value={settings.sidebarPreference || 'Both'} onChange={e=>setSettings({...settings, sidebarPreference: e.target.value})}>
                  <option value="Both">Logo and Shop Name</option>
                  <option value="Logo">Logo Only</option>
                  <option value="Text">Shop Name Only</option>
                </select>
              </div>
`;
content = content.replace(
  "<div>\n                <label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2\">Currency Symbol</label>",
  sidebarHTML + "<div>\n                <label className=\"block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2\">Currency Symbol</label>"
);

// 3. Remove Categories
const catStart = content.indexOf('<div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">');
const catEnd = content.indexOf('<button type="submit" disabled={uploadingLogo}');
if(catStart !== -1 && catEnd !== -1) {
    content = content.substring(0, catStart) + content.substring(catEnd);
}

// 4. Staff Edit/Delete
if (!content.includes('editingStaff')) {
  content = content.replace(
    "const [showAddStaff, setShowAddStaff] = useState(false);",
    "const [showAddStaff, setShowAddStaff] = useState(false);\n  const [editingStaff, setEditingStaff] = useState(null);"
  );

  content = content.replace(
    "const handleAddStaff",
    `const handleDeleteStaff = async (id) => {
    if(window.confirm('Delete this staff member?')) {
      try {
        await axios.delete(\`https://zeesha-mobile.vercel.app/api/staff/\${id}\`, { headers: { Authorization: \`Bearer \${user.token}\` }});
        fetchStaff();
      } catch(err) { alert('Error deleting staff'); }
    }
  };
  const handleEditStaff = (s) => {
    setEditingStaff(s._id);
    setNewStaff({ name: s.name, email: s.email, role: s.role, password: '' });
    setShowAddStaff(true);
  };
  const handleAddStaff`
  );
  
  content = content.replace(
    "const userExists",
    "if(editingStaff) {\n      await axios.put(`https://zeesha-mobile.vercel.app/api/staff/${editingStaff}`, newStaff, { headers: { Authorization: `Bearer ${user.token}` }});\n      setShowAddStaff(false);\n      setEditingStaff(null);\n      fetchStaff();\n      return;\n    }\n    const userExists"
  );
  
  content = content.replace(
    "Create Account</button>",
    "{editingStaff ? 'Update Account' : 'Create Account'}</button>"
  );

  content = content.replace(
    "onClick={() => setShowAddStaff(!showAddStaff)}",
    "onClick={() => { setShowAddStaff(!showAddStaff); setEditingStaff(null); setNewStaff({ name: '', email: '', password: '', role: 'cashier' }); }}"
  );

  content = content.replace(
    "{s.isActive !== false ? 'Deactivate' : 'Activate'}\n                    </button>\n                  )}",
    `{s.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                  {user._id !== s._id && user.role === 'admin' && (
                     <div className="flex gap-3">
                        <button onClick={() => handleEditStaff(s)} className="text-indigo-500 hover:text-indigo-700">Edit</button>
                        <button onClick={() => handleDeleteStaff(s._id)} className="text-red-500 hover:text-red-700">Delete</button>
                     </div>
                  )}`
  );
}

fs.writeFileSync('client/src/pages/Settings.jsx', content);
console.log('Settings updated');
