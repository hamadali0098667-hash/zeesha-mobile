const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Settings.jsx', 'utf-8');
content = content.replace("currency: '\n  const [newCategory", "currency: '$', sidebarPreference: 'Both' });\n  const [newCategory");
fs.writeFileSync('client/src/pages/Settings.jsx', content);
