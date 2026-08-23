const axios = require('axios');

const test = async () => {
  try {
    const resAuth = await axios.post('http://localhost:5000/api/auth/login', { email: 'admin@zeeshamobile.com', password: 'password123' });
    const token = resAuth.data.token;
    const config = { headers: { Authorization: 'Bearer ' + token } };
    
    console.log('Login Success.');
    
    try {
      const custRes = await axios.post('http://localhost:5000/api/customers', { name: 'Ali', phone: '12345678', address: 'Lahore' }, config);
      console.log('Customer added: ', custRes.data._id);
    } catch(err) {
      console.error('Customer Add Error: ', err.response?.data || err.message);
    }
    
    console.log('Done.');
  } catch (error) {
    console.error('Test Failed: ', error.message);
  }
};
test();
