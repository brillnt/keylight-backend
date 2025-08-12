# API Testing with curl

This directory contains bash scripts for manually testing the Keylight Backend API endpoints using curl.

## Prerequisites

1. **Server must be running**: Start with `npm start` from the project root
2. **jq installed**: For pretty JSON formatting (optional but recommended)
   ```bash
   # macOS
   brew install jq
   
   # Ubuntu/Linux
   sudo apt install jq
   ```

## Available Tests

| Script | Description | Endpoint(s) Tested |
|--------|-------------|-------------------|
| `01-health-check.sh` | Server health and database connection | `/health`, `/api/test-db`, `/` |
| `02-create-submission.sh` | Create valid submission | `POST /api/submissions` |
| `03-create-invalid-submission.sh` | Test validation errors | `POST /api/submissions` (invalid data) |
| `04-get-submissions.sh` | List and filter submissions | `GET /api/submissions` (with filters) |
| `05-get-stats.sh` | Dashboard statistics | `GET /api/submissions/stats` |
| `06-search-submissions.sh` | Search functionality | `GET /api/submissions/search` |
| `07-get-recent.sh` | Recent submissions | `GET /api/submissions/recent` |
| `08-update-status.sh` | Update submission status | `PUT /api/submissions/:id/status` |
| `09-get-by-id.sh` | Get individual submission | `GET /api/submissions/:id` |
| `10-get-by-status.sh` | Filter by status | `GET /api/submissions/status/:status` |

## Running Tests

### Run Individual Tests
```bash
# From project root
./curl-tests/01-health-check.sh
./curl-tests/02-create-submission.sh
# etc.
```

### Run All Tests
```bash
# From project root
./curl-tests/run-all-tests.sh
```

## Test Data

The tests use realistic sample data:
- **Valid submission**: Complete homebuyer with all required fields
- **Invalid submission**: Missing/invalid data to test validation
- **Status updates**: Test admin workflow (reviewed → qualified)
- **Search terms**: Test search functionality with names, emails, descriptions

## Notes

- Tests assume the server is running on `http://localhost:3000`
- Some tests (08, 09) assume submission ID 1 exists - adjust `SUBMISSION_ID` variable if needed
- Tests create real data in your database - use a development database
- All scripts are executable and include clear output formatting

## Expected Results

- **Health checks**: Should return 200 OK with server/database status
- **Valid submission**: Should return 201 Created with submission data
- **Invalid submission**: Should return 400 Bad Request with validation errors
- **Get requests**: Should return 200 OK with requested data
- **Status updates**: Should return 200 OK with updated submission

## Troubleshooting

1. **Server not running**: Start with `npm start`
2. **Database connection errors**: Check PostgreSQL is running and configured
3. **jq not found**: Install jq or remove `| jq '.'` from commands
4. **Permission denied**: Run `chmod +x curl-tests/*.sh`

