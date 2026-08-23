const fs = require('fs');

let content = fs.readFileSync('client/src/pages/POS.jsx', 'utf-8');

// 1. Add state variables
content = content.replace(
  "const [paymentMethod, setPaymentMethod] = useState('Cash');",
  "const [paymentMethod, setPaymentMethod] = useState('Cash');\n  const [taxRate, setTaxRate] = useState(0);\n  const [discount, setDiscount] = useState(0);"
);

// 2. Update calculation logic
content = content.replace(
  'const subTotal = cart.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0);',
  'const subTotal = cart.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0);\n  const tax = (subTotal * (Number(taxRate) || 0)) / 100;\n  const total = Math.max(0, (subTotal + tax) - (Number(discount) || 0));'
);
content = content.replace('const tax = subTotal * 0.05;', '');
content = content.replace('const total = subTotal + tax;', '');

// 3. Update checkout
content = content.replace(
  'customer: selectedCustomer || null, items: cart, subTotal, tax, total, paymentMethod',
  'customer: selectedCustomer || null, items: cart, subTotal, tax, taxRate: Number(taxRate) || 0, discount: Number(discount) || 0, total, paymentMethod'
);

// 4. Update inputs in JSX
const newInputs = `
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Discount Amount</label>
              <div className="relative">
                <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)} className="w-full pl-3 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Tax Rate (%)</label>
              <div className="relative">
                <input type="number" min="0" max="100" value={taxRate} onChange={e => setTaxRate(e.target.value)} className="w-full pl-3 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0" />
              </div>
            </div>
          </div>
`;
content = content.replace(
  '<div className="space-y-3 mb-6 bg-gray-50',
  newInputs + '\n          <div className="space-y-3 mb-6 bg-gray-50'
);

content = content.replace('<span>Tax (5%)</span>', '<span>Tax ({taxRate || 0}%)</span>');

content = content.replace(
  'doc.text(`Total: ${globalSettings?.currency || "$"}${total}`, 140, yPos);',
  'doc.text(`Tax: ${globalSettings?.currency || "$"}${tax.toFixed(2)}`, 140, yPos); yPos += 7;\n      doc.text(`Discount: -${globalSettings?.currency || "$"}${Number(discount).toFixed(2)}`, 140, yPos); yPos += 7;\n      doc.text(`Total: ${globalSettings?.currency || "$"}${total.toFixed(2)}`, 140, yPos);'
);

// Extra fix just in case the string matching was slightly off
content = content.replace('doc.text(`Total: ${globalSettings?.currency || "$"}${total.toFixed(2)}`, 140, yPos);', 
'doc.text(`Tax: ${globalSettings?.currency || "$"}${tax.toFixed(2)}`, 140, yPos); yPos += 7;\n      doc.text(`Discount: -${globalSettings?.currency || "$"}${Number(discount).toFixed(2)}`, 140, yPos); yPos += 7;\n      doc.text(`Total: ${globalSettings?.currency || "$"}${total.toFixed(2)}`, 140, yPos);');


fs.writeFileSync('client/src/pages/POS.jsx', content);
console.log('POS fixed');
