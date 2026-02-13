import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import Category from '../models/Category.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await Admin.deleteMany({});
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create default admin
    const admin = await Admin.create({
      name: 'Admin User',
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'super-admin',
      status: 'Active'
    });
    console.log('✅ Created default admin:', admin.email);

    // Create default categories
    const categories = await Category.insertMany([
      { name: 'Helper', active: true, description: 'General helpers and assistants', workerTypes: ['Worker', 'Crew / Team'] },
      { name: 'Painter', active: true, description: 'Professional painters', workerTypes: ['Worker', 'Contractor', 'Service Provider'] },
      { name: 'Electrician', active: true, description: 'Licensed electricians', workerTypes: ['Worker', 'Contractor', 'Service Provider'] },
      { name: 'Plumber', active: true, description: 'Professional plumbers', workerTypes: ['Worker', 'Contractor', 'Service Provider'] },
      { name: 'Carpenter', active: true, description: 'Skilled carpenters', workerTypes: ['Worker', 'Contractor', 'Crew / Team'] },
      { name: 'Cleaner', active: true, description: 'Cleaning services', workerTypes: ['Worker', 'Crew / Team', 'Service Provider'] },
      { name: 'Driver', active: true, description: 'Professional drivers', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Cook', active: true, description: 'Professional cooks', workerTypes: ['Worker', 'Service Provider'] }
    ]);
    console.log(`✅ Created ${categories.length} categories`);

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📝 Default Admin Credentials:');
    console.log('   Email: admin@admin.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  Please change the default password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
