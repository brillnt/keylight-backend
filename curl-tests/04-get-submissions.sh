#!/bin/bash

echo "=== Get Submissions Test ==="
echo "Testing GET /api/submissions (admin dashboard data)..."
echo

echo "1. Get all submissions (first page):"
curl -s "http://localhost:3000/api/submissions?page=1&pageSize=10" | jq '.'
echo

echo "2. Get submissions filtered by status (new):"
curl -s "http://localhost:3000/api/submissions?status=new" | jq '.'
echo

echo "3. Get submissions filtered by buyer category (homebuyer):"
curl -s "http://localhost:3000/api/submissions?buyer_category=homebuyer" | jq '.'
echo

echo "4. Get submissions filtered by budget (350k_400k):"
curl -s "http://localhost:3000/api/submissions?build_budget=350k_400k" | jq '.'
echo

echo "✅ Get submissions tests completed"

