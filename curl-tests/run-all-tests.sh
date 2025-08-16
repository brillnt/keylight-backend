#!/bin/bash

# Function to format JSON output (use jq if available, otherwise raw)
format_json() {
    if command -v jq >/dev/null 2>&1; then
        jq '.'
    else
        cat
    fi
}

echo "🚀 Running All API Tests"
echo "========================"
echo

# Check if server is running
echo "Checking if server is running on port 3000..."
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "❌ Server is not running on port 3000"
    echo "Please start the server with: npm start"
    exit 1
fi

echo "✅ Server is running"
echo

# Run all test scripts
for script in ./curl-tests/[0-9]*.sh; do
    if [ -f "$script" ]; then
        echo "Running $(basename "$script")..."
        bash "$script"
        echo
        echo "---"
        echo
    fi
done

echo "🎉 All API tests completed!"
echo
echo "Summary of available tests:"
echo "- 01-health-check.sh: Server health and database connection"
echo "- 02-create-submission.sh: Create valid submission"
echo "- 03-create-invalid-submission.sh: Test validation errors"
echo "- 04-get-submissions.sh: List and filter submissions"
echo "- 05-get-stats.sh: Dashboard statistics"
echo "- 06-search-submissions.sh: Search functionality"
echo "- 07-get-recent.sh: Recent submissions"
echo "- 08-update-status.sh: Update submission status"
echo "- 09-get-by-id.sh: Get individual submission"
echo "- 10-get-by-status.sh: Filter by status"

