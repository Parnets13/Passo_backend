import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Worker from './src/models/Worker.js';

dotenv.config();

const createIncompleteWorker = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const mobile = '9305241794';
    const password = 'test123';

    // Delete existing worker if any
    await Worker.deleteOne({ mobile });
    console.log('🗑️  Deleted existing worker (if any)');

    // Create worker with INCOMPLETE profile for testing onboarding flow
    const worker = await Worker.create({
      name: 'Test Worker',
      mobile: mobile,
      password: password,
      email: 'testworker@example.com',
      
      // INCOMPLETE FIELDS - to trigger onboarding flow
      category: ['Plumber'], // Has category
      workerType: 'Worker', // Has worker type
      city: 'Delhi',
      serviceArea: 'Delhi',
      languages: ['Hindi', 'English'],
      
      // Status is Approved but verification is PENDING
      status: 'Approved', // Can login
      verified: false, // ❌ NOT VERIFIED - will trigger verification screen
      kycVerified: false, // ❌ KYC NOT VERIFIED
      
      rating: 0,
      totalReviews: 0,
      subscription: {
        plan: 'Free',
        status: 'Active'
      }
    });

    console.log('\n✅ Incomplete Worker Created for Testing!');
    console.log('   ID:', worker._id);
    console.log('   Name:', worker.name);
    console.log('   Mobile:', worker.mobile);
    console.log('   Status:', worker.status);
    console.log('   Verified:', worker.verified, '❌');
    console.log('   KYC Verified:', worker.kycVerified, '❌');
    console.log('   Worker Type:', worker.workerType);
    console.log('   Category:', worker.category);

    console.log('\n📋 Onboarding Flow:');
    console.log('   1. Login ✅');
    console.log('   2. Verification Screen ⏳ (verified: false)');
    console.log('   3. Worker Type Selection ⏳ (if needed)');
    console.log('   4. Profile Details ⏳ (if needed)');
    console.log('   5. Dashboard ✅');

    console.log('\n🎉 Worker is ready for testing onboarding flow!');
    console.log('\n📱 Login Credentials:');
    console.log('   Mobile:', mobile);
    console.log('   Password:', password);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createIncompleteWorker();
