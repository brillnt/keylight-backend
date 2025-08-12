# Known Issues

## Node.js Test Serialization Error

**Status:** Open  
**Priority:** Medium  
**Date Discovered:** 2025-08-12  

### Description
Node.js test runner throws serialization error when running database tests:
```
Error: Unable to deserialize cloned data due to invalid or unsupported version.
```

### Symptoms
- Tests work initially but fail consistently after multiple runs
- Error occurs during test 3 (validation test) in `tests/database.test.js`
- Specifically fails during `validateSubmissionData()` method call
- `console.dir(sanitizedValid)` prints when tests pass, doesn't print when they fail

### Investigation Results
1. **Database state accumulation:** Database has accumulated test records (7 total), but this is NOT the cause
2. **Test isolation:** The failing test performs zero database operations - only validates static objects
3. **Validation code analysis:** `validateSubmissionData()` creates only simple, serializable objects
4. **Process cleanup:** Added process exit handlers, but error persists

### Evidence Gathered
- Error occurs before any database operations in the validation test
- Validation method creates only basic objects (arrays, strings, Error instances)
- No circular references or complex objects found in validation code
- Database record accumulation is irrelevant to this specific test

### Current Status
Root cause remains unknown. The serialization error occurs during execution of simple validation logic that should not create non-serializable objects.

### Next Steps
- Consider Node.js version compatibility issues
- Investigate test runner configuration
- Test with different test frameworks
- Examine if ESM module loading creates serialization issues

### Workaround
None identified. Tests can be run individually but not as a suite.

