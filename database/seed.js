/**
 * Database Seed Runner
 * ESM-native seed data system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection } from '../src/config/database.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run seed data
 */
async function runSeeds() {
  console.log('🌱 Starting database seeding...');
  
  // Test database connection first
  const connectionTest = await testConnection();
  if (!connectionTest.success) {
    console.error('❌ Database connection failed:', connectionTest.error);
    process.exit(1);
  }
  
  console.log('✅ Database connection successful');
  
  // Check if submissions table exists
  try {
    await query('SELECT 1 FROM intake_submissions LIMIT 1');
  } catch (error) {
    if (error.code === '42P01') {
      console.error('❌ Table intake_submissions does not exist. Run migrations first.');
      console.log('💡 Try: npm run migrate');
      process.exit(1);
    }
    throw error;
  }
  
  // Read and execute seed file
  const seedPath = path.join(__dirname, 'seeds', 'sample_data.sql');
  
  if (!fs.existsSync(seedPath)) {
    console.log('📭 No seed file found at:', seedPath);
    return;
  }
  
  const seedSQL = fs.readFileSync(seedPath, 'utf8');
  
  try {
    console.log('📄 Running seed data...');
    await query(seedSQL);
    
    // Check how many records were inserted
    const result = await query('SELECT COUNT(*) as count FROM intake_submissions');
    const totalRecords = result.rows[0].count;
    
    console.log(`✅ Seed data completed successfully`);
    console.log(`📊 Total submissions in database: ${totalRecords}`);
    
  } catch (error) {
    console.error('❌ Seed data failed:', error.message);
    process.exit(1);
  }
}

/**
 * Clear all data (for testing)
 */
async function clearData() {
  console.log('🗑️  Clearing all data...');
  
  const connectionTest = await testConnection();
  if (!connectionTest.success) {
    console.error('❌ Database connection failed:', connectionTest.error);
    process.exit(1);
  }
  
  try {
    await query('DELETE FROM intake_submissions');
    console.log('✅ All submission data cleared');
  } catch (error) {
    console.error('❌ Failed to clear data:', error.message);
    process.exit(1);
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'clear':
    clearData()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Error:', error);
        process.exit(1);
      });
    break;
    
  case 'run':
  default:
    runSeeds()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Error:', error);
        process.exit(1);
      });
    break;
}

export { runSeeds, clearData };

