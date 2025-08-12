#!/bin/bash

echo "=== Health Check Test ==="
echo "Testing server health and database connection..."
echo

echo "1. Server Health Check:"
curl -s http://localhost:3000/health | jq '.'
echo

echo "2. Database Connection Test:"
curl -s http://localhost:3000/api/test-db | jq '.'
echo

echo "3. API Info:"
curl -s http://localhost:3000/ | jq '.'
echo

echo "✅ Health check tests completed"

