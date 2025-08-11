-- Migration: 002_add_indexes_optimization
-- Description: Add additional indexes for query performance optimization
-- Created: 2025-08-11

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_intake_submissions_status_created 
ON intake_submissions(status, created_at);

CREATE INDEX IF NOT EXISTS idx_intake_submissions_buyer_budget 
ON intake_submissions(buyer_category, build_budget);

CREATE INDEX IF NOT EXISTS idx_intake_submissions_timeline_status 
ON intake_submissions(construction_timeline, status);

-- Add index for admin dashboard filtering
CREATE INDEX IF NOT EXISTS idx_intake_submissions_referral_source 
ON intake_submissions(referral_source);

-- Add partial index for active submissions (performance optimization)
CREATE INDEX IF NOT EXISTS idx_intake_submissions_active 
ON intake_submissions(created_at) 
WHERE status IN ('new', 'reviewed', 'qualified');

-- Record this migration
INSERT INTO schema_migrations (version) VALUES ('002_add_indexes_optimization') ON CONFLICT DO NOTHING;

