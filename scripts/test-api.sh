#!/bin/bash

# Test script for API endpoints
# This demonstrates how to properly authenticate and call the API

BASE_URL="http://localhost:3000"

echo "========================================="
echo "Testing Mermaid ReactFlow Platform API"
echo "========================================="
echo ""

# Step 1: Get CSRF token
echo "Step 1: Getting CSRF token..."
CSRF_RESPONSE=$(curl -s -c cookies.txt "${BASE_URL}/api/auth/csrf")
CSRF_TOKEN=$(echo $CSRF_RESPONSE | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)
echo "CSRF Token: ${CSRF_TOKEN:0:20}..."
echo ""

# Step 2: Login
echo "Step 2: Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -b cookies.txt -c cookies.txt \
  -X POST "${BASE_URL}/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "csrfToken=$CSRF_TOKEN" \
  --data-urlencode "email=admin@example.com" \
  --data-urlencode "password=admin123" \
  --data-urlencode "callbackUrl=${BASE_URL}/dashboard" \
  --data-urlencode "json=true")

echo "Login response: $LOGIN_RESPONSE"
echo ""

# Step 3: Test GET /api/flowcharts (list all)
echo "Step 3: Getting all flowcharts..."
GET_RESPONSE=$(curl -s -b cookies.txt "${BASE_URL}/api/flowcharts")
echo "$GET_RESPONSE" | jq '.' 2>/dev/null || echo "$GET_RESPONSE"
echo ""

# Step 4: Test POST /api/flowcharts (create new)
echo "Step 4: Creating new flowchart..."
POST_RESPONSE=$(curl -s -b cookies.txt \
  -X POST "${BASE_URL}/api/flowcharts" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Flowchart from API",
    "markdown": "flowchart TD\n    A[Start] --> B[End]"
  }')

FLOWCHART_ID=$(echo "$POST_RESPONSE" | jq -r '.id' 2>/dev/null)
echo "$POST_RESPONSE" | jq '.' 2>/dev/null || echo "$POST_RESPONSE"
echo ""

# Step 5: Test GET /api/flowcharts/[id] (get specific)
if [ "$FLOWCHART_ID" != "null" ] && [ -n "$FLOWCHART_ID" ]; then
  echo "Step 5: Getting flowchart #${FLOWCHART_ID}..."
  GET_ONE_RESPONSE=$(curl -s -b cookies.txt "${BASE_URL}/api/flowcharts/${FLOWCHART_ID}")
  echo "$GET_ONE_RESPONSE" | jq '.' 2>/dev/null || echo "$GET_ONE_RESPONSE"
  echo ""

  # Step 6: Test PUT /api/flowcharts/[id] (update)
  echo "Step 6: Updating flowchart #${FLOWCHART_ID}..."
  PUT_RESPONSE=$(curl -s -b cookies.txt \
    -X PUT "${BASE_URL}/api/flowcharts/${FLOWCHART_ID}" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Updated Test Flowchart",
      "status": "published"
    }')
  echo "$PUT_RESPONSE" | jq '.' 2>/dev/null || echo "$PUT_RESPONSE"
  echo ""
fi

echo "========================================="
echo "Test completed!"
echo "========================================="
echo ""
echo "Note: Session cookies are saved in cookies.txt"
echo "You can use these cookies for subsequent requests."
echo ""
echo "Clean up:"
echo "  rm cookies.txt"
