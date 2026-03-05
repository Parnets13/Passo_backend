import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Checking Firebase Admin SDK Setup...\n');

// Check 1: File exists
const filePath = join(__dirname, 'firebase-service-account.json');
console.log('📁 Checking file path:', filePath);

if (!existsSync(filePath)) {
  console.log('❌ ERROR: firebase-service-account.json NOT FOUND!\n');
  console.log('📋 Follow these steps:\n');
  console.log('1. Open: https://console.firebase.google.com/');
  console.log('2. Select project: paaso-app');
  console.log('3. Settings ⚙️ → Project settings → Service accounts');
  console.log('4. Click "Generate new private key"');
  console.log('5. Save as: firebase-service-account.json');
  console.log('6. Place in: Passo_backend folder\n');
  process.exit(1);
}

console.log('✅ File exists!\n');

// Check 2: File is valid JSON
try {
  const content = readFileSync(filePath, 'utf8');
  const serviceAccount = JSON.parse(content);
  
  console.log('✅ Valid JSON format!\n');
  
  // Check 3: Required fields
  const requiredFields = [
    'type',
    'project_id',
    'private_key_id',
    'private_key',
    'client_email',
    'client_id'
  ];
  
  console.log('🔍 Checking required fields:\n');
  let allFieldsPresent = true;
  
  for (const field of requiredFields) {
    if (serviceAccount[field] && serviceAccount[field].length > 0) {
      console.log(`  ✅ ${field}: ${field === 'private_key' ? '[PRESENT]' : serviceAccount[field]}`);
    } else {
      console.log(`  ❌ ${field}: MISSING or EMPTY`);
      allFieldsPresent = false;
    }
  }
  
  console.log('');
  
  if (!allFieldsPresent) {
    console.log('❌ ERROR: Some required fields are missing!\n');
    console.log('💡 This looks like a template file.');
    console.log('   Please download the actual service account key from Firebase Console.\n');
    process.exit(1);
  }
  
  // Check 4: Project ID matches
  if (serviceAccount.project_id !== 'paaso-app') {
    console.log(`⚠️  WARNING: Project ID mismatch!`);
    console.log(`   Expected: paaso-app`);
    console.log(`   Found: ${serviceAccount.project_id}\n`);
  } else {
    console.log('✅ Project ID matches: paaso-app\n');
  }
  
  // Check 5: Private key format
  if (serviceAccount.private_key && serviceAccount.private_key.includes('BEGIN PRIVATE KEY')) {
    console.log('✅ Private key format is valid!\n');
  } else {
    console.log('❌ ERROR: Private key format is invalid!\n');
    process.exit(1);
  }
  
  console.log('═══════════════════════════════════════');
  console.log('✅ ALL CHECKS PASSED!');
  console.log('═══════════════════════════════════════');
  console.log('\n🚀 You can now start the backend with: npm start\n');
  
} catch (error) {
  console.log('❌ ERROR: Failed to parse JSON file!\n');
  console.log('Error:', error.message);
  console.log('\n💡 The file might be corrupted or not a valid JSON file.\n');
  process.exit(1);
}
