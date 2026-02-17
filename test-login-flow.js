/**
 * Test Login Flow - Verify check-mobile endpoint works without session errors
 */

import axios from 'axios';

const API_BASE_URL = 'https://passo-backend.onrender.com/api';

async function testCheckMobile(mobile) {
  try {
    console.log('\n🔍 Testing check-mobile endpoint...');
    console.log('📱 Mobile:', mobile);
    console.log('🌐 URL:', `${API_BASE_URL}/workers/check-mobile`);
    
    const response = await axios.post(
      `${API_BASE_URL}/workers/check-mobile`,
      { mobile },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('\n✅ SUCCESS - Check Mobile Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.exists && response.data.worker) {
      console.log('\n👤 Worker Found:');
      console.log('   Name:', response.data.worker.name);
      console.log('   Status:', response.data.worker.status);
      console.log('   Verified:', response.data.worker.verified);
    } else {
      console.log('\n🆕 New User - Not registered yet');
    }
    
    return response.data;
  } catch (error) {
    console.error('\n❌ ERROR - Check Mobile Failed:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    throw error;
  }
}

async function runTests() {
  console.log('🚀 Starting Login Flow Tests...');
  console.log('=' .repeat(50));
  
  // Test 1: Check existing user
  try {
    await testCheckMobile('9305241794');
  } catch (error) {
    console.error('Test 1 Failed');
  }
  
  // Test 2: Check new user
  try {
    await testCheckMobile('9999999999');
  } catch (error) {
    console.error('Test 2 Failed');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Tests Complete!');
}

runTests();
