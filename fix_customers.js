const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Customers.jsx', 'utf-8');

if (!content.includes('editingCustomer')) {
  content = content.replace(
    "import AuthContext from '../context/AuthContext';",
    "import AuthContext from '../context/AuthContext';\nimport { FaEdit, FaTrash } from 'react-icons/fa';"
  );

  content = content.replace(
    "const [formData, setFormData] = useState({ name: '', phone: '', address: '' });",
    "const [formData, setFormData] = useState({ name: '', phone: '', address: '' });\n  const [editingCustomer, setEditingCustomer] = useState(null);"
  );

  content = content.replace(
    "await axios.post('https://zeesha-mobile.vercel.app/api/customers', formData, { headers: { Authorization: `Bearer ${user.token}` }});",
    `if(editingCustomer) {
        await axios.put(\`https://zeesha-mobile.vercel.app/api/customers/\${editingCustomer}\`, formData, { headers: { Authorization: \`Bearer \${user.token}\` }});
      } else {
        await axios.post('https://zeesha-mobile.vercel.app/api/customers', formData, { headers: { Authorization: \`Bearer \${user.token}\` }});
      }`
  );

  content = content.replace(
    "setShowAdd(false);",
    "setShowAdd(false);\n      setEditingCustomer(null);"
  );

  content = content.replace(
    "const fetchCustomers",
    `const handleDelete = async (id) => {
    if(window.confirm('Delete customer?')) {
      try {
        await axios.delete(\`https://zeesha-mobile.vercel.app/api/customers/\${id}\`, { headers: { Authorization: \`Bearer \${user.token}\` }});
        fetchCustomers();
      } catch(err) { alert('Error deleting customer'); }
    }
  };
  const handleEdit = (c) => {
    setEditingCustomer(c._id);
    setFormData({ name: c.name, phone: c.phone, address: c.address });
    setShowAdd(true);
  };

  const fetchCustomers`
  );

  content = content.replace(
    "Save</button>",
    "{editingCustomer ? 'Update' : 'Save'}</button>"
  );

  content = content.replace(
    "<p>{c.address || 'No Address'}</p>",
    `<p>{c.address || 'No Address'}</p>
                <div className="flex gap-3 justify-end mt-2">
                  <button onClick={() => handleEdit(c)} className="text-indigo-500 hover:text-indigo-700"><FaEdit /></button>
                  <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                </div>`
  );

  content = content.replace(
    "Add Customer</button>",
    "{showAdd && !editingCustomer ? 'Cancel' : 'Add Customer'}</button>"
  );
  
  content = content.replace(
    "onClick={() => setShowAdd(!showAdd)}",
    "onClick={() => { setShowAdd(!showAdd); setEditingCustomer(null); setFormData({name:'', phone:'', address:''}); }}"
  );
}

fs.writeFileSync('client/src/pages/Customers.jsx', content);
console.log('Customers updated');
