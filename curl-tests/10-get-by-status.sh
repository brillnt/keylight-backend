#!/bin/bash

echo "=== Get Submissions by Status Test ==="
echo "Testing GET /api/submissions/status/:status (filter by specific status)..."
echo

echo "1. Get all 'new' submissions:"
curl -s "http://localhost:3000/api/submissions/status/new?page=1&pageSize=10" | jq '.'
echo

echo "2. Get all 'reviewed' submissions:"
curl -s "http://localhost:3000/api/submissions/status/reviewed?page=1&pageSize=10" | jq '.'
echo

echo "3. Get all 'qualified' submissions:"
curl -s "http://localhost:3000/api/submissions/status/qualified?page=1&pageSize=10" | jq '.'
echo

echo "✅ Get by status tests completed"

