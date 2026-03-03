import axios from 'axios';

const BASE_URL = 'https://passo-backend.onrender.com/api';

const testCategories = async () => {
  try {
    console.log('🔍 Testing categories endpoint...\n');
    console.log(`📡 URL: ${BASE_URL}/categories\n`);

    const response = await axios.get(`${BASE_URL}/categories`);
    
    console.log('✅ Categories fetched successfully!');
    console.log(`📊 Total categories: ${response.data.data.length}\n`);
    
    if (response.data.data.length > 0) {
      console.log('📋 First 10 categories:');
      response.data.data.slice(0, 10).forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.name} (${cat.workerTypes.join(', ')})`);
      });
    } else {
      console.log('⚠️  No categories found in database!');
      console.log('   Run: node seed-categories.js to seed categories');
    }
    
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing categories:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
};

testCategories();
