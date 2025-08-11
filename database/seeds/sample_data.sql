-- Sample Data for Development
-- This file contains sample intake submissions for testing

-- Sample submission 1: Developer with financing needs
INSERT INTO intake_submissions (
    full_name, email_address, phone_number, company_name,
    buyer_category, financing_plan, interested_in_preferred_lender,
    land_status, lot_address, needs_help_finding_land, preferred_area_description,
    build_budget, construction_timeline, project_description,
    status, admin_notes
) VALUES (
    'John Smith', 'john.smith@example.com', '555-123-4567', 'Smith Development LLC',
    'developer', 'finance_build', true,
    'need_land', null, true, 'Looking for buildable lots in downtown Detroit area, preferably near public transportation',
    '350k_400k', '6_to_12_months', 'Planning a modern modular home development with 3-4 units. Focus on sustainable materials and energy efficiency.',
    'new', null
) ON CONFLICT DO NOTHING;

-- Sample submission 2: Homebuyer with own land
INSERT INTO intake_submissions (
    full_name, email_address, phone_number, company_name,
    buyer_category, financing_plan, interested_in_preferred_lender,
    land_status, lot_address, needs_help_finding_land, preferred_area_description,
    build_budget, construction_timeline, project_description,
    status, admin_notes
) VALUES (
    'Sarah Johnson', 'sarah.johnson@email.com', '555-987-6543', null,
    'homebuyer', 'self_funding', false,
    'own_land', '123 Maple Street, Ann Arbor, MI 48104', null, null,
    '250k_350k', '3_to_6_months', 'Building our first family home. Looking for a 3-bedroom, 2-bathroom design with an open floor plan.',
    'reviewed', 'Initial review completed. Good candidate for standard home package.'
) ON CONFLICT DO NOTHING;

-- Sample submission 3: Homebuyer needing land help
INSERT INTO intake_submissions (
    full_name, email_address, phone_number, company_name,
    buyer_category, financing_plan, interested_in_preferred_lender,
    land_status, lot_address, needs_help_finding_land, preferred_area_description,
    build_budget, construction_timeline, project_description,
    status, admin_notes
) VALUES (
    'Michael Chen', 'mchen@gmail.com', '555-456-7890', null,
    'homebuyer', 'finance_build', true,
    'need_land', null, true, 'Interested in Grand Rapids area, within 30 minutes of downtown. Prefer wooded lots.',
    '400k_500k', 'more_than_12_months', 'Retirement home for my wife and me. Want single-level living with accessibility features.',
    'qualified', 'Excellent credit score. Pre-approved for financing. Ready to move forward.'
) ON CONFLICT DO NOTHING;

