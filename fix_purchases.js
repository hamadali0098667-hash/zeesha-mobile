const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Purchases.jsx', 'utf-8');

// Add state for editingPurchase
content = content.replace(
  /const \[showAddPurchase, setShowAddPurchase\] = useState\(false\);/,
  `const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);`
);

// Update handleAddPurchase to handle both create and update
content = content.replace(
  /const handleAddPurchase = async \(e\) => \{[\s\S]*?fetchProducts\(\);\s*\}\s*catch \(error\) \{[\s\S]*?\}\s*\};/,
  `const handleAddPurchase = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        supplier: newPurchase.supplier,
        items: [{ product: newPurchase.product, quantity: Number(newPurchase.quantity), cost: Number(newPurchase.cost) }],
        totalCost: Number(newPurchase.quantity) * Number(newPurchase.cost)
      };
      if (editingPurchaseId) {
        await axios.put(\`https://zeesha-mobile.vercel.app/api/purchases/\${editingPurchaseId}\`, payload, { headers: { Authorization: \`Bearer \${user.token}\` }});
      } else {
        await axios.post('https://zeesha-mobile.vercel.app/api/purchases', payload, { headers: { Authorization: \`Bearer \${user.token}\` }});
      }
      setNewPurchase({ supplier: '', product: '', quantity: '', cost: '' });
      setShowAddPurchase(false);
      setEditingPurchaseId(null);
      fetchPurchases();
      fetchProducts();
    } catch (error) {
      alert('Error saving purchase');
    }
  };

  const handleEditPurchase = (p) => {
    setEditingPurchaseId(p._id);
    setNewPurchase({
      supplier: p.supplier?._id || '',
      product: p.items[0]?.product || '',
      quantity: p.items[0]?.quantity || '',
      cost: p.items[0]?.cost || ''
    });
    setShowAddPurchase(true);
  };

  const handleDeletePurchase = async (id) => {
    if(window.confirm('Delete purchase and revert stock?')) {
      try {
        await axios.delete(\`https://zeesha-mobile.vercel.app/api/purchases/\${id}\`, { headers: { Authorization: \`Bearer \${user.token}\` }});
        fetchPurchases();
        fetchProducts();
      } catch(err) { alert('Error deleting'); }
    }
  };`
);

// Add table headers
content = content.replace(
  /<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Cost<\/th>/,
  `<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Cost</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>`
);

// Add table data actions
content = content.replace(
  /<td className="px-6 py-4 font-bold">\{globalSettings\?\.currency \|\| "\$"\}\{p\.totalCost\}<\/td>\s*<\/tr>/g,
  `<td className="px-6 py-4 font-bold">{globalSettings?.currency || "$"}{p.totalCost}</td>
  <td className="px-6 py-4 flex gap-3">
    <button onClick={() => handleEditPurchase(p)} className="text-indigo-500 hover:text-indigo-700" title="Edit"><FaEdit /></button>
    <button onClick={() => handleDeletePurchase(p._id)} className="text-red-500 hover:text-red-700" title="Delete"><FaTrash /></button>
  </td>
</tr>`
);

// Ensure FaEdit and FaTrash are imported
if(!content.includes('FaEdit')) {
  content = content.replace(/from 'react-icons\/fa';/, ", FaEdit, FaTrash from 'react-icons/fa';");
}

fs.writeFileSync('client/src/pages/Purchases.jsx', content);
