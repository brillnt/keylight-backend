#!/bin/bash

# Function to format JSON output (use jq if available, otherwise raw)
format_json() {
    if command -v jq >/dev/null 2>&1; then
        jq '.'
    else
        cat
    fi
}

echo "=== Search Submissions Test ==="
echo "Testing GET /api/submissions/search (search functionality)..."
echo

echo "1. Search for 'John':"
curl -s "http://localhost:3000/api/submissions/search?q=John"  | format_json
echo

echo "2. Search for 'test@example.com':"
curl -s "http://localhost:3000/api/submissions/search?q=test@example.com"  | format_json
echo

echo "3. Search for 'custom home':"
curl -s "http://localhost:3000/api/submissions/search?q=custom%20home"  | format_json
echo

echo "✅ Search submissions tests completed"

