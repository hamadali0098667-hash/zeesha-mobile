const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Settings.jsx', 'utf-8');
content = content.replace("currency: ' });", "currency: '$', sidebarPreference: 'Both' });");
fs.writeFileSync('client/src/pages/Settings.jsx', content);
