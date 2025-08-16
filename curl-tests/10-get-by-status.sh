#!/bin/bash

# Function to format JSON output (use jq if available, otherwise raw)
format_json() {
    if command -v jq >/dev/null 2>&1; then
        jq '.'
    else
        cat
    fi
}

echo "=== Get Submissions by Status Test ==="
echo "Testing GET /api/submissions/status/:status (filter by specific status)..."
echo

echo "1. Get all 'new' submissions:"
curl -s "http://localhost:3000/api/submissions/status/new?page=1&pageSize=10"  | format_json
echo

echo "2. Get all 'reviewed' submissions:"
curl -s "http://localhost:3000/api/submissions/status/reviewed?page=1&pageSize=10"  | format_json
echo

echo "3. Get all 'qualified' submissions:"
curl -s "http://localhost:3000/api/submissions/status/qualified?page=1&pageSize=10"  | format_json
echo

echo "✅ Get by status tests completed"

