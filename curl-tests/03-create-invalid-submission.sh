#!/bin/bash

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
  }' | jq '.'

echo
echo "✅ Invalid submission test completed (should show validation errors)"

