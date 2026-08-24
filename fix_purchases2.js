const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Purchases.jsx', 'utf-8');

const replacement = `const handleAddPurchase = async (e) => {
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
  };`;

content = content.replace(/const handleAddPurchase = async \(e\) => \{[\s\S]*?catch\(err\) \{ alert\('Error adding purchase'\); \}\s*\};/, replacement);

fs.writeFileSync('client/src/pages/Purchases.jsx', content);
