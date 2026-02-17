/**
 * Create Test Worker Script
 * Run: node create-test-worker.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Worker Schema (simplified)
const workerSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: { type: String, unique: true },
  password: String,
  category: String,
  serviceArea: String,
  city: String,
  status: { type: String, default: 'Approved' },
  verified: { type: Boolean, default: true },
  kycVerified: { type: Boolean, default: true },
  workerType: String,
  languages: [String],
  teamSize: Number,
});

// Hash password before saving
workerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Worker = mongoose.model('Worker', workerSchema);

async function createTestWorker() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if worker already exists
    const existingWorker = await Worker.findOne({ mobile: '9876543210' });
    
    if (existingWorker) {
      console.log('⚠️  Worker already exists!');
      console.log('📱 Mobile:', existingWorker.mobile);
      console.log('👤 Name:', existingWorker.name);
      console.log('📧 Email:', existingWorker.email);
      console.log('✅ Status:', existingWorker.status);
      
      // Update to Approved if not already
      if (existingWorker.status !== 'Approved') {
        existingWorker.status = 'Approved';
        existingWorker.verified = true;
        existingWorker.kycVerified = true;
        await existingWorker.save();
        console.log('✅ Worker updated to Approved status');
      }
      
      process.exit(0);
    }

    // Create new test worker
    console.log('\n📝 Creating test worker...');
    
    const testWorker = new Worker({
      name: 'Test Worker',
      email: 'test@example.com',
      mobile: '9876543210',
      password: 'test123', // Will be hashed automatically
      category: 'Plumber',
      serviceArea: 'Mumbai, Pune',
      city: 'Mumbai',
      status: 'Approved',
      verified: true,
      kycVerified: true,
      workerType: 'individual',
      languages: ['English', 'Hindi'],
      teamSize: 1,
    });

    await testWorker.save();

    console.log('\n✅ Test worker created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 Mobile: 9876543210');
    console.log('🔑 Password: test123');
    console.log('✅ Status: Approved');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 You can now login with these credentials!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestWorker();
