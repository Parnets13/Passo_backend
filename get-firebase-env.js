import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const serviceAccountPath = join(__dirname, 'firebase-service-account.json');
  const serviceAccount = readFileSync(serviceAccountPath, 'utf8');
  
  // Minify JSON (remove whitespace)
  const minified = JSON.stringify(JSON.parse(serviceAccount));
  
  console.log('\n=== COPY THIS VALUE FOR RENDER ENVIRONMENT VARIABLE ===\n');
  console.log('Variable Name: FIREBASE_SERVICE_ACCOUNT');
  console.log('\nVariable Value (copy everything below):');
  console.log('---START---');
  console.log(minified);
  console.log('---END---');
  console.log('\n=== INSTRUCTIONS ===');
  console.log('1. Go to Render Dashboard > Your Service > Environment');
  console.log('2. Click "Add Environment Variable"');
  console.log('3. Key: FIREBASE_SERVICE_ACCOUNT');
  console.log('4. Value: Paste the minified JSON above (between START and END)');
  console.log('5. Save changes and redeploy');
  console.log('\n✅ Your firebase-service-account.json is already in .gitignore');
  console.log('✅ Your firebase.js already supports environment variables');
  
} catch (error) {
  console.error('❌ Error reading firebase-service-account.json:', error.message);
  console.log('\n💡 Make sure firebase-service-account.json exists in Passo_backend/');
}
