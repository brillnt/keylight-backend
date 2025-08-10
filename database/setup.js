const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
  try {
    console.log('🗄️  Setting up database...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schema);
    console.log('✅ Database schema created successfully');
    
    // Test the setup with a simple query
    const result = await pool.query('SELECT COUNT(*) FROM intake_submissions');
    console.log(`✅ Database test successful - submissions table has ${result.rows[0].count} records`);
    
    // Insert sample data for testing (optional)
    const sampleData = `
      INSERT INTO intake_submissions (
        full_name, email_address, phone_number, company_name,
        buyer_category, financing_plan, interested_in_preferred_lender,
        land_status, lot_address, needs_help_finding_land, preferred_area_description,
        build_budget, construction_timeline, project_description
      ) VALUES (
        'John Smith', 'john.smith@example.com', '555-123-4567', 'Smith Development',
        'developer', 'finance_build', true,
        'need_land', null, true, 'Looking for lots in downtown Detroit area',
        '350k_400k', '6_to_12_months', 'Planning a modern modular home development with 3-4 units'
      ) ON CONFLICT DO NOTHING;
    `;
    
    await pool.query(sampleData);
    console.log('✅ Sample data inserted');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('🎉 Database setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };

