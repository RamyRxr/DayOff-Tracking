#!/bin/bash

echo "🔍 COMPREHENSIVE SYSTEM TEST"
echo "=============================="
echo ""

# Test 1: Database Connection
echo "1️⃣ Testing Database Connection..."
if [ -f "prisma/prisma/dev.db" ]; then
    SIZE=$(du -h prisma/prisma/dev.db | cut -f1)
    echo "✅ Database found: $SIZE"
    
    # Count tables
    TABLES=$(sqlite3 prisma/prisma/dev.db ".tables" | wc -w)
    echo "✅ Tables found: $TABLES"
    
    # Count employees
    EMP_COUNT=$(sqlite3 prisma/prisma/dev.db "SELECT COUNT(*) FROM employees;")
    echo "✅ Employees in DB: $EMP_COUNT"
    
    # Count admins
    ADMIN_COUNT=$(sqlite3 prisma/prisma/dev.db "SELECT COUNT(*) FROM admins;")
    echo "✅ Admins in DB: $ADMIN_COUNT"
else
    echo "❌ Database not found!"
fi
echo ""

# Test 2: Prisma Client
echo "2️⃣ Testing Prisma Client..."
if [ -d "node_modules/@prisma/client" ]; then
    echo "✅ Prisma Client installed"
else
    echo "❌ Prisma Client missing!"
fi
echo ""

# Test 3: Server Status
echo "3️⃣ Testing Server..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Server is running"
else
    echo "❌ Server not responding!"
fi
echo ""

# Test 4: Frontend Status  
echo "4️⃣ Testing Frontend..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend not responding!"
fi
echo ""

# Test 5: Check for CORS issues
echo "5️⃣ Testing CORS..."
CORS_HEADER=$(curl -s -I http://localhost:3001/api/health | grep -i "access-control")
if [ -n "$CORS_HEADER" ]; then
    echo "✅ CORS headers present"
else
    echo "⚠️  CORS headers missing (might cause issues)"
fi
echo ""

echo "=============================="
echo "Test Complete!"
