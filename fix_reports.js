const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Reports.jsx', 'utf-8');

if (!content.includes('import jsPDF')) {
  content = content.replace(
    "import AuthContext from '../context/AuthContext';",
    "import AuthContext from '../context/AuthContext';\nimport jsPDF from 'jspdf';\nimport 'jspdf-autotable';"
  );
  
  content = content.replace(
    "const lowStockProducts",
    `const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(\`Zeesha Mobile - \${tab.toUpperCase()} REPORT\`, 14, 22);
    doc.setFontSize(11);
    doc.text(\`Generated: \${new Date().toLocaleString()}\`, 14, 30);

    if (tab === 'sales') {
      doc.autoTable({
        startY: 40,
        head: [['Date', 'Invoice ID', 'Customer', 'Items', 'Total']],
        body: sales.map(s => [
          new Date(s.date).toLocaleDateString(),
          s._id.slice(-6).toUpperCase(),
          s.customer?.name || 'Walk-in',
          s.items.reduce((a, b) => a + b.quantity, 0),
          \`\${globalSettings?.currency || "$"}\${s.total}\`
        ])
      });
    } else if (tab === 'stock') {
      doc.autoTable({
        startY: 40,
        head: [['Product', 'Category', 'Stock', 'Value']],
        body: products.map(p => [
          p.name,
          p.category,
          p.stockQty.toString(),
          \`\${globalSettings?.currency || "$"}\${p.costPrice * p.stockQty}\`
        ])
      });
    } else {
      doc.autoTable({
        startY: 40,
        head: [['Date', 'Supplier', 'Items', 'Total Cost']],
        body: purchases.map(p => [
          new Date(p.date).toLocaleDateString(),
          p.supplier?.name || 'Unknown',
          p.items.length.toString(),
          \`\${globalSettings?.currency || "$"}\${p.totalCost}\`
        ])
      });
    }
    doc.save(\`\${tab}-report.pdf\`);
  };
  
  const lowStockProducts`
  );

  content = content.replace(
    '<div className="flex gap-4 mb-6">',
    `<div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 overflow-x-auto pb-2">`
  );
  
  content = content.replace(
    "</button>\n      </div>",
    `</button>
        </div>
        <button onClick={exportPDF} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-green-700 transition whitespace-nowrap">
          Export PDF
        </button>
      </div>`
  );
}

fs.writeFileSync('client/src/pages/Reports.jsx', content);
console.log('Reports updated with PDF export');
