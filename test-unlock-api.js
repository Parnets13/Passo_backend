import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test data - Replace with actual IDs from your database
const TEST_USER_ID = '65f1234567890abcdef12345'; // Replace with actual user ID
const TEST_WORKER_ID = '65f9876543210fedcba98765'; // Replace with actual worker ID

const testUnlockAPI = async () => {
  console.log('🧪 Testing Unlock Contact API\n');

  try {
    // Test 1: Unlock Contact
    console.log('1️⃣ Testing: POST /api/unlocks/unlock');
    try {
      const unlockResponse = await axios.post(`${BASE_URL}/unlocks/unlock`, {
        userId: TEST_USER_ID,
        workerId: TEST_WORKER_ID,
        amount: 10
      });
      console.log('✅ Unlock Success:', unlockResponse.data);
    } catch (error) {
      console.log('❌ Unlock Error:', error.response?.data || error.message);
    }

    console.log('\n---\n');

    // Test 2: Check Unlock Status
    console.log('2️⃣ Testing: GET /api/unlocks/check/:userId/:workerId');
    try {
      const checkResponse = await axios.get(
        `${BASE_URL}/unlocks/check/${TEST_USER_ID}/${TEST_WORKER_ID}`
      );
      console.log('✅ Check Status Success:', checkResponse.data);
    } catch (error) {
      console.log('❌ Check Status Error:', error.response?.data || error.message);
    }

    console.log('\n---\n');

    // Test 3: Get User Unlock History
    console.log('3️⃣ Testing: GET /api/unlocks/user/:userId');
    try {
      const historyResponse = await axios.get(`${BASE_URL}/unlocks/user/${TEST_USER_ID}`);
      console.log('✅ Unlock History Success:');
      console.log('   Total Unlocks:', historyResponse.data.data.unlocks);
      console.log('   Total Spent: ₹', historyResponse.data.data.totalSpent);
      console.log('   History Count:', historyResponse.data.data.history.length);
    } catch (error) {
      console.log('❌ Unlock History Error:', error.response?.data || error.message);
    }

    console.log('\n---\n');

    // Test 4: Get All Users (Admin)
    console.log('4️⃣ Testing: GET /api/admin/users');
    try {
      const usersResponse = await axios.get(`${BASE_URL}/admin/users?limit=5`);
      console.log('✅ Admin Users Success:');
      console.log('   Total Users:', usersResponse.data.pagination.total);
      console.log('   Users Fetched:', usersResponse.data.data.length);
      if (usersResponse.data.data.length > 0) {
        const firstUser = usersResponse.data.data[0];
        console.log('   First User:', firstUser.name);
        console.log('   Unlocks:', firstUser.unlocks || 0);
        console.log('   Total Spent: ₹', firstUser.totalSpent || 0);
      }
    } catch (error) {
      console.log('❌ Admin Users Error:', error.response?.data || error.message);
    }

    console.log('\n---\n');

    // Test 5: Get User Details (Admin)
    console.log('5️⃣ Testing: GET /api/admin/users/:id');
    try {
      const userDetailResponse = await axios.get(`${BASE_URL}/admin/users/${TEST_USER_ID}`);
      console.log('✅ Admin User Detail Success:');
      console.log('   User:', userDetailResponse.data.data.name);
      console.log('   Mobile:', userDetailResponse.data.data.mobile);
      console.log('   Unlocks:', userDetailResponse.data.data.unlocks);
      console.log('   Total Spent: ₹', userDetailResponse.data.data.totalSpent);
      console.log('   Unlock History:', userDetailResponse.data.data.unlockHistory.length);
    } catch (error) {
      console.log('❌ Admin User Detail Error:', error.response?.data || error.message);
    }

    console.log('\n---\n');

    // Test 6: Get User Stats (Admin)
    console.log('6️⃣ Testing: GET /api/admin/users/stats/summary');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/admin/users/stats/summary`);
      console.log('✅ Admin User Stats Success:');
      console.log('   Total Users:', statsResponse.data.data.totalUsers);
      console.log('   Active Users:', statsResponse.data.data.activeUsers);
      console.log('   Total Unlocks:', statsResponse.data.data.totalUnlocks);
      console.log('   Total Revenue: ₹', statsResponse.data.data.totalRevenue);
    } catch (error) {
      console.log('❌ Admin User Stats Error:', error.response?.data || error.message);
    }

    console.log('\n✅ All API tests completed!\n');
    console.log('📝 Note: Replace TEST_USER_ID and TEST_WORKER_ID with actual IDs from your database');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run tests
testUnlockAPI();
