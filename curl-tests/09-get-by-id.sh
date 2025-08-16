#!/bin/bash

# Function to format JSON output (use jq if available, otherwise raw)
format_json() {
    if command -v jq >/dev/null 2>&1; then
        jq '.'
    else
        cat
    fi
}

echo "=== Get Submission by ID Test ==="
echo "Testing GET /api/submissions/:id (individual submission details)..."
echo

# Note: This assumes submission ID 1 exists. Adjust as needed.
SUBMISSION_ID=1

echo "Getting submission details for ID $SUBMISSION_ID:"
curl -s http://localhost:3000/api/submissions/$SUBMISSION_ID  | format_json
echo

echo "✅ Get by ID test completed"
echo "Note: This test assumes submission ID $SUBMISSION_ID exists. Adjust SUBMISSION_ID variable if needed."

