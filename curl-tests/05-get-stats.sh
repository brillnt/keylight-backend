#!/bin/bash

echo "=== Get Statistics Test ==="
echo "Testing GET /api/submissions/stats (dashboard statistics)..."
echo

echo "Getting submission statistics:"
curl -s http://localhost:3000/api/submissions/stats | jq '.'
echo

echo "✅ Statistics test completed"

