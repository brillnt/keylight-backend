// database/knex_migrations/20250818194543_initial_schema_baseline.cjs
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Create 'users' table
    .createTable('users', function (table) {
      table.increments('id').primary();
      table.string('full_name', 255).notNullable();
      table.string('email_address', 255).notNullable().unique();
      table.string('phone_number', 20);
      table.string('company_name', 255);
      table.timestamps(true, true);
    })
    // Create 'projects' table
    .createTable('projects', function (table) {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.text('description');
      table.string('status', 50).defaultTo('planning');
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('buyer_category', 50);
      table.string('financing_plan', 50);
      table.boolean('interested_in_preferred_lender').defaultTo(false);
      table.string('land_status', 50);
      table.text('lot_address');
      table.boolean('needs_help_finding_land').defaultTo(false);
      table.text('preferred_area_description');
      table.string('build_budget', 50);
      table.string('construction_timeline', 50);
      table.string('clickup_task_id', 255);
      table.string('clickup_list_id', 255);
      table.timestamps(true, true);
    })
    // Create 'intake_submissions' table
    .createTable('intake_submissions', function (table) {
      table.increments('id').primary();
      table.string('full_name', 255).notNullable();
      table.string('email_address', 255).notNullable();
      table.string('phone_number', 20).notNullable();
      table.string('company_name', 255);
      table.string('buyer_category', 50).notNullable();
      table.string('financing_plan', 50).notNullable();
      table.boolean('interested_in_preferred_lender').defaultTo(false);
      table.string('land_status', 50).notNullable();
      table.text('lot_address');
      table.boolean('needs_help_finding_land');
      table.text('preferred_area_description');
      table.string('build_budget', 50).notNullable();
      table.string('construction_timeline', 50).notNullable();
      table.text('project_description');
      table.string('status', 50).defaultTo('new');
      table.text('admin_notes');
      table.string('referral_source', 100).defaultTo('Ritz-Craft');
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
      table.integer('project_id').unsigned().references('id').inTable('projects').onDelete('SET NULL');
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('intake_submissions')
    .dropTableIfExists('projects')
    .dropTableIfExists('users');
};
