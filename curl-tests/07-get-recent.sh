#!/bin/bash

echo "=== Get Recent Submissions Test ==="
echo "Testing GET /api/submissions/recent (recent submissions)..."
echo

echo "1. Get recent submissions (last 7 days):"
curl -s "http://localhost:3000/api/submissions/recent?days=7&limit=5" | jq '.'
echo

echo "2. Get recent submissions (last 30 days):"
curl -s "http://localhost:3000/api/submissions/recent?days=30&limit=10" | jq '.'
echo

echo "✅ Recent submissions tests completed"

