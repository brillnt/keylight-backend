/**
 * Database Migration Runner
 * ESM-native migration system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection } from '../src/config/database.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get list of migration files
 */
function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('📁 No migrations directory found');
    return [];
  }

  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Ensure migrations run in order
}

/**
 * Get applied migrations from database
 */
async function getAppliedMigrations() {
  try {
    const result = await query('SELECT version FROM schema_migrations ORDER BY version');
    return result.rows.map(row => row.version);
  } catch (error) {
    // If table doesn't exist, no migrations have been applied
    if (error.code === '42P01') {
      return [];
    }
    throw error;
  }
}

/**
 * Run a single migration
 */
async function runMigration(filename) {
  const migrationPath = path.join(__dirname, 'migrations', filename);
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  console.log(`📄 Running migration: ${filename}`);
  
  try {
    await query(migrationSQL);
    console.log(`✅ Migration completed: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
}

/**
 * Run all pending migrations
 */
async function runMigrations() {
  console.log('🗄️  Starting database migrations...');
  
  // Test database connection first
  const connectionTest = await testConnection();
  if (!connectionTest.success) {
    console.error('❌ Database connection failed:', connectionTest.error);
    process.exit(1);
  }
  
  console.log('✅ Database connection successful');
  
  // Get migration files and applied migrations
  const migrationFiles = getMigrationFiles();
  const appliedMigrations = await getAppliedMigrations();
  
  if (migrationFiles.length === 0) {
    console.log('📭 No migration files found');
    return;
  }
  
  // Find pending migrations
  const pendingMigrations = migrationFiles.filter(file => {
    const version = file.replace('.sql', '');
    return !appliedMigrations.includes(version);
  });
  
  if (pendingMigrations.length === 0) {
    console.log('✨ All migrations are up to date');
    return;
  }
  
  console.log(`📋 Found ${pendingMigrations.length} pending migration(s):`);
  pendingMigrations.forEach(file => console.log(`   - ${file}`));
  
  // Run pending migrations
  let successCount = 0;
  for (const filename of pendingMigrations) {
    const success = await runMigration(filename);
    if (success) {
      successCount++;
    } else {
      console.error('💥 Migration failed, stopping execution');
      process.exit(1);
    }
  }
  
  console.log(`🎉 Successfully applied ${successCount} migration(s)`);
}

/**
 * Show migration status
 */
async function showStatus() {
  console.log('📊 Migration Status:');
  
  const connectionTest = await testConnection();
  if (!connectionTest.success) {
    console.error('❌ Database connection failed:', connectionTest.error);
    return;
  }
  
  const migrationFiles = getMigrationFiles();
  const appliedMigrations = await getAppliedMigrations();
  
  console.log(`\n📁 Migration files found: ${migrationFiles.length}`);
  console.log(`✅ Applied migrations: ${appliedMigrations.length}`);
  
  if (migrationFiles.length > 0) {
    console.log('\n📋 Migration Status:');
    migrationFiles.forEach(file => {
      const version = file.replace('.sql', '');
      const status = appliedMigrations.includes(version) ? '✅ Applied' : '⏳ Pending';
      console.log(`   ${status} - ${file}`);
    });
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'status':
    showStatus()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Error:', error);
        process.exit(1);
      });
    break;
    
  case 'run':
  default:
    runMigrations()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Error:', error);
        process.exit(1);
      });
    break;
}

export { runMigrations, showStatus, getMigrationFiles, getAppliedMigrations };

