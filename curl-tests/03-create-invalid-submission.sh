#!/bin/bash

# Function to format JSON output (use jq if available, otherwise raw)
format_json() {
    if command -v jq >/dev/null 2>&1; then
        jq '.'
    else
        cat
    fi
}

echo "=== Create Invalid Submission Test ==="
echo "Testing POST /api/submissions with invalid data (should fail)..."
echo

echo "Attempting to create submission with missing required fields:"
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "",
    "email_address": "invalid-email",
    "phone_number": "",
    "buyer_category": "invalid_category",
    "financing_plan": "",
    "land_status": "",
    "build_budget": "",
    "construction_timeline": "",
    "project_description": ""
  }'  | format_json

echo
echo "✅ Invalid submission test completed (should show validation errors)"

