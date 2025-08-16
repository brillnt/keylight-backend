#!/bin/bash

# Function to format JSON output (use jq if available, otherwise raw)
format_json() {
    if command -v jq >/dev/null 2>&1; then
        jq '.'
    else
        cat
    fi
}

echo "=== Get Statistics Test ==="
echo "Testing GET /api/submissions/stats (dashboard statistics)..."
echo

echo "Getting submission statistics:"
curl -s http://localhost:3000/api/submissions/stats  | format_json
echo

echo "✅ Statistics test completed"

