/**
 * Test Backend Connection
 * Run this to verify backend is working properly
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

console.log('🧪 Testing Backend Connection...\n');

// Test 1: Health Check
async function testHealthCheck() {
  try {
    console.log('1️⃣ Testing Health Check...');
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Health Check: PASSED');
      console.log('   Server is running:', data.message);
    } else {
      console.log('❌ Health Check: FAILED');
    }
  } catch (error) {
    console.log('❌ Health Check: ERROR -', error.message);
  }
  console.log('');
}

// Test 2: Check Mobile Endpoint
async function testCheckMobile() {
  try {
    console.log('2️⃣ Testing Check Mobile Endpoint...');
    const response = await fetch(`${API_BASE}/api/workers/check-mobile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543210' })
    });
    const data = await response.json();
    
    if (data.success !== undefined) {
      console.log('✅ Check Mobile: PASSED');
      console.log('   Worker exists:', data.exists);
    } else {
      console.log('❌ Check Mobile: FAILED');
    }
  } catch (error) {
    console.log('❌ Check Mobile: ERROR -', error.message);
  }
  console.log('');
}

// Test 3: Worker Login (will fail if no worker exists)
async function testWorkerLogin() {
  try {
    console.log('3️⃣ Testing Worker Login Endpoint...');
    const response = await fetch(`${API_BASE}/api/auth/worker/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        mobile: '9876543210',
        password: '123456'
      })
    });
    const data = await response.json();
    
    if (response.status === 401) {
      console.log('✅ Worker Login Endpoint: WORKING (No worker found - expected)');
    } else if (data.success) {
      console.log('✅ Worker Login: SUCCESS');
      console.log('   Token received:', data.token ? 'Yes' : 'No');
    } else {
      console.log('⚠️  Worker Login: Response received but failed');
      console.log('   Message:', data.message);
    }
  } catch (error) {
    console.log('❌ Worker Login: ERROR -', error.message);
  }
  console.log('');
}

// Run all tests
async function runTests() {
  await testHealthCheck();
  await testCheckMobile();
  await testWorkerLogin();
  
  console.log('🏁 Tests Complete!\n');
  console.log('📝 Next Steps:');
  console.log('   1. Make sure backend is running: npm run dev');
  console.log('   2. Create a test worker if needed');
  console.log('   3. Update API config in mobile app to point to correct URL');
  console.log('   4. For Android Emulator use: http://10.0.2.2:5000/api');
  console.log('   5. For Physical Device use: http://YOUR_IP:5000/api\n');
}

runTests();
