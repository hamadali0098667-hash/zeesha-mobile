const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Reports.jsx', 'utf-8');

// 1. Fix the top div structure
content = content.replace(
  '<div className="flex justify-between items-center mb-6">\n        <div className="flex gap-4 overflow-x-auto pb-2">\n        <button onClick={()=>setTab(\'sales\')}',
  '<div className="flex gap-4 mb-6">\n        <button onClick={()=>setTab(\'sales\')}'
);
// It was mangled, let's just do a clean replacement by searching for the buttons.
// Alternatively, let's just rewrite the entire file since it's short.
