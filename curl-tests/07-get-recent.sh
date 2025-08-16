#!/bin/bash

# Function to format JSON output (use jq if available, otherwise raw)
format_json() {
    if command -v jq >/dev/null 2>&1; then
        jq '.'
    else
        cat
    fi
}

echo "=== Get Recent Submissions Test ==="
echo "Testing GET /api/submissions/recent (recent submissions)..."
echo

echo "1. Get recent submissions (last 7 days):"
curl -s "http://localhost:3000/api/submissions/recent?days=7&limit=5"  | format_json
echo

echo "2. Get recent submissions (last 30 days):"
curl -s "http://localhost:3000/api/submissions/recent?days=30&limit=10"  | format_json
echo

echo "✅ Recent submissions tests completed"

