#!/bin/bash

echo "=== Search Submissions Test ==="
echo "Testing GET /api/submissions/search (search functionality)..."
echo

echo "1. Search for 'John':"
curl -s "http://localhost:3000/api/submissions/search?q=John" | jq '.'
echo

echo "2. Search for 'test@example.com':"
curl -s "http://localhost:3000/api/submissions/search?q=test@example.com" | jq '.'
echo

echo "3. Search for 'custom home':"
curl -s "http://localhost:3000/api/submissions/search?q=custom%20home" | jq '.'
echo

echo "✅ Search submissions tests completed"

