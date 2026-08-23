const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Settings.jsx', 'utf-8');
const exportIdx = content.indexOf('export default Settings;');
if(exportIdx !== -1) {
    content = content.substring(0, exportIdx + 'export default Settings;'.length) + '\n';
}
fs.writeFileSync('client/src/pages/Settings.jsx', content);
