#!/bin/bash

# Function to format JSON output (use jq if available, otherwise raw)
format_json() {
    if command -v jq >/dev/null 2>&1; then
        jq '.'
    else
        cat
    fi
}

echo "=== Health Check Test ==="
echo "Testing server health and database connection..."
echo

echo "1. Server Health Check:"
curl -s http://localhost:3000/health | format_json
echo

echo "2. Database Connection Test:"
curl -s http://localhost:3000/api/test-db | format_json
echo

echo "3. API Info:"
curl -s http://localhost:3000/ | format_json
echo

echo "✅ Health check tests completed"

