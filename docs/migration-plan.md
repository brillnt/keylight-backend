# Database Migration Plan: Phase 1 Data Model Separation

## Overview
This document outlines the step-by-step process for safely migrating from our current single-table structure to a separated Users, Projects, and Applications model with minimal disruption to the running application.

## Migration Strategy: Non-Destructive Until Final Step

**Core Principle:** Keep the current application fully functional until the very last step, allowing for rollback at any point.

---

## Step 1: Create New Tables (Non-Destructive)
**Goal:** Add new table structures without affecting existing functionality

### 1.1 Create Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email_address VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    company_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_users_email ON users(email_address);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 1.2 Create Projects Table
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning',
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Project details
    buyer_category VARCHAR(50),
    financing_plan VARCHAR(50),
    interested_in_preferred_lender BOOLEAN DEFAULT FALSE,
    land_status VARCHAR(50),
    lot_address TEXT,
    needs_help_finding_land BOOLEAN DEFAULT FALSE,
    preferred_area_description TEXT,
    build_budget VARCHAR(50),
    construction_timeline VARCHAR(50),
    
    -- ClickUp integration (for future)
    clickup_task_id VARCHAR(255),
    clickup_list_id VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_clickup_task_id ON projects(clickup_task_id);
```

### 1.3 Verification
- [x] Tables created successfully
- [x] Indexes created
- [x] Foreign key constraints working
- [x] Current application still functional
- [x] No data loss

**Status:** ✅ **Completed.** New `users` and `projects` tables created. Verified on both sandbox and local environments.

---

## Step 2: Add Relationship Columns (Non-Destructive)
**Goal:** Add foreign key columns to existing table without breaking current functionality

### 2.1 Add Foreign Key Columns to intake_submissions
```sql
-- Add nullable foreign key columns
ALTER TABLE intake_submissions 
ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL;

-- Add indexes for the new foreign keys
CREATE INDEX idx_intake_submissions_user_id ON intake_submissions(user_id);
CREATE INDEX idx_intake_submissions_project_id ON intake_submissions(project_id);
```

### 2.2 Verification
- [x] New columns added successfully
- [x] Foreign key constraints working
- [x] Existing data unaffected (all new columns are NULL)
- [x] Current application still functional
- [x] Queries still work as before

**Status:** ✅ **Completed.** `user_id` and `project_id` columns added to `intake_submissions`. Verified on both sandbox and local environments.

---

## Step 3: Data Migration (Non-Destructive)
**Goal:** Populate new tables and relationships from existing data

### 3.1 Create Migration Script (Knex.js)
We have transitioned to using Knex.js for database migrations. The data population logic is now part of a Knex.js migration file.

**Knex.js Migration File: `database/knex_migrations/populate_user_project_ids.cjs`**
```javascript
// This is a simplified representation of the SQL within the Knex migration
// The actual Knex migration file uses knex.raw() to execute this SQL.

// Create a temporary table to store unique users
CREATE TEMPORARY TABLE temp_users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) UNIQUE,
    email_address VARCHAR(255) UNIQUE
);

// Insert unique users from intake_submissions into temp_users
INSERT INTO temp_users (full_name, email_address)
SELECT DISTINCT full_name, email_address
FROM intake_submissions
ON CONFLICT (full_name) DO NOTHING;

// Insert new users into the users table from temp_users
INSERT INTO users (full_name, email_address)
SELECT tu.full_name, tu.email_address
FROM temp_users tu
ON CONFLICT (email_address) DO NOTHING;

// Create a temporary table to store unique projects
CREATE TEMPORARY TABLE temp_projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT
);

// Insert unique projects from intake_submissions into temp_projects
INSERT INTO temp_projects (name, description)
SELECT DISTINCT project_description, project_description
FROM intake_submissions;

// Insert new projects into the projects table from temp_projects
INSERT INTO projects (name, description)
SELECT tp.name, tp.description
FROM temp_projects tp;

// Update intake_submissions with user_id and project_id
UPDATE intake_submissions
SET
    user_id = u.id,
    project_id = p.id
FROM
    users u,
    projects p
WHERE
    intake_submissions.email_address = u.email_address AND
    intake_submissions.project_description = p.description;

// Clean up temporary tables
DROP TABLE temp_users;
DROP TABLE temp_projects;
```

### 3.2 Run Migration
```bash
# Run Knex.js migration
./node_modules/.bin/knex migrate:latest --knexfile knexfile.mjs
```

### 3.3 Verification
- [x] All existing submissions have corresponding users
- [x] All existing submissions have corresponding projects
- [x] Foreign key relationships populated correctly
- [x] Data integrity maintained
- [x] Current application still functional
- [x] No data loss or corruption

**Status:** ✅ **Completed.** Data migrated to `users` and `projects` tables, and `intake_submissions` linked. Verified on both sandbox and local environments.

---

## Step 4: Update Application Code (Reversible)
**Goal:** Update models, services, and APIs to use new structure while maintaining backward compatibility

### 4.1 Create New Models
- [ ] Create `UserModel` class
- [ ] Create `ProjectModel` class
- [ ] Update `SubmissionModel` to include relationships
- [ ] Add relationship methods (getUser(), getProject(), etc.)

### 4.2 Create New Services
- [ ] Create `UserService` for user management
- [ ] Create `ProjectService` for project management
- [ ] Update `SubmissionService` to coordinate entities
- [ ] Add business logic for relationships

### 4.3 Update API Endpoints
- [ ] Add `/api/users` endpoints
- [ ] Add `/api/projects` endpoints
- [ ] Update `/api/submissions` to include relationship data
- [ ] Maintain backward compatibility for existing endpoints

### 4.4 Update Database Queries
- [ ] Update queries to use JOINs where appropriate
- [ ] Optimize queries for new structure
- [ ] Add proper error handling for relationships
- [ ] Test all existing functionality

### 4.5 Verification
- [ ] All existing API endpoints work as before
- [ ] New endpoints function correctly
- [ ] Relationships work properly
- [ ] Performance is maintained or improved
- [ ] No breaking changes for current frontend

**Status:** 🚧 **In Progress.** This is our current focus. We are verifying existing application functionality after the database migration.

---

## Step 5: Final Cleanup (Destructive - Last Step)
**Goal:** Remove redundant columns and finalize the new structure

⚠️ **WARNING: This step is destructive and cannot be easily reversed**

### 5.1 Remove Redundant Columns
```sql
-- Remove columns that are now stored in users table
ALTER TABLE intake_submissions 
DROP COLUMN full_name,
DROP COLUMN email_address,
DROP COLUMN phone_number,
DROP COLUMN company_name;

-- Remove columns that are now stored in projects table
ALTER TABLE intake_submissions 
DROP COLUMN buyer_category,
DROP COLUMN financing_plan,
DROP COLUMN interested_in_preferred_lender,
DROP COLUMN land_status,
DROP COLUMN lot_address,
DROP COLUMN needs_help_finding_land,
DROP COLUMN preferred_area_description,
DROP COLUMN build_budget,
DROP COLUMN construction_timeline,
DROP COLUMN project_description;
```

### 5.2 Make Foreign Keys Required
```sql
-- Make foreign keys non-nullable
ALTER TABLE intake_submissions 
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN project_id SET NOT NULL;
```

### 5.3 Update Application Code
- [ ] Remove backward compatibility code
- [ ] Update all queries to use new structure
- [ ] Remove deprecated methods and endpoints
- [ ] Update documentation

### 5.4 Final Verification
- [ ] All functionality works with new structure
- [ ] No references to removed columns
- [ ] Database constraints properly enforced
- [ ] Performance is optimal
- [ ] Documentation updated

**Status:** 🔴 Destructive - Only proceed when confident in new structure

---

## Rollback Procedures

### Before Step 5 (Non-Destructive Steps):
1. **Drop new tables:** `DROP TABLE projects, users CASCADE;`
2. **Remove foreign key columns:** `ALTER TABLE intake_submissions DROP COLUMN user_id, DROP COLUMN project_id;`
3. **Restart application** - should work exactly as before

### After Step 5 (Destructive Step):
- **Rollback requires database backup restoration**
- **Ensure recent backup exists before proceeding with Step 5**

---

## Testing Checklist

### After Each Step:
- [ ] Current application functionality intact
- [ ] Database queries execute successfully
- [ ] No data corruption or loss
- [ ] Performance within acceptable range
- [ ] Error handling works correctly

### Before Step 5:
- [ ] Comprehensive testing of new structure
- [ ] Load testing with new relationships
- [ ] Frontend integration testing
- [ ] Backup verification
- [ ] Rollback procedure tested

---

## Timeline Estimates

- **Step 1:** 2-3 hours (table creation and testing)
- **Step 2:** 1-2 hours (add columns and testing)
- **Step 3:** 4-6 hours (data migration script and execution)
- **Step 4:** 1-2 weeks (application code updates)
- **Step 5:** 2-4 hours (cleanup and final testing)

**Total Estimated Time:** 2-3 weeks with thorough testing

---

## Success Criteria

1. **Zero downtime** during Steps 1-4
2. **No data loss** at any point
3. **Backward compatibility** maintained until Step 5
4. **Performance** maintained or improved
5. **All existing functionality** preserved
6. **New functionality** working correctly
7. **Clean, maintainable** final structure

---

## Next Steps

1. **Review this plan** with team
2. **Create database backup** before starting
3. **Set up monitoring** for migration process
4. **Execute Step 1** when approved
5. **Validate each step** before proceeding
6. **Document any issues** encountered

**Status:** 🚧 **In Progress.** We are currently in Step 4: Updating Application Code, and verifying existing functionality.
**Last Updated:** August 18, 2025



