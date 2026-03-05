import axios from 'axios';

// Use production URL
const API_URL = 'https://passo-backend.onrender.com/api';

async function testUnlockFlow() {
  try {
    console.log('\n🧪 Testing Complete Unlock Flow\n');
    console.log('='.repeat(60));
    console.log('API URL:', API_URL);
    console.log('='.repeat(60));

    // Test 1: Check if backend is accessible
    console.log('\n📡 Test 1: Checking backend health...');
    try {
      const healthResponse = await axios.get(`${API_URL.replace('/api', '')}/health`, {
        timeout: 10000
      });
      console.log('✅ Backend is accessible:', healthResponse.data.message);
    } catch (error) {
      console.log('⚠️ Health check failed:', error.message);
    }

    // Test 2: Try to create anonymous user
    console.log('\n📱 Test 2: Creating anonymous user...');
    const deviceId = `test_device_${Date.now()}`;
    const mobile = `99${Date.now().toString().slice(-8)}`;
    
    try {
      const userResponse = await axios.post(
        `${API_URL}/users/create-anonymous`,
        {
          name: `Test User ${mobile.slice(-4)}`,
          mobile,
          password: deviceId,
          deviceId
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      if (userResponse.data.success) {
        const user = userResponse.data.user;
        console.log('✅ User created successfully!');
        console.log('   User ID:', user._id);
        console.log('   Name:', user.name);
        console.log('   Mobile:', user.mobile);

        // Test 3: Record unlock with the new user
        console.log('\n💳 Test 3: Recording unlock...');
        const unlockResponse = await axios.post(
          `${API_URL}/users/${user._id}/unlock`,
          {
            workerId: '69a9175a851fccf83c1bf5d3',
            workerName: 'Test Worker',
            workerMobile: '9876543210',
            category: 'Plumber',
            amount: 10,
            date: new Date().toISOString()
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );

        if (unlockResponse.data.success) {
          console.log('✅ Unlock recorded successfully!');
          console.log('   Unlocks:', unlockResponse.data.data.unlocks);
          console.log('   Total Spent:', unlockResponse.data.data.totalSpent);
          console.log('\n🎉 SUCCESS! Data will show in User Management!');
        } else {
          console.log('❌ Unlock failed:', unlockResponse.data.message);
        }
      }
    } catch (createError) {
      console.log('⚠️ User creation failed:', createError.response?.data?.message || createError.message);
      console.log('\n📝 Trying with fallback user ID...');

      // Test 4: Try with fallback user
      const fallbackUserId = '69a96008b81462e8b4b4252f';
      console.log('\n💳 Test 4: Recording unlock with fallback user...');
      
      try {
        const unlockResponse = await axios.post(
          `${API_URL}/users/${fallbackUserId}/unlock`,
          {
            workerId: '69a9175a851fccf83c1bf5d3',
            workerName: 'Test Worker',
            workerMobile: '9876543210',
            category: 'Plumber',
            amount: 10,
            date: new Date().toISOString()
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );

        if (unlockResponse.data.success) {
          console.log('✅ Unlock recorded with fallback user!');
          console.log('   Unlocks:', unlockResponse.data.data.unlocks);
          console.log('   Total Spent:', unlockResponse.data.data.totalSpent);
          console.log('\n🎉 SUCCESS! Data will show in User Management!');
        } else {
          console.log('❌ Unlock failed:', unlockResponse.data.message);
        }
      } catch (unlockError) {
        console.log('❌ Unlock with fallback user failed:', unlockError.response?.data?.message || unlockError.message);
        
        if (unlockError.response?.status === 404) {
          console.log('\n⚠️ Fallback user does not exist in database!');
          console.log('   Run: node create-test-user.js');
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Test completed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testUnlockFlow();
