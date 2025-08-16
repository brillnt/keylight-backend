#!/bin/bash

# Function to format JSON output (use jq if available, otherwise raw)
format_json() {
    if command -v jq >/dev/null 2>&1; then
        jq '.'
    else
        cat
    fi
}

echo "=== Get Submissions Test ==="
echo "Testing GET /api/submissions (admin dashboard data)..."
echo

echo "1. Get all submissions (first page):"
curl -s "http://localhost:3000/api/submissions?page=1&pageSize=10"  | format_json
echo

echo "2. Get submissions filtered by status (new):"
curl -s "http://localhost:3000/api/submissions?status=new"  | format_json
echo

echo "3. Get submissions filtered by buyer category (homebuyer):"
curl -s "http://localhost:3000/api/submissions?buyer_category=homebuyer"  | format_json
echo

echo "4. Get submissions filtered by budget (350k_400k):"
curl -s "http://localhost:3000/api/submissions?build_budget=350k_400k"  | format_json
echo

echo "✅ Get submissions tests completed"

