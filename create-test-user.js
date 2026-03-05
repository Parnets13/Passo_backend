import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

async function createTestUser() {
  try {
    console.log('\n🔵 Creating Test User for App\n');
    console.log('='.repeat(50));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findById('69a96008b81462e8b4b4252f');
    
    if (existingUser) {
      console.log('\n✅ Test user already exists!');
      console.log('   User ID:', existingUser._id);
      console.log('   Name:', existingUser.name);
      console.log('   Mobile:', existingUser.mobile);
      console.log('   Unlocks:', existingUser.unlocks);
      console.log('   Total Spent:', existingUser.totalSpent);
    } else {
      // Create test user with specific ID
      const testUser = new User({
        _id: '69a96008b81462e8b4b4252f',
        name: 'Test App User',
        mobile: '9999999999',
        password: 'test123456',
        status: 'Active',
        unlocks: 0,
        totalSpent: 0,
        freeCredits: 0
      });

      await testUser.save();
      
      console.log('\n✅ Test user created successfully!');
      console.log('   User ID:', testUser._id);
      console.log('   Name:', testUser.name);
      console.log('   Mobile:', testUser.mobile);
      console.log('   Status:', testUser.status);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Test user is ready for app testing!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
