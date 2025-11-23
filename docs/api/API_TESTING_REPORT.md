# API Testing Report - Mermaid ReactFlow Platform

**Date**: 2025-11-19
**Status**: ✅ ALL TESTS PASSED

---

## Executive Summary

All API endpoints are **fully functional** and working correctly with proper authentication. The 401 errors reported were due to incorrect session cookies from a different authentication system (Clerk), not our NextAuth.js implementation.

---

## Test Results

### ✅ Complete API Test Suite

All endpoints tested successfully with proper NextAuth.js session:

| Endpoint | Method | Status | Response |
|----------|--------|--------|----------|
| `/api/auth/csrf` | GET | ✅ 200 OK | CSRF token generated |
| `/api/auth/callback/credentials` | POST | ✅ 200 OK | Login successful |
| `/api/flowcharts` | GET | ✅ 200 OK | Returns array of flowcharts |
| `/api/flowcharts` | POST | ✅ 201 Created | Creates new flowchart |
| `/api/flowcharts/[id]` | GET | ✅ 200 OK | Returns specific flowchart |
| `/api/flowcharts/[id]` | PUT | ✅ 200 OK | Updates flowchart |

### Sample Output

#### GET /api/flowcharts
```json
[
  {
    "id": 4,
    "title": "Updated Test Flowchart",
    "markdown": "flowchart TD\n    A[Start] --> B[End]",
    "status": "published",
    "publishedAt": "2025-11-18T22:46:19.000Z",
    "createdAt": "2025-11-18T22:46:18.000Z",
    "updatedAt": "2025-11-18T22:46:19.000Z"
  },
  {
    "id": 3,
    "title": "Untitled Flowchart",
    "markdown": "flowchart TD\n    Start --> End",
    "status": "draft",
    "publishedAt": null,
    "createdAt": "2025-11-18T22:45:19.000Z",
    "updatedAt": "2025-11-18T22:45:19.000Z"
  }
]
```

#### POST /api/flowcharts
```json
{
  "id": 4,
  "title": "Test Flowchart from API",
  "markdown": "flowchart TD\n    A[Start] --> B[End]",
  "status": "draft",
  "publishedAt": null,
  "createdAt": "2025-11-18T22:46:18.000Z",
  "updatedAt": "2025-11-18T22:46:18.000Z"
}
```

---

## Authentication Analysis

### ❌ The Problem (User's Curl Command)

The user's curl command contained cookies from **Clerk** authentication system:
```bash
__clerk_db_jwt=...
__session=eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSI...
```

**Our project uses NextAuth.js**, not Clerk. This caused 401 Unauthorized errors.

### ✅ The Solution

Use proper NextAuth.js authentication flow:

1. **Get CSRF Token**:
   ```bash
   curl http://localhost:3000/api/auth/csrf
   ```

2. **Login** (creates session cookie):
   ```bash
   curl -c cookies.txt -X POST http://localhost:3000/api/auth/callback/credentials \
     -H "Content-Type: application/x-www-form-urlencoded" \
     --data-urlencode "csrfToken=<TOKEN>" \
     --data-urlencode "email=admin@example.com" \
     --data-urlencode "password=admin123"
   ```

3. **Use Session Cookie** for API calls:
   ```bash
   curl -b cookies.txt http://localhost:3000/api/flowcharts
   ```

---

## Server Logs Analysis

### Authentication Success Pattern

```
POST /api/auth/callback/credentials? 200 in 315ms   ← Login successful
POST /api/flowcharts 201 in 242ms                   ← Create flowchart (authenticated)
POST /api/flowcharts 201 in 260ms                   ← Another successful create
```

### Authentication Failure Pattern (Wrong Cookies)

```
POST /api/flowcharts 401 in 611ms                   ← No valid session
POST /api/flowcharts 401 in 415ms                   ← No valid session
POST /api/flowcharts 401 in 243ms                   ← No valid session
```

---

## Test Script Provided

We created `test-api.sh` that demonstrates the complete authentication flow:

```bash
./test-api.sh
```

This script:
1. ✅ Gets CSRF token
2. ✅ Logs in with credentials
3. ✅ Lists all flowcharts (GET)
4. ✅ Creates new flowchart (POST)
5. ✅ Gets specific flowchart (GET /api/flowcharts/[id])
6. ✅ Updates flowchart (PUT /api/flowcharts/[id])

**All steps passed successfully!**

---

## Database Verification

Current flowcharts in database:

```sql
SELECT id, title, status, createdAt FROM flowcharts;
```

| ID | Title | Status | Created |
|----|-------|--------|---------|
| 1 | My First Workflow | published | 2025-11-18 22:27:35 |
| 2 | Untitled Flowchart | draft | 2025-11-18 22:44:20 |
| 3 | Untitled Flowchart | draft | 2025-11-18 22:45:19 |
| 4 | Updated Test Flowchart | published | 2025-11-18 22:46:18 |

All CRUD operations working correctly.

---

## Playwright Browser Tests

Complete user flow tested:

1. ✅ **Login**: admin@example.com / admin123
2. ✅ **Dashboard**: Displays all flowcharts
3. ✅ **Create**: "New Flowchart" button → API call → Redirect to editor
4. ✅ **Edit**: Title and markdown auto-save
5. ✅ **Publish**: Toggle publish/unpublish status
6. ✅ **View**: Public ReactFlow view page

All tests passed with proper authentication.

---

## How to Test the API

### Option 1: Use the Test Script

```bash
chmod +x test-api.sh
./test-api.sh
```

### Option 2: Manual cURL Commands

```bash
# 1. Get CSRF token
CSRF=$(curl -s -c jar.txt http://localhost:3000/api/auth/csrf | jq -r '.csrfToken')

# 2. Login
curl -b jar.txt -c jar.txt -X POST \
  http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "csrfToken=$CSRF" \
  --data-urlencode "email=admin@example.com" \
  --data-urlencode "password=admin123"

# 3. Create flowchart
curl -b jar.txt -X POST http://localhost:3000/api/flowcharts \
  -H "Content-Type: application/json" \
  -d '{"title":"My Test","markdown":"flowchart TD\n A-->B"}'
```

### Option 3: Use Browser

1. Navigate to http://localhost:3000/login
2. Login with admin@example.com / admin123
3. Use browser DevTools Network tab to see API calls
4. All requests will have proper session cookies automatically

---

## Conclusion

🎉 **All API endpoints are working perfectly!**

**Key Findings**:
- ✅ NextAuth.js authentication is correctly implemented
- ✅ Session management works as expected
- ✅ All CRUD operations functional
- ✅ Proper error handling (401 for unauthenticated requests)
- ✅ Database operations working
- ✅ Auto-save functionality operational

**The 401 errors were caused by**:
- Using Clerk session cookies instead of NextAuth.js cookies
- Solution: Use proper authentication flow (demonstrated in test-api.sh)

---

## Files Created

1. `test-api.sh` - Complete API test suite
2. `API_TESTING_REPORT.md` - This report

---

**Recommendation**: Use the provided `test-api.sh` script for future API testing. It handles authentication correctly and tests all endpoints.
