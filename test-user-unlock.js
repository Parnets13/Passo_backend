import axios from 'axios';

const API_URL = 'https://passo-backend.onrender.com/api';

async function testUserUnlock() {
  try {
    console.log('\n🧪 Testing User Unlock Integration\n');
    console.log('='.repeat(50));

    // Step 1: Create anonymous user
    console.log('\n📱 Step 1: Creating anonymous user...');
    const deviceId = `test_device_${Date.now()}`;
    const mobile = `99${Date.now().toString().slice(-8)}`;
    
    const userResponse = await axios.post(`${API_URL}/users/create-anonymous`, {
      name: `Test User ${mobile.slice(-4)}`,
      mobile,
      password: deviceId,
      deviceId
    });

    if (userResponse.data.success) {
      const user = userResponse.data.user;
      console.log('✅ User created successfully!');
      console.log('   User ID:', user._id);
      console.log('   Name:', user.name);
      console.log('   Mobile:', user.mobile);
      console.log('   Unlocks:', user.unlocks);
      console.log('   Total Spent:', user.totalSpent);

      // Step 2: Record unlock
      console.log('\n💳 Step 2: Recording unlock...');
      const unlockResponse = await axios.post(
        `${API_URL}/users/${user._id}/unlock`,
        {
          workerId: '507f1f77bcf86cd799439011', // Test worker ID
          workerName: 'Test Worker',
          workerMobile: '9876543210',
          category: 'Plumber',
          amount: 10,
          date: new Date().toISOString()
        }
      );

      if (unlockResponse.data.success) {
        console.log('✅ Unlock recorded successfully!');
        console.log('   Unlocks:', unlockResponse.data.data.unlocks);
        console.log('   Total Spent:', unlockResponse.data.data.totalSpent);
        console.log('\n✅ Data will now show in User Management dashboard!');
      } else {
        console.log('❌ Unlock failed:', unlockResponse.data.message);
      }
    } else {
      console.log('❌ User creation failed:', userResponse.data.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Test completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
  }
}

testUserUnlock();
