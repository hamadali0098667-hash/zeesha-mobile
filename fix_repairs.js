const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Repairs.jsx', 'utf-8');

if (!content.includes('activeTab')) {
  content = content.replace(
    "const [showAddForm, setShowAddForm] = useState(false);",
    "const [showAddForm, setShowAddForm] = useState(false);\n  const [activeTab, setActiveTab] = useState('All');"
  );

  content = content.replace(
    "const filteredRepairs = repairs",
    "const filteredByTab = activeTab === 'All' ? repairs : repairs.filter(r => r.status.toLowerCase() === activeTab.toLowerCase());\n  const filteredRepairs = filteredByTab"
  );
  
  if (!content.includes('filteredByTab')) {
      content = content.replace(
        "return (",
        `const tabs = ['All', 'Received', 'In Progress', 'Completed', 'Delivered'];
  const filteredRepairs = activeTab === 'All' ? repairs : repairs.filter(r => r.status.toLowerCase() === activeTab.toLowerCase());
  return (`
      );
      content = content.replace(
          "{repairs.map(r => (",
          "{filteredRepairs.map(r => ("
      );
  }

  const tabsJSX = `
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={\`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-colors \${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'}\`}>
            {tab}
          </button>
        ))}
      </div>
  `;

  content = content.replace(
    "{showAddForm && (",
    tabsJSX + "\n      {showAddForm && ("
  );
}

fs.writeFileSync('client/src/pages/Repairs.jsx', content);
console.log('Repairs updated');
