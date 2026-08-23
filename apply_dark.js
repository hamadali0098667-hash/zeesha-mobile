const fs = require('fs');
const path = require('path');

const applyDarkClasses = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      applyDarkClasses(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Basic generic replacements for dark mode
      content = content.replace(/bg-white/g, 'bg-white dark:bg-gray-800');
      content = content.replace(/bg-gray-50/g, 'bg-gray-50 dark:bg-gray-900');
      content = content.replace(/text-gray-900/g, 'text-gray-900 dark:text-gray-100');
      content = content.replace(/text-gray-800/g, 'text-gray-800 dark:text-gray-200');
      content = content.replace(/text-gray-700/g, 'text-gray-700 dark:text-gray-300');
      content = content.replace(/text-gray-600/g, 'text-gray-600 dark:text-gray-400');
      content = content.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');
      content = content.replace(/border-gray-100/g, 'border-gray-100 dark:border-gray-700');
      content = content.replace(/border-gray-200/g, 'border-gray-200 dark:border-gray-700');
      
      // Fix duplicate insertions just in case
      content = content.replace(/dark:bg-gray-800 dark:bg-gray-800/g, 'dark:bg-gray-800');
      content = content.replace(/dark:bg-gray-900 dark:bg-gray-900/g, 'dark:bg-gray-900');
      
      fs.writeFileSync(fullPath, content);
    }
  }
};

applyDarkClasses(path.join(__dirname, 'client', 'src', 'pages'));
console.log('Dark mode classes applied globally.');
