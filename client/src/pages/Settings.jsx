import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FaEdit, FaTrash } from 'react-icons/fa';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [staff, setStaff] = useState([]);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'cashier' });
  const [settings, setSettings] = useState({ shopName: '', shopLogo: '', currency: '$', sidebarPreference: 'Both' });
  const [newCategory, setNewCategory] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetchSettings();
    if (user.role === 'admin') fetchStaff();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('https://zeesha-mobile.vercel.app/api/settings', { headers: { Authorization: `Bearer ${user.token}` }});
      if(data) setSettings(data);
    } catch(err) { console.error('Error fetching settings', err); }
  };

  const fetchStaff = async () => {
    const { data } = await axios.get('https://zeesha-mobile.vercel.app/api/staff', { headers: { Authorization: `Bearer ${user.token}` }});
    setStaff(data);
  };

    const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setUploadingLogo(true);
    let logoUrl = settings.shopLogo;

    try {
      if (logoFile) {
        // Compress image locally instead of uploading a huge file
        logoUrl = await compressImage(logoFile);
      }

      const { data } = await axios.put('https://zeesha-mobile.vercel.app/api/settings', { 
        shopName: settings.shopName, 
        shopLogo: logoUrl, 
        currency: settings.currency, 
        sidebarPreference: settings.sidebarPreference,
        invoiceFooter: settings.invoiceFooter, 
        categories: settings.categories 
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSettings(data);
      setLogoFile(null);
      alert('Settings saved successfully! Refresh to apply globally.');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error saving settings');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if(window.confirm('Delete this staff member?')) {
      try {
        await axios.delete(`https://zeesha-mobile.vercel.app/api/staff/${id}`, { headers: { Authorization: `Bearer ${user.token}` }});
        fetchStaff();
      } catch(err) { alert('Error deleting staff'); }
    }
  };
  const handleEditStaff = (s) => {
    setEditingStaff(s._id);
    setNewStaff({ name: s.name, email: s.email, role: s.role, password: '' });
    setShowAddStaff(true);
  };
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://zeesha-mobile.vercel.app/api/staff', newStaff, { headers: { Authorization: `Bearer ${user.token}` }});
      setShowAddStaff(false);
      setNewStaff({ name: '', email: '', password: '', role: 'cashier' });
      fetchStaff();
    } catch(err) { alert(err.response?.data?.message || 'Error adding staff'); }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`https://zeesha-mobile.vercel.app/api/staff/${id}`, { isActive: !currentStatus }, { headers: { Authorization: `Bearer ${user.token}` }});
      fetchStaff();
    } catch(err) { alert('Error updating status'); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">System Settings</h1>
      
      {/* Shop Settings */}
      {user.role === 'admin' && (
        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Shop Branding & Config</h2>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Shop Name</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" value={settings.shopName} onChange={e=>setSettings({...settings, shopName: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Shop Logo</label>
                <div className="flex items-center gap-6">
                  {(logoFile || settings.shopLogo) ? (
                    <img src={logoFile ? URL.createObjectURL(logoFile) : (settings.shopLogo?.startsWith('data:') ? settings.shopLogo : `https://zeesha-mobile.vercel.app${settings.shopLogo}`)} alt="Shop Logo" className="h-12 w-12 object-contain bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-1" />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 border border-dashed border-gray-300 dark:border-gray-600">Logo</div>
                  )}
                  <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} className="text-sm text-gray-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Currency Symbol</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" value={settings.currency} onChange={e=>setSettings({...settings, currency: e.target.value})} placeholder="e.g. $ or Rs or ₹" />
              </div>

              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Sidebar Display</label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" value={settings.sidebarPreference || 'Both'} onChange={e=>setSettings({...settings, sidebarPreference: e.target.value})}>
                  <option value="Both">Logo & Name</option>
                  <option value="Logo">Logo Only</option>
                  <option value="Text">Name Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Invoice Footer Text</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" value={settings.invoiceFooter} onChange={e=>setSettings({...settings, invoiceFooter: e.target.value})} placeholder="e.g. Thank you for your business!" />
              </div>
            </div>

            <button type="submit" disabled={uploadingLogo} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50">
              {uploadingLogo ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}

      {/* Staff Settings */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Staff Management</h2>
          {user.role === 'admin' && (
            <button onClick={() => { setShowAddStaff(!showAddStaff); setEditingStaff(null); setNewStaff({ name: '', email: '', password: '', role: 'cashier' }); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm shadow-green-500/30 transition-colors">
              + Add New Staff
            </button>
          )}
        </div>

        {showAddStaff && (
          <form onSubmit={handleAddStaff} className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <input required type="text" placeholder="Full Name" className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={newStaff.name} onChange={e=>setNewStaff({...newStaff, name: e.target.value})} />
            <input required type="email" placeholder="Email Address" className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={newStaff.email} onChange={e=>setNewStaff({...newStaff, email: e.target.value})} />
            <input required type="text" placeholder="Password" className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={newStaff.password} onChange={e=>setNewStaff({...newStaff, password: e.target.value})} />
            <select required className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={newStaff.role} onChange={e=>setNewStaff({...newStaff, role: e.target.value})}>
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <div className="col-span-1 md:col-span-2 flex justify-end">
               <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold">{editingStaff ? 'Update Account' : 'Create Account'}</button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {staff.map(s => (
              <li key={s._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors gap-4">
                <div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    {s.name} 
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">{s.role}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 text-xs rounded-full font-bold shadow-sm ${s.isActive !== false ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {s.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                  {user._id !== s._id && user.role === 'admin' && (
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
                    )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
export default Settings;
