const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, 'client', 'src');

function fixImageSrc(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace simple template strings: \`https://zeesha-mobile.vercel.app\${variable}\`
  // with a conditional: \${variable?.startsWith('data:') ? variable : \`https://zeesha-mobile.vercel.app\${variable}\`}
  
  // 1. Sidebar.jsx logo
  content = content.replace(
    /\`https:\/\/zeesha-mobile\.vercel\.app\$\{shopSettings\.shopLogo\}\`/g,
    "{shopSettings.shopLogo?.startsWith('data:') ? shopSettings.shopLogo : `https://zeesha-mobile.vercel.app${shopSettings.shopLogo}`}"
  );
  
  // 2. Settings.jsx logo
  content = content.replace(
    /\`https:\/\/zeesha-mobile\.vercel\.app\$\{settings\.shopLogo\}\`/g,
    "(settings.shopLogo?.startsWith('data:') ? settings.shopLogo : `https://zeesha-mobile.vercel.app${settings.shopLogo}`)"
  );
  
  // 3. Inventory.jsx & POS.jsx product image
  content = content.replace(
    /\`https:\/\/zeesha-mobile\.vercel\.app\$\{p\.image\}\`/g,
    "{p.image?.startsWith('data:') ? p.image : `https://zeesha-mobile.vercel.app${p.image}`}"
  );

  fs.writeFileSync(filePath, content);
}

fixImageSrc(path.join(clientPath, 'components', 'Sidebar.jsx'));
fixImageSrc(path.join(clientPath, 'pages', 'Settings.jsx'));
fixImageSrc(path.join(clientPath, 'pages', 'Inventory.jsx'));
fixImageSrc(path.join(clientPath, 'pages', 'POS.jsx'));

console.log('Fixed image URLs for Base64 compatibility');
