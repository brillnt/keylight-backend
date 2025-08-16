#!/bin/bash

# Function to format JSON output (use jq if available, otherwise raw)
format_json() {
    if command -v jq >/dev/null 2>&1; then
        jq '.'
    else
        cat
    fi
}

echo "=== Update Submission Status Test ==="
echo "Testing PUT /api/submissions/:id/status (admin status updates)..."
echo

# Note: This assumes submission ID 1 exists. Adjust as needed.
SUBMISSION_ID=1

echo "1. Update submission status to 'reviewed':"
curl -X PUT http://localhost:3000/api/submissions/$SUBMISSION_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "reviewed",
    "admin_notes": "Initial review completed. Customer looks qualified."
  }'  | format_json
echo

echo "2. Update submission status to 'qualified':"
curl -X PUT http://localhost:3000/api/submissions/$SUBMISSION_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "qualified",
    "admin_notes": "Approved for next steps. Budget and timeline look good."
  }'  | format_json
echo

echo "✅ Status update tests completed"
echo "Note: These tests assume submission ID $SUBMISSION_ID exists. Adjust SUBMISSION_ID variable if needed."

