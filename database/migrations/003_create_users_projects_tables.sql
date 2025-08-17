-- Migration: Create Users and Projects Tables
-- Step 1 of Phase 1 Data Model Separation
-- Non-destructive: Creates new tables without affecting existing intake_submissions

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email_address VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    company_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
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
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email_address);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_clickup_task_id ON projects(clickup_task_id);

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts - separated from submissions for better data modeling';
COMMENT ON TABLE projects IS 'Project records - one-to-many relationship with users';
COMMENT ON COLUMN projects.status IS 'Project status: planning, active, completed, cancelled';
COMMENT ON COLUMN projects.clickup_task_id IS 'ClickUp integration - task ID for project tracking';

