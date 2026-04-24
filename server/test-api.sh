#!/usr/bin/env bash

API_URL="http://localhost:3001/api"

if ! command -v jq >/dev/null 2>&1; then
    echo "jq is required to run this script. Install it and retry."
    exit 1
fi

PASS_COUNT=0
TOTAL_COUNT=14

ADMIN_ID=""
EMPLOYEE_ID=""
CREATED_EMPLOYEE_ID=""
CREATED_BLOCK_ID=""

print_pass() {
    local test_no="$1"
    local endpoint="$2"
    echo "PASS Test ${test_no} - ${endpoint}"
    PASS_COUNT=$((PASS_COUNT + 1))
}

print_fail() {
    local test_no="$1"
    local endpoint="$2"
    local message="$3"
    echo "FAIL Test ${test_no} - ${endpoint} - ${message}"
}

request() {
    local method="$1"
    local url="$2"
    local payload="${3:-}"

    if [ -n "$payload" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" "$url" -H "Content-Type: application/json" -d "$payload")
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" "$url")
    fi

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
}

echo "Running API tests against ${API_URL}"
echo ""

# 1. GET /api/health
request "GET" "${API_URL}/health"
if [ "$HTTP_CODE" = "200" ] && [ "$(echo "$BODY" | jq -r '.status // empty')" = "ok" ]; then
    print_pass 1 "GET /api/health"
else
    print_fail 1 "GET /api/health" "expected HTTP 200 and status=ok, got HTTP ${HTTP_CODE}, body=${BODY}"
fi

# 2. GET /api/admins
request "GET" "${API_URL}/admins"
ADMINS_COUNT=$(echo "$BODY" | jq -r '.data | length // 0')
NO_PINHASH=$(echo "$BODY" | jq -r '[.data[] | has("pinHash")] | any | not')
ADMIN_ID=$(echo "$BODY" | jq -r '.data[0].id // empty')
if [ "$HTTP_CODE" = "200" ] && [ "$ADMINS_COUNT" = "3" ] && [ "$NO_PINHASH" = "true" ] && [ -n "$ADMIN_ID" ]; then
    print_pass 2 "GET /api/admins"
else
    print_fail 2 "GET /api/admins" "expected 3 admins without pinHash, got HTTP ${HTTP_CODE}, count=${ADMINS_COUNT}, noPinHash=${NO_PINHASH}, body=${BODY}"
fi

# 3. POST /api/admins/verify-pin valid
if [ -n "$ADMIN_ID" ]; then
    request "POST" "${API_URL}/admins/verify-pin" "{\"adminId\":\"${ADMIN_ID}\",\"pin\":\"1234\"}"
    VALID_PIN=$(echo "$BODY" | jq -r '.data.valid')
    if [ "$HTTP_CODE" = "200" ] && [ "$VALID_PIN" = "true" ]; then
        print_pass 3 "POST /api/admins/verify-pin (valid)"
    else
        print_fail 3 "POST /api/admins/verify-pin (valid)" "expected valid=true, got HTTP ${HTTP_CODE}, body=${BODY}"
    fi
else
    print_fail 3 "POST /api/admins/verify-pin (valid)" "missing admin id from Test 2"
fi

# 4. POST /api/admins/verify-pin invalid
if [ -n "$ADMIN_ID" ]; then
    request "POST" "${API_URL}/admins/verify-pin" "{\"adminId\":\"${ADMIN_ID}\",\"pin\":\"0000\"}"
    INVALID_PIN_RESULT=$(echo "$BODY" | jq -r '.data.valid')
    if [ "$HTTP_CODE" = "200" ] && [ "$INVALID_PIN_RESULT" = "false" ]; then
        print_pass 4 "POST /api/admins/verify-pin (invalid)"
    else
        print_fail 4 "POST /api/admins/verify-pin (invalid)" "expected valid=false, got HTTP ${HTTP_CODE}, body=${BODY}"
    fi
else
    print_fail 4 "POST /api/admins/verify-pin (invalid)" "missing admin id from Test 2"
fi

# 5. GET /api/employees
request "GET" "${API_URL}/employees"
EMP_COUNT=$(echo "$BODY" | jq -r '.data | length // 0')
HAS_STATS=$(echo "$BODY" | jq -r '(.data[0] | has("daysUsed")) and (.data[0] | has("daysWorked")) and (.data[0] | has("daysAvailable")) and (.data[0] | has("isAtRisk"))')
EMPLOYEE_ID=$(echo "$BODY" | jq -r '.data[0].id // empty')
if [ "$HTTP_CODE" = "200" ] && [ "$EMP_COUNT" -ge 60 ] && [ "$HAS_STATS" = "true" ] && [ -n "$EMPLOYEE_ID" ]; then
    print_pass 5 "GET /api/employees"
else
    print_fail 5 "GET /api/employees" "expected >=60 employees with stats, got HTTP ${HTTP_CODE}, count=${EMP_COUNT}, hasStats=${HAS_STATS}, body=${BODY}"
fi

# 6. GET /api/employees/:id
if [ -n "$EMPLOYEE_ID" ]; then
    request "GET" "${API_URL}/employees/${EMPLOYEE_ID}"
    HAS_SINGLE_STATS=$(echo "$BODY" | jq -r '(.data | has("daysUsed")) and (.data | has("daysWorked")) and (.data | has("daysAvailable")) and (.data | has("isAtRisk")) and (.data | has("daysOff"))')
    if [ "$HTTP_CODE" = "200" ] && [ "$HAS_SINGLE_STATS" = "true" ]; then
        print_pass 6 "GET /api/employees/:id"
    else
        print_fail 6 "GET /api/employees/:id" "expected employee with stats+daysOff, got HTTP ${HTTP_CODE}, body=${BODY}"
    fi
else
    print_fail 6 "GET /api/employees/:id" "missing employee id from Test 5"
fi

# 7. POST /api/employees
UNIQ_SUFFIX=$(date +%s)
NEW_MATRICULE="NAF-${UNIQ_SUFFIX: -4}"
NEW_EMAIL="test.${UNIQ_SUFFIX}@naftal.dz"
request "POST" "${API_URL}/employees" "{\"firstName\":\"Test\",\"lastName\":\"Agent\",\"email\":\"${NEW_EMAIL}\",\"phone\":\"+213551112233\",\"department\":\"Administration\",\"position\":\"Analyste\",\"hireDate\":\"2021-06-15\",\"matricule\":\"${NEW_MATRICULE}\"}"
CREATED_EMPLOYEE_ID=$(echo "$BODY" | jq -r '.data.id // empty')
if [ "$HTTP_CODE" = "201" ] && [ -n "$CREATED_EMPLOYEE_ID" ]; then
    print_pass 7 "POST /api/employees"
else
    print_fail 7 "POST /api/employees" "expected HTTP 201 with created id, got HTTP ${HTTP_CODE}, body=${BODY}"
fi

# 8. GET /api/daysoff
request "GET" "${API_URL}/daysoff"
DAYSOFF_IS_ARRAY=$(echo "$BODY" | jq -r '.data | type == "array"')
if [ "$HTTP_CODE" = "200" ] && [ "$DAYSOFF_IS_ARRAY" = "true" ]; then
    print_pass 8 "GET /api/daysoff"
else
    print_fail 8 "GET /api/daysoff" "expected HTTP 200 with array, got HTTP ${HTTP_CODE}, body=${BODY}"
fi

# 9. GET /api/daysoff?employeeId=:id
if [ -n "$EMPLOYEE_ID" ]; then
    request "GET" "${API_URL}/daysoff?employeeId=${EMPLOYEE_ID}"
    FILTERED_MATCH=$(echo "$BODY" | jq -r --arg eid "$EMPLOYEE_ID" 'all(.data[]; .employeeId == $eid)')
    if [ "$HTTP_CODE" = "200" ] && [ "$FILTERED_MATCH" = "true" ]; then
        print_pass 9 "GET /api/daysoff?employeeId=:id"
    else
        print_fail 9 "GET /api/daysoff?employeeId=:id" "expected records filtered by employeeId, got HTTP ${HTTP_CODE}, body=${BODY}"
    fi
else
    print_fail 9 "GET /api/daysoff?employeeId=:id" "missing employee id from Test 5"
fi

# 10. POST /api/daysoff
TODAY=$(date +%F)
TOMORROW=$(date -d "+1 day" +%F)
request "POST" "${API_URL}/daysoff" "{\"employeeId\":\"${CREATED_EMPLOYEE_ID}\",\"startDate\":\"${TODAY}\",\"endDate\":\"${TOMORROW}\",\"type\":\"Congé annuel\",\"reason\":\"Test API\",\"justification\":\"Validation automatique\"}"
HAS_AUTOBLOCKED=$(echo "$BODY" | jq -r '.data | has("autoBlocked")')
if [ "$HTTP_CODE" = "201" ] && [ "$HAS_AUTOBLOCKED" = "true" ]; then
    print_pass 10 "POST /api/daysoff"
else
    print_fail 10 "POST /api/daysoff" "expected HTTP 201 with autoBlocked field, got HTTP ${HTTP_CODE}, body=${BODY}"
fi

# 11. GET /api/blocks
request "GET" "${API_URL}/blocks"
ACTIVE_ONLY=$(echo "$BODY" | jq -r 'all(.data[]; .isActive == true)')
ACTIVE_BLOCKS_COUNT=$(echo "$BODY" | jq -r '.data | length // 0')
if [ "$HTTP_CODE" = "200" ] && [ "$ACTIVE_ONLY" = "true" ]; then
    print_pass 11 "GET /api/blocks"
else
    print_fail 11 "GET /api/blocks" "expected only active blocks, got HTTP ${HTTP_CODE}, body=${BODY}"
fi

# 12. GET /api/blocks?active=false
request "GET" "${API_URL}/blocks?active=false"
ALL_BLOCKS_COUNT=$(echo "$BODY" | jq -r '.data | length // 0')
if [ "$HTTP_CODE" = "200" ] && [ "$ALL_BLOCKS_COUNT" -ge "$ACTIVE_BLOCKS_COUNT" ]; then
    print_pass 12 "GET /api/blocks?active=false"
else
    print_fail 12 "GET /api/blocks?active=false" "expected all blocks count >= active blocks count, got HTTP ${HTTP_CODE}, active=${ACTIVE_BLOCKS_COUNT}, all=${ALL_BLOCKS_COUNT}, body=${BODY}"
fi

# 13. POST /api/blocks
if [ -n "$CREATED_EMPLOYEE_ID" ] && [ -n "$ADMIN_ID" ]; then
    request "POST" "${API_URL}/blocks" "{\"employeeId\":\"${CREATED_EMPLOYEE_ID}\",\"adminId\":\"${ADMIN_ID}\",\"reason\":\"Absences non justifiees\",\"description\":\"Blocage manuel de test\"}"
    CREATED_BLOCK_ID=$(echo "$BODY" | jq -r '.data.id // empty')
    if [ "$HTTP_CODE" = "201" ] && [ -n "$CREATED_BLOCK_ID" ]; then
        print_pass 13 "POST /api/blocks"
    else
        print_fail 13 "POST /api/blocks" "expected HTTP 201 with block id, got HTTP ${HTTP_CODE}, body=${BODY}"
    fi
else
    print_fail 13 "POST /api/blocks" "missing admin id or created employee id from previous tests"
fi

# 14. PATCH /api/blocks/:id/unblock
if [ -n "$CREATED_BLOCK_ID" ] && [ -n "$ADMIN_ID" ]; then
    request "PATCH" "${API_URL}/blocks/${CREATED_BLOCK_ID}/unblock" "{\"adminId\":\"${ADMIN_ID}\",\"unblockReason\":\"Regularisation\",\"unblockDescription\":\"Deblocage manuel de test\"}"
    UNBLOCKED=$(echo "$BODY" | jq -r '.data.isActive == false')
    if [ "$HTTP_CODE" = "200" ] && [ "$UNBLOCKED" = "true" ]; then
        print_pass 14 "PATCH /api/blocks/:id/unblock"
    else
        print_fail 14 "PATCH /api/blocks/:id/unblock" "expected HTTP 200 and isActive=false, got HTTP ${HTTP_CODE}, body=${BODY}"
    fi
else
    print_fail 14 "PATCH /api/blocks/:id/unblock" "missing block id or admin id from previous tests"
fi

echo ""
echo "${PASS_COUNT}/${TOTAL_COUNT} tests passed"

if [ "$PASS_COUNT" -ne "$TOTAL_COUNT" ]; then
    exit 1
fi
