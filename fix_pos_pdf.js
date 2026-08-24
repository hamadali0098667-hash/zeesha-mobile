const fs = require('fs');
let content = fs.readFileSync('client/src/pages/POS.jsx', 'utf-8');

// Replace old jsPDF text align syntax with modern syntax
content = content.replace(/doc\.text\('ZEESHA MOBILE', 105, 20, null, null, 'center'\);/g, "doc.text('ZEESHA MOBILE', 105, 20, { align: 'center' });");
content = content.replace(/doc\.text\('Official Sales Receipt', 105, 28, null, null, 'center'\);/g, "doc.text('Official Sales Receipt', 105, 28, { align: 'center' });");
content = content.replace(/doc\.text\('Thank you for shopping at Zeesha Mobile!', 105, y\+50, null, null, 'center'\);/g, "doc.text('Thank you for shopping at Zeesha Mobile!', 105, y+50, { align: 'center' });");
content = content.replace(/doc\.text\('Software developed by Zeesha Mobile Systems\.', 105, y\+55, null, null, 'center'\);/g, "doc.text('Software developed by Zeesha Mobile Systems.', 105, y+55, { align: 'center' });");

// Make _id safe
content = content.replace(/saleData\._id\.substring/g, "(saleData._id || 'unknown').substring");

fs.writeFileSync('client/src/pages/POS.jsx', content);
