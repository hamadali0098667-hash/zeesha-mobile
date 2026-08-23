const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'client', 'src', 'pages', 'Customers.jsx');
let content = fs.readFileSync(file, 'utf8');

// The modal code is everything between "{selectedCustomer && (" and "  \nexport default Customers;"
const match = content.match(/(\s*\{selectedCustomer && \([\s\S]*?\)\s*\})/);
if (match) {
  const modalCode = match[1];
  // Remove it from the end
  content = content.replace(modalCode, '');
  
  // Insert it before the final "</div>\n  );\n};"
  content = content.replace('    </div>\n  );\n};', modalCode + '\n    </div>\n  );\n};');
  fs.writeFileSync(file, content);
}
console.log('Fixed Customers.jsx');
