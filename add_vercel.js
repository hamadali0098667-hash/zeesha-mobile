const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, 'server');
const serverFile = path.join(serverDir, 'server.js');

// 1. Export app in server.js
let serverContent = fs.readFileSync(serverFile, 'utf8');
if (!serverContent.includes('module.exports = app;')) {
    serverContent += '\n\n// Export for Vercel Serverless\nmodule.exports = app;\n';
    fs.writeFileSync(serverFile, serverContent);
}

// 2. Create vercel.json in server
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
};

fs.writeFileSync(path.join(serverDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));

console.log('Vercel backend config added.');
