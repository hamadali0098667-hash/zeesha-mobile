const dotenv = require('dotenv');

dotenv.config({ path: './server/.env' });

const API_URL = 'http://localhost:5000/api';
let adminToken, managerToken, cashierToken;
let adminId, managerId, cashierId;
let testProductId, testSupplierId, testCustomerId, testRepairId, testPurchaseId, testSaleId;

async function request(endpoint, method = 'GET', body = null, token = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (token) options.headers['Authorization'] = `Bearer ${token}`;
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${endpoint}`, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw { status: res.status, data };
  return { status: res.status, data };
}

async function runAudit() {
  console.log('--- STARTING COMPREHENSIVE AUDIT ---');

  // 1. LOGIN ADMIN
  try {
    const res = await request('/auth/login', 'POST', { email: 'admin@zeeshamobile.com', password: 'password123' });
    adminToken = res.data.token;
    adminId = res.data._id;
    console.log('✅ Admin Login Successful');
  } catch (e) {
    console.error('❌ Admin Login Failed:', e.data || e);
    return;
  }

  // 2. CHECK / CREATE STAFF
  try {
    const res = await request('/staff', 'GET', null, adminToken);
    const staff = res.data;
    const manager = staff.find(s => s.role === 'manager');
    const cashier = staff.find(s => s.role === 'cashier');
    
    if (manager) {
      managerId = manager._id;
      const mLogin = await request('/auth/login', 'POST', { email: manager.email, password: '123' });
      managerToken = mLogin.data.token;
      console.log('✅ Manager Login Successful');
    } else {
      console.log('Manager not found, testing creation...');
      const cm = await request('/staff', 'POST', { name: 'Manager', email: 'manager@test.com', password: '123', role: 'manager' }, adminToken);
      managerId = cm.data._id;
      const mLogin = await request('/auth/login', 'POST', { email: 'manager@test.com', password: '123' });
      managerToken = mLogin.data.token;
      console.log('✅ Manager Created & Logged in');
    }

    if (cashier) {
      cashierId = cashier._id;
      const cLogin = await request('/auth/login', 'POST', { email: cashier.email, password: '123' });
      cashierToken = cLogin.data.token;
      console.log('✅ Cashier Login Successful');
    } else {
      console.log('Cashier not found, testing creation...');
      const cc = await request('/staff', 'POST', { name: 'Cashier', email: 'cashier@test.com', password: '123', role: 'cashier' }, adminToken);
      cashierId = cc.data._id;
      const cLogin = await request('/auth/login', 'POST', { email: 'cashier@test.com', password: '123' });
      cashierToken = cLogin.data.token;
      console.log('✅ Cashier Created & Logged in');
    }
  } catch (e) {
    console.error('❌ Staff fetch/login failed:', e.data || e);
  }

  // 3. SETTINGS / CATEGORIES
  try {
    const res = await request('/settings');
    let categories = res.data.categories || [];
    if (!categories.includes('TestCategory')) {
      categories.push('TestCategory');
      await request('/settings', 'PUT', { categories }, adminToken);
    }
    console.log('✅ Settings/Categories Verified');
  } catch (e) {
    console.error('❌ Settings Failed:', e.data || e);
  }

  // 4. INVENTORY / PRODUCTS
  try {
    const addRes = await request('/products', 'POST', {
      name: 'Samsung Galaxy A15', brand: 'Samsung', model: 'A15', imeiSku: 'IMEI-A15-TEST',
      category: 'Smartphones', costPrice: 150, salePrice: 200, stockQty: 10, lowStockThreshold: 2
    }, adminToken);
    testProductId = addRes.data._id;
    console.log('✅ Product Added:', testProductId);
  } catch (e) {
    if (e.data?.message === 'Product with this IMEI/SKU already exists') {
      const prods = await request('/products', 'GET', null, adminToken);
      testProductId = prods.data.find(p => p.imeiSku === 'IMEI-A15-TEST')._id;
      console.log('✅ Product Already Exists:', testProductId);
    } else {
      console.error('❌ Product Add Failed:', e.data || e);
    }
  }

  // 5. SUPPLIERS
  try {
    const supRes = await request('/suppliers', 'POST', {
      name: 'Tech World', phone: '123456789', email: 'tech@world.com', address: 'Dubai'
    }, adminToken);
    testSupplierId = supRes.data._id;
    console.log('✅ Supplier Added:', testSupplierId);
  } catch (e) {
    const sups = await request('/suppliers', 'GET', null, adminToken);
    if(sups.data.length > 0) testSupplierId = sups.data[0]._id;
    console.log('✅ Using existing supplier:', testSupplierId);
  }

  // 6. PURCHASES (STOCK UPDATE TEST)
  try {
    // Get current stock
    const prodsBefore = await request('/products', 'GET', null, adminToken);
    const stockBefore = prodsBefore.data.find(p => p._id === testProductId).stockQty;

    const purRes = await request('/purchases', 'POST', {
      supplier: testSupplierId,
      items: [{ product: testProductId, quantity: 5, costPrice: 150 }],
      totalCost: 750
    }, adminToken);
    testPurchaseId = purRes.data._id;
    
    const prodsAfter = await request('/products', 'GET', null, adminToken);
    const stockAfter = prodsAfter.data.find(p => p._id === testProductId).stockQty;
    
    if (stockAfter === stockBefore + 5) {
      console.log('✅ Purchase created & Stock updated successfully!');
    } else {
      console.error(`❌ Purchase Stock Update Failed! Before: ${stockBefore}, After: ${stockAfter}`);
    }
  } catch (e) {
    console.error('❌ Purchase Failed:', e.data || e);
  }

  // 7. CUSTOMERS
  try {
    const custRes = await request('/customers', 'POST', {
      name: 'Usman Tariq', phone: '0987654321', address: 'Lahore'
    }, adminToken);
    testCustomerId = custRes.data._id;
    console.log('✅ Customer Added:', testCustomerId);
  } catch (e) {
    const custs = await request('/customers', 'GET', null, adminToken);
    if(custs.data.length > 0) testCustomerId = custs.data[0]._id;
    console.log('✅ Using existing customer:', testCustomerId);
  }

  // 8. SALES (STOCK DEDUCTION TEST)
  try {
    const prodsBefore = await request('/products', 'GET', null, adminToken);
    const stockBefore = prodsBefore.data.find(p => p._id === testProductId).stockQty;

    const saleRes = await request('/sales', 'POST', {
      customer: testCustomerId,
      items: [{ product: testProductId, quantity: 2, price: 200 }],
      subTotal: 400, tax: 0, total: 400, paymentMethod: 'Cash'
    }, cashierToken || adminToken);
    
    testSaleId = saleRes.data._id;
    
    const prodsAfter = await request('/products', 'GET', null, adminToken);
    const stockAfter = prodsAfter.data.find(p => p._id === testProductId).stockQty;
    
    if (stockAfter === stockBefore - 2) {
      console.log('✅ Sale created & Stock deducted successfully!');
    } else {
      console.error(`❌ Sale Stock Deduction Failed! Before: ${stockBefore}, After: ${stockAfter}`);
    }
  } catch (e) {
    console.error('❌ Sale Failed:', e.data || e);
  }

  // 9. REPAIRS
  try {
    const repRes = await request('/repairs', 'POST', {
      customer: testCustomerId, deviceModel: 'iPhone 13', issueDescription: 'Screen broken', estimatedCost: 150
    }, adminToken);
    testRepairId = repRes.data._id;
    console.log('✅ Repair Created:', testRepairId);
    
    // Status update
    await request(`/repairs/${testRepairId}`, 'PUT', { status: 'In-Progress' }, adminToken);
    console.log('✅ Repair Status Updated');
  } catch (e) {
    console.error('❌ Repair Failed:', e.data || e);
  }

  console.log('--- AUDIT COMPLETE ---');
}

runAudit();
