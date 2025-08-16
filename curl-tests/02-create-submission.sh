#!/bin/bash

# Function to format JSON output (use jq if available, otherwise raw)
format_json() {
    if command -v jq >/dev/null 2>&1; then
        jq '.'
    else
        cat
    fi
}

echo "=== Create Submission Test ==="
echo "Testing POST /api/submissions with valid data..."
echo

echo "Creating new submission:"
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Test User",
    "email_address": "john.test@example.com",
    "phone_number": "555-123-4567",
    "company_name": "Test Company",
    "buyer_category": "homebuyer",
    "financing_plan": "self_funding",
    "interested_in_preferred_lender": false,
    "land_status": "own_land",
    "lot_address": "123 Test Street, Test City, TS 12345",
    "needs_help_finding_land": false,
    "build_budget": "350k_400k",
    "construction_timeline": "6_to_12_months",
    "project_description": "Building a custom 3-bedroom home with modern amenities and energy-efficient features."
  }' | format_json

echo
echo "✅ Create submission test completed"

