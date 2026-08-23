const fs = require('fs');

function fixFile(file, replacements) {
    let content = fs.readFileSync(file, 'utf-8');
    if(!content.includes('globalSettings')) {
        content = content.replace('const { user } = useContext(AuthContext);', 'const { user, globalSettings } = useContext(AuthContext);');
        content = content.replace('const { user, logout } = useContext(AuthContext);', 'const { user, logout, globalSettings } = useContext(AuthContext);');
    }
    
    replacements.forEach(r => {
        content = content.split(r.from).join(r.to);
    });
    
    fs.writeFileSync(file, content);
}

fixFile('client/src/pages/Dashboard.jsx', [
    { from: '>${stats.salesToday}</p>', to: '>{globalSettings?.currency || "$"}{stats.salesToday}</p>' },
    { from: '>${stats.totalStockValue}</p>', to: '>{globalSettings?.currency || "$"}{stats.totalStockValue}</p>' }
]);

fixFile('client/src/pages/Inventory.jsx', [
    { from: '>${p.salePrice}</td>', to: '>{globalSettings?.currency || "$"}{p.salePrice}</td>' },
    { from: '>${p.costPrice}</td>', to: '>{globalSettings?.currency || "$"}{p.costPrice}</td>' }
]);

fixFile('client/src/pages/POS.jsx', [
    { from: '>${p.salePrice}</span>', to: '>{globalSettings?.currency || "$"}{p.salePrice}</span>' },
    { from: '>x ${item.salePrice}</span>', to: '>x {globalSettings?.currency || "$"}{item.salePrice}</span>' },
    { from: '>${item.salePrice * item.quantity}</span>', to: '>{globalSettings?.currency || "$"}{item.salePrice * item.quantity}</span>' },
    { from: '><span>${subTotal.toFixed(2)}</span>', to: '><span>{globalSettings?.currency || "$"}{subTotal.toFixed(2)}</span>' },
    { from: '><span>${tax.toFixed(2)}</span>', to: '><span>{globalSettings?.currency || "$"}{tax.toFixed(2)}</span>' },
    { from: '>${total.toFixed(2)}</span>', to: '>{globalSettings?.currency || "$"}{total.toFixed(2)}</span>' },
    { from: 'Total: $${total}', to: 'Total: ${globalSettings?.currency || "$"}${total}' }
]);

fixFile('client/src/pages/Purchases.jsx', [
    { from: '>${p.cost}</td>', to: '>{globalSettings?.currency || "$"}{p.cost}</td>' },
    { from: '>${p.totalCost}</td>', to: '>{globalSettings?.currency || "$"}{p.totalCost}</td>' }
]);

fixFile('client/src/pages/Repairs.jsx', [
    { from: '>Est: $${r.estimatedCost}</td>', to: '>Est: {globalSettings?.currency || "$"}{r.estimatedCost}</td>' }
]);

fixFile('client/src/pages/Reports.jsx', [
    { from: '>${totalSales.toFixed(2)}</span>', to: '>{globalSettings?.currency || "$"}{totalSales.toFixed(2)}</span>' },
    { from: '>${s.total}</td>', to: '>{globalSettings?.currency || "$"}{s.total}</td>' },
    { from: '>${totalStockValue.toFixed(2)}</p>', to: '>{globalSettings?.currency || "$"}{totalStockValue.toFixed(2)}</p>' },
    { from: '>${purchases.reduce((a, p) => a + p.totalCost, 0).toFixed(2)}</span>', to: '>{globalSettings?.currency || "$"}{purchases.reduce((a, p) => a + p.totalCost, 0).toFixed(2)}</span>' },
    { from: '>${p.totalCost}</td>', to: '>{globalSettings?.currency || "$"}{p.totalCost}</td>' }
]);

console.log('Currency replaced!');
