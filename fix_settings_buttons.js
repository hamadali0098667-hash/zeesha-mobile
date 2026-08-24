const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Settings.jsx', 'utf-8');

// Replace the deactivate button block with edit, deactivate, and delete buttons
content = content.replace(
  /{user\._id !== s\._id && user\.role === 'admin' && \(\s*<button onClick=\{\(\) => toggleStatus[^>]+>\s*\{s\.isActive !== false \? 'Deactivate' : 'Activate'\}\s*<\/button>\s*\)}/m,
  `{user._id !== s._id && user.role === 'admin' && (
                      <div className="flex items-center gap-3 ml-2 border-l border-gray-200 dark:border-gray-700 pl-4">
                        <button onClick={() => handleEditStaff(s)} className="text-indigo-500 hover:text-indigo-700" title="Edit Staff">
                          <FaEdit />
                        </button>
                        <button onClick={() => toggleStatus(s._id, s.isActive !== false)} className="text-sm font-medium underline text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                          {s.isActive !== false ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDeleteStaff(s._id)} className="text-red-500 hover:text-red-700" title="Delete Staff">
                          <FaTrash />
                        </button>
                      </div>
                    )}`
);

// We need to import FaEdit and FaTrash if they aren't imported. Let's check imports.
if (!content.includes('FaEdit')) {
  content = content.replace("import { FaUpload, FaPlus } from 'react-icons/fa';", "import { FaUpload, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';");
}

fs.writeFileSync('client/src/pages/Settings.jsx', content);
