import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Worker from './src/models/Worker.js';

dotenv.config();

const checkAndCreateWorker = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const mobile = '9305241794';
    const password = 'test123';

    // Check if worker exists
    let worker = await Worker.findOne({ mobile });

    if (worker) {
      console.log('\n📋 Worker Found:');
      console.log('   Name:', worker.name);
      console.log('   Mobile:', worker.mobile);
      console.log('   Status:', worker.status);
      console.log('   Category:', worker.category);
      console.log('   Verified:', worker.verified);

      // Update worker to Approved status if not already
      if (worker.status !== 'Approved') {
        console.log('\n🔄 Updating worker status to Approved...');
        worker.status = 'Approved';
        worker.verified = true;
        worker.kycVerified = true;
        await worker.save();
        console.log('✅ Worker status updated to Approved!');
      } else {
        console.log('\n✅ Worker is already Approved!');
      }

      // Test password
      const isMatch = await worker.comparePassword(password);
      console.log('\n🔐 Password Test:');
      console.log('   Password matches:', isMatch);

      if (!isMatch) {
        console.log('\n⚠️  Password does not match! Updating password...');
        worker.password = password;
        await worker.save();
        console.log('✅ Password updated successfully!');
      }
    } else {
      console.log('\n❌ Worker not found. Creating new worker...');

      worker = await Worker.create({
        name: 'Test Worker',
        mobile: mobile,
        password: password,
        email: 'testworker@example.com',
        category: ['Plumber'],
        workerType: 'Worker',
        serviceArea: 'Delhi',
        city: 'Delhi',
        languages: ['Hindi', 'English'],
        status: 'Approved',
        verified: true,
        kycVerified: true,
        rating: 4.5,
        totalReviews: 10,
        subscription: {
          plan: 'Free',
          status: 'Active'
        }
      });

      console.log('✅ Worker created successfully!');
      console.log('   ID:', worker._id);
      console.log('   Name:', worker.name);
      console.log('   Mobile:', worker.mobile);
      console.log('   Status:', worker.status);
    }

    console.log('\n🎉 Worker is ready for login!');
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

checkAndCreateWorker();
