import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Worker from './src/models/Worker.js';

dotenv.config();

const testUnlockIntegration = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find a test user
    let user = await User.findOne();
    if (!user) {
      console.log('📝 Creating test user...');
      user = await User.create({
        name: 'Test User',
        mobile: '9999999999',
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('✅ Test user created:', user._id);
    } else {
      console.log('✅ Using existing user:', user._id);
    }

    // Find a test worker
    const worker = await Worker.findOne();
    if (!worker) {
      console.log('❌ No workers found. Please create a worker first.');
      process.exit(1);
    }
    console.log('✅ Using worker:', worker._id, '-', worker.name);

    console.log('\n📊 Before Unlock:');
    console.log('User unlocks:', user.unlocks || 0);
    console.log('User total spent:', user.totalSpent || 0);
    console.log('Unlock history length:', user.unlockHistory?.length || 0);

    // Simulate unlock
    console.log('\n🔓 Simulating unlock...');
    const unlockAmount = 10;

    user.unlockHistory.push({
      workerId: worker._id,
      workerName: worker.name,
      workerMobile: worker.mobile || worker.phone,
      category: Array.isArray(worker.category) ? worker.category.join(', ') : worker.category,
      amount: unlockAmount,
      date: new Date()
    });

    user.unlocks = (user.unlocks || 0) + 1;
    user.totalSpent = (user.totalSpent || 0) + unlockAmount;

    await user.save();

    console.log('\n📊 After Unlock:');
    console.log('User unlocks:', user.unlocks);
    console.log('User total spent:', user.totalSpent);
    console.log('Unlock history length:', user.unlockHistory.length);

    // Display unlock history
    console.log('\n📜 Unlock History:');
    user.unlockHistory.forEach((unlock, index) => {
      console.log(`\n${index + 1}. Worker: ${unlock.workerName}`);
      console.log(`   Mobile: ${unlock.workerMobile}`);
      console.log(`   Category: ${unlock.category}`);
      console.log(`   Amount: ₹${unlock.amount}`);
      console.log(`   Date: ${unlock.date.toLocaleString()}`);
    });

    // Test admin endpoint data
    console.log('\n📊 Admin Panel Data:');
    const userForAdmin = await User.findById(user._id)
      .select('-password')
      .populate('unlockHistory.workerId', 'name mobile category');
    
    console.log('User ID:', userForAdmin._id);
    console.log('Name:', userForAdmin.name);
    console.log('Mobile:', userForAdmin.mobile);
    console.log('Total Unlocks:', userForAdmin.unlocks);
    console.log('Total Spent:', '₹' + userForAdmin.totalSpent);
    console.log('Status:', userForAdmin.status);
    console.log('Unlock History Count:', userForAdmin.unlockHistory.length);

    console.log('\n✅ Unlock integration test completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start backend: cd Passo_backend && npm start');
    console.log('2. Test unlock endpoint: POST /api/unlocks/unlock');
    console.log('3. View in admin: GET /api/admin/users');
    console.log('4. View user details: GET /api/admin/users/' + user._id);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

testUnlockIntegration();
