import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalSettings, setGlobalSettings] = useState({ currency: ', shopName: 'Zeesha Mobile', shopLogo: '', categories: [] });
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    axios.get('https://zeesha-mobile.vercel.app/api/settings').then(res => { if(res.data) setGlobalSettings(res.data); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('https://zeesha-mobile.vercel.app/api/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, globalSettings, setGlobalSettings }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
