#!/bin/bash

# API Test Script for DayOff-Tracking Backend
# Tests all endpoints to ensure everything is working

API_URL="http://localhost:3001/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing DayOff-Tracking API..."
echo "================================"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/health)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "   Response: $BODY"
else
    echo -e "${RED}❌ Health check failed (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 2: Get All Employees
echo "2️⃣  Testing GET /api/employees..."
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/employees)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    COUNT=$(echo "$BODY" | jq '.data | length')
    echo -e "${GREEN}✅ Employees list retrieved${NC}"
    echo "   Found: $COUNT employees"
else
    echo -e "${RED}❌ Failed to get employees (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 3: Get Single Employee
echo "3️⃣  Testing GET /api/employees/1..."
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/employees/1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    NAME=$(echo "$BODY" | jq -r '.data.name')
    echo -e "${GREEN}✅ Single employee retrieved${NC}"
    echo "   Employee: $NAME"
else
    echo -e "${RED}❌ Failed to get employee (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 4: Get All Admins
echo "4️⃣  Testing GET /api/admins..."
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/admins)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    COUNT=$(echo "$BODY" | jq '.data | length')
    echo -e "${GREEN}✅ Admins list retrieved${NC}"
    echo "   Found: $COUNT admins"
else
    echo -e "${RED}❌ Failed to get admins (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 5: Verify Admin PIN (correct)
echo "5️⃣  Testing POST /api/admins/verify-pin (correct PIN)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/admins/verify-pin \
    -H "Content-Type: application/json" \
    -d '{"adminId": 1, "pin": "1234"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    VERIFIED=$(echo "$BODY" | jq -r '.data.verified')
    NAME=$(echo "$BODY" | jq -r '.data.name')
    echo -e "${GREEN}✅ PIN verification successful${NC}"
    echo "   Admin: $NAME (verified: $VERIFIED)"
else
    echo -e "${RED}❌ PIN verification failed (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 6: Verify Admin PIN (incorrect)
echo "6️⃣  Testing POST /api/admins/verify-pin (wrong PIN)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/admins/verify-pin \
    -H "Content-Type: application/json" \
    -d '{"adminId": 1, "pin": "9999"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}✅ Correctly rejected wrong PIN${NC}"
else
    echo -e "${RED}❌ Should have rejected wrong PIN (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 7: Get All Blocks
echo "7️⃣  Testing GET /api/blocks..."
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/blocks)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    COUNT=$(echo "$BODY" | jq '.data | length')
    echo -e "${GREEN}✅ Blocks list retrieved${NC}"
    echo "   Found: $COUNT active blocks"
else
    echo -e "${RED}❌ Failed to get blocks (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 8: Get All Days Off
echo "8️⃣  Testing GET /api/daysoff..."
RESPONSE=$(curl -s -w "\n%{http_code}" $API_URL/daysoff)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    COUNT=$(echo "$BODY" | jq '.data | length')
    echo -e "${GREEN}✅ Days-off list retrieved${NC}"
    echo "   Found: $COUNT day-off records"
else
    echo -e "${RED}❌ Failed to get days-off (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 9: Create New Day Off
echo "9️⃣  Testing POST /api/daysoff..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/daysoff \
    -H "Content-Type: application/json" \
    -d '{
        "employeeId": 1,
        "startDate": "2026-05-12",
        "endDate": "2026-05-13",
        "reason": "Test day off"
    }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 201 ]; then
    WORKING_DAYS=$(echo "$BODY" | jq -r '.data.stats.workingDays')
    SANDWICH=$(echo "$BODY" | jq -r '.data.stats.isSandwich')
    echo -e "${GREEN}✅ Day-off created successfully${NC}"
    echo "   Working days: $WORKING_DAYS, Sandwich: $SANDWICH"
else
    echo -e "${RED}❌ Failed to create day-off (HTTP $HTTP_CODE)${NC}"
    echo "   Error: $BODY"
fi
echo ""

# Summary
echo "================================"
echo "✨ Test Summary Complete"
echo "================================"
echo ""
echo -e "${YELLOW}📋 Test the frontend at: http://localhost:5173${NC}"
echo -e "${YELLOW}🔑 Login with: Mohammed Saïd / PIN: 1234${NC}"
