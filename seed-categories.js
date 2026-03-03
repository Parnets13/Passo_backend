import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './src/models/Category.js';

dotenv.config();

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    // Create comprehensive categories
    const categories = await Category.insertMany([
      // Home Services
      { name: 'AC Repair', active: true, description: 'AC repair and maintenance', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'AC Technician', active: true, description: 'Professional AC technicians', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Refrigerator', active: true, description: 'Refrigerator repair services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Refrigerator Repair', active: true, description: 'Professional refrigerator repair', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Plumber', active: true, description: 'Professional plumbers', workerTypes: ['Worker', 'Contractor', 'Service Provider'] },
      { name: 'Electrician', active: true, description: 'Licensed electricians', workerTypes: ['Worker', 'Contractor', 'Service Provider'] },
      { name: 'Carpenter', active: true, description: 'Skilled carpenters', workerTypes: ['Worker', 'Contractor', 'Crew / Team'] },
      { name: 'Painter', active: true, description: 'Professional painters', workerTypes: ['Worker', 'Contractor', 'Service Provider'] },
      { name: 'Painter (Construction)', active: true, description: 'Construction painters', workerTypes: ['Worker', 'Contractor'] },
      
      // Cleaning Services
      { name: 'House Cleaning', active: true, description: 'House cleaning services', workerTypes: ['Worker', 'Crew / Team', 'Service Provider'] },
      { name: 'Cleaner (Commercial)', active: true, description: 'Commercial cleaning', workerTypes: ['Worker', 'Crew / Team', 'Service Provider'] },
      { name: 'Society Cleaner', active: true, description: 'Society cleaning services', workerTypes: ['Worker', 'Crew / Team'] },
      { name: 'Restaurant Cleaner', active: true, description: 'Restaurant cleaning', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Bathroom Cleaning', active: true, description: 'Bathroom deep cleaning', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Kitchen Deep Cleaning', active: true, description: 'Kitchen deep cleaning', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Sofa Cleaning', active: true, description: 'Sofa cleaning services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Water Tank Cleaner', active: true, description: 'Water tank cleaning', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Septic Tank Cleaning', active: true, description: 'Septic tank cleaning', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Car Cleaner', active: true, description: 'Car cleaning services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Garbage Collection', active: true, description: 'Garbage collection services', workerTypes: ['Worker', 'Crew / Team'] },
      
      // Healthcare
      { name: 'Patient Caretaker', active: true, description: 'Patient care services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Elder Care', active: true, description: 'Elder care services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Home Nurse', active: true, description: 'Home nursing services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Babysitter / Nanny', active: true, description: 'Babysitting services', workerTypes: ['Worker', 'Service Provider'] },
      
      // Construction
      { name: 'Mason (Mistri)', active: true, description: 'General masons', workerTypes: ['Worker', 'Contractor'] },
      { name: 'Mason (Raj Mistri)', active: true, description: 'Expert masons', workerTypes: ['Worker', 'Contractor'] },
      { name: 'Civil Mason', active: true, description: 'Civil construction masons', workerTypes: ['Worker', 'Contractor'] },
      { name: 'Plaster Worker', active: true, description: 'Plastering work', workerTypes: ['Worker', 'Contractor'] },
      { name: 'Tile Fitter', active: true, description: 'Tile fitting services', workerTypes: ['Worker', 'Contractor'] },
      { name: 'Tile Layer', active: true, description: 'Tile laying services', workerTypes: ['Worker', 'Contractor'] },
      { name: 'Tiles Fitter', active: true, description: 'Professional tile fitters', workerTypes: ['Worker', 'Contractor'] },
      { name: 'POP / Ceiling Worker', active: true, description: 'POP ceiling work', workerTypes: ['Worker', 'Contractor'] },
      { name: 'POP / Gypsum Worker', active: true, description: 'POP and gypsum work', workerTypes: ['Worker', 'Contractor'] },
      { name: 'Shuttering Worker', active: true, description: 'Shuttering work', workerTypes: ['Worker', 'Contractor'] },
      { name: 'Shuttering Carpenter', active: true, description: 'Shuttering carpentry', workerTypes: ['Worker', 'Contractor'] },
      { name: 'Scaffolding Worker', active: true, description: 'Scaffolding services', workerTypes: ['Worker', 'Contractor'] },
      { name: 'Waterproofing', active: true, description: 'Waterproofing services', workerTypes: ['Worker', 'Contractor', 'Service Provider'] },
      { name: 'Waterproofing Tech', active: true, description: 'Waterproofing technicians', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Welder / Fabricator', active: true, description: 'Welding and fabrication', workerTypes: ['Worker', 'Contractor'] },
      { name: 'Demolition Worker', active: true, description: 'Demolition services', workerTypes: ['Worker', 'Crew / Team'] },
      
      // Helpers & Labour
      { name: 'Helper', active: true, description: 'General helpers', workerTypes: ['Worker', 'Crew / Team'] },
      { name: 'Helper (Kitchen)', active: true, description: 'Kitchen helpers', workerTypes: ['Worker'] },
      { name: 'Helper (Mazdoor)', active: true, description: 'General labour', workerTypes: ['Worker', 'Crew / Team'] },
      { name: 'Helper / Loader', active: true, description: 'Loading helpers', workerTypes: ['Worker', 'Crew / Team'] },
      { name: 'General Labour', active: true, description: 'General labour work', workerTypes: ['Worker', 'Crew / Team'] },
      { name: 'Loading Labour', active: true, description: 'Loading and unloading', workerTypes: ['Worker', 'Crew / Team'] },
      { name: 'Event Kitchen Helper', active: true, description: 'Event kitchen help', workerTypes: ['Worker'] },
      
      // Hospitality
      { name: 'Cook', active: true, description: 'Professional cooks', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Cook (Commercial)', active: true, description: 'Commercial cooks', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Waiter / Steward', active: true, description: 'Waiting staff', workerTypes: ['Worker'] },
      { name: 'Bar Tender', active: true, description: 'Bar tending services', workerTypes: ['Worker'] },
      { name: 'Catering Staff', active: true, description: 'Catering services', workerTypes: ['Worker', 'Crew / Team'] },
      { name: 'Tandoor Master', active: true, description: 'Tandoor cooking', workerTypes: ['Worker'] },
      
      // Housekeeping
      { name: 'Full-Time Maid', active: true, description: 'Full-time maid services', workerTypes: ['Worker'] },
      { name: 'Housekeeping Staff', active: true, description: 'Housekeeping services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Dishwasher Service', active: true, description: 'Dishwashing services', workerTypes: ['Worker'] },
      { name: 'Dishwasher Boy', active: true, description: 'Dishwashing help', workerTypes: ['Worker'] },
      { name: 'Laundry Service', active: true, description: 'Laundry services', workerTypes: ['Worker', 'Service Provider'] },
      
      // Security & Facility
      { name: 'Security Guard', active: true, description: 'Security services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Watchman', active: true, description: 'Watchman services', workerTypes: ['Worker'] },
      { name: 'Lift Operator', active: true, description: 'Lift operation', workerTypes: ['Worker'] },
      
      // Technical Services
      { name: 'CCTV Installation', active: true, description: 'CCTV installation', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'TV Installation', active: true, description: 'TV installation services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Internet Technician', active: true, description: 'Internet services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Solar Panel Technician', active: true, description: 'Solar panel services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Inverter Technician', active: true, description: 'Inverter services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'RO / Water Purifier', active: true, description: 'RO services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Mobile Repair', active: true, description: 'Mobile repair services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Laptop Repair', active: true, description: 'Laptop repair services', workerTypes: ['Worker', 'Service Provider'] },
      
      // Outdoor Services
      { name: 'Gardener / Mali', active: true, description: 'Gardening services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Pest Control', active: true, description: 'Pest control services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Borewell Operator', active: true, description: 'Borewell services', workerTypes: ['Worker', 'Service Provider'] },
      
      // Transport & Delivery
      { name: 'Driver (Daily)', active: true, description: 'Daily driver services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Tempo Driver', active: true, description: 'Tempo driving', workerTypes: ['Worker'] },
      { name: 'Mini Truck Driver', active: true, description: 'Mini truck driving', workerTypes: ['Worker'] },
      { name: 'Delivery Executive', active: true, description: 'Delivery services', workerTypes: ['Worker'] },
      { name: 'Two-Wheeler Delivery', active: true, description: 'Two-wheeler delivery', workerTypes: ['Worker'] },
      { name: 'Courier Runner', active: true, description: 'Courier services', workerTypes: ['Worker'] },
      { name: 'Milk Delivery', active: true, description: 'Milk delivery services', workerTypes: ['Worker'] },
      { name: 'Newspaper Delivery', active: true, description: 'Newspaper delivery', workerTypes: ['Worker'] },
      { name: 'Packers & Movers', active: true, description: 'Packing and moving', workerTypes: ['Worker', 'Crew / Team', 'Service Provider'] },
      
      // Office & Retail
      { name: 'Office Boy', active: true, description: 'Office assistance', workerTypes: ['Worker'] },
      { name: 'Store Assistant', active: true, description: 'Store assistance', workerTypes: ['Worker'] },
      { name: 'Warehouse Packer', active: true, description: 'Warehouse packing', workerTypes: ['Worker', 'Crew / Team'] },
      { name: 'Data Entry Operator', active: true, description: 'Data entry services', workerTypes: ['Worker'] },
      
      // Miscellaneous
      { name: 'Handyman', active: true, description: 'General handyman services', workerTypes: ['Worker', 'Service Provider'] },
      { name: 'Furniture Assembly', active: true, description: 'Furniture assembly', workerTypes: ['Worker', 'Service Provider'] },
    ]);
    
    console.log(`✅ Created ${categories.length} categories`);
    console.log('\n🎉 Categories seeded successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
