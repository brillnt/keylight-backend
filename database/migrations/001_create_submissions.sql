-- Migration: 001_create_submissions
-- Description: Create intake_submissions table with all required fields
-- Created: 2025-08-11

-- Create intake submissions table
CREATE TABLE IF NOT EXISTS intake_submissions (
    id SERIAL PRIMARY KEY,
    
    -- Contact Details
    full_name VARCHAR(255) NOT NULL,
    email_address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    company_name VARCHAR(255), -- optional
    
    -- Buyer Category (single select)
    buyer_category VARCHAR(50) NOT NULL CHECK (buyer_category IN ('homebuyer', 'developer')),
    
    -- Financing Plans (single select)
    financing_plan VARCHAR(50) NOT NULL CHECK (financing_plan IN ('self_funding', 'finance_build')),
    interested_in_preferred_lender BOOLEAN DEFAULT FALSE, -- only relevant if financing_plan = 'finance_build'
    
    -- Land Status (single select)
    land_status VARCHAR(50) NOT NULL CHECK (land_status IN ('own_land', 'need_land')),
    lot_address TEXT, -- only relevant if land_status = 'own_land'
    
    -- Land Help (only relevant if land_status = 'need_land')
    needs_help_finding_land BOOLEAN, -- only relevant if land_status = 'need_land'
    preferred_area_description TEXT, -- only relevant if needs_help_finding_land = TRUE
    
    -- Build Budget (single select)
    build_budget VARCHAR(50) NOT NULL CHECK (build_budget IN (
        '200k_250k',
        '250k_350k', 
        '350k_400k',
        '400k_500k',
        '500k_plus'
    )),
    
    -- Timeline (single select)
    construction_timeline VARCHAR(50) NOT NULL CHECK (construction_timeline IN (
        'less_than_3_months',
        '3_to_6_months',
        '6_to_12_months',
        'more_than_12_months'
    )),
    
    -- Project Description (freeform)
    project_description TEXT,
    
    -- System fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Admin fields for workflow management
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'qualified', 'disqualified', 'contacted')),
    admin_notes TEXT,
    referral_source VARCHAR(100) DEFAULT 'Ritz-Craft' -- as mentioned in the PDF
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_intake_submissions_email ON intake_submissions(email_address);
CREATE INDEX IF NOT EXISTS idx_intake_submissions_created_at ON intake_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_intake_submissions_status ON intake_submissions(status);
CREATE INDEX IF NOT EXISTS idx_intake_submissions_buyer_category ON intake_submissions(buyer_category);
CREATE INDEX IF NOT EXISTS idx_intake_submissions_land_status ON intake_submissions(land_status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_intake_submissions_updated_at ON intake_submissions;
CREATE TRIGGER update_intake_submissions_updated_at 
    BEFORE UPDATE ON intake_submissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create migrations tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Record this migration
INSERT INTO schema_migrations (version) VALUES ('001_create_submissions') ON CONFLICT DO NOTHING;

