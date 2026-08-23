const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'client', 'src');

const mainJsx = `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`;

const appJsx = `
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Mock empty pages for routing before they are fully built
const Placeholder = ({name}) => <div className="p-4 bg-white rounded shadow text-xl">{name} Page</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="pos" element={<Placeholder name="POS / Sales" />} />
            <Route path="inventory" element={<ProtectedRoute roles={['admin', 'manager']}><Placeholder name="Inventory" /></ProtectedRoute>} />
            <Route path="purchases" element={<ProtectedRoute roles={['admin', 'manager']}><Placeholder name="Purchases" /></ProtectedRoute>} />
            <Route path="customers" element={<Placeholder name="Customers" />} />
            <Route path="repairs" element={<Placeholder name="Repairs" />} />
            <Route path="reports" element={<ProtectedRoute roles={['admin', 'manager']}><Placeholder name="Reports" /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute roles={['admin']}><Placeholder name="Settings" /></ProtectedRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
`;

const indexCss = `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`;

const tailwindConfig = `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;

fs.writeFileSync(path.join(srcPath, 'main.jsx'), mainJsx.trim());
fs.writeFileSync(path.join(srcPath, 'App.jsx'), appJsx.trim());
fs.writeFileSync(path.join(srcPath, 'index.css'), indexCss.trim());
fs.writeFileSync(path.join(__dirname, 'client', 'tailwind.config.js'), tailwindConfig.trim());

console.log('App.jsx, main.jsx, tailwind config generated.');
