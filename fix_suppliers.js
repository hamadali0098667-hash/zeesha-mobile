const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Purchases.jsx', 'utf-8');

if(!content.includes('editingSupplier')) {
  content = content.replace(
    "const [showAddSupplier, setShowAddSupplier] = useState(false);",
    "const [showAddSupplier, setShowAddSupplier] = useState(false);\n  const [editingSupplier, setEditingSupplier] = useState(null);"
  );

  content = content.replace(
    "await axios.post('https://zeesha-mobile.vercel.app/api/suppliers', newSupplier, { headers: { Authorization: `Bearer ${user.token}` }});",
    `if(editingSupplier) {
        await axios.put(\`https://zeesha-mobile.vercel.app/api/suppliers/\${editingSupplier}\`, newSupplier, { headers: { Authorization: \`Bearer \${user.token}\` }});
      } else {
        await axios.post('https://zeesha-mobile.vercel.app/api/suppliers', newSupplier, { headers: { Authorization: \`Bearer \${user.token}\` }});
      }`
  );
  
  content = content.replace(
    "setNewSupplier({ name: '', contact: '', address: '' });",
    "setNewSupplier({ name: '', contact: '', address: '' });\n      setEditingSupplier(null);"
  );
  
  content = content.replace(
    "const handleAddPurchase",
    `const handleDeleteSupplier = async (id) => {
    if(window.confirm('Delete supplier?')) {
      try {
        await axios.delete(\`https://zeesha-mobile.vercel.app/api/suppliers/\${id}\`, { headers: { Authorization: \`Bearer \${user.token}\` }});
        fetchSuppliers();
      } catch(err) { alert('Error deleting supplier'); }
    }
  };
  const handleEditSupplier = (s) => {
    setEditingSupplier(s._id);
    setNewSupplier({ name: s.name, contact: s.contact, address: s.address });
    setShowAddSupplier(true);
  };

  const handleAddPurchase`
  );

  content = content.replace(
    "Save Supplier</button>",
    "{editingSupplier ? 'Update Supplier' : 'Save Supplier'}</button>"
  );

  content = content.replace(
    "import axios from 'axios';",
    "import axios from 'axios';\nimport { FaEdit, FaTrash } from 'react-icons/fa';"
  );

  content = content.replace(
    "<span className=\"text-gray-500 dark:text-gray-400\">{s.address}</span>",
    `<span className="text-gray-500 dark:text-gray-400">{s.address}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEditSupplier(s)} className="text-indigo-500"><FaEdit /></button>
                  <button onClick={() => handleDeleteSupplier(s._id)} className="text-red-500"><FaTrash /></button>
                </div>`
  );
}

fs.writeFileSync('client/src/pages/Purchases.jsx', content);
console.log('Purchases updated');
