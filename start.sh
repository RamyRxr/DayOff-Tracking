#!/bin/bash

echo "🚀 Starting DayOff Tracking System..."

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Kill any existing processes
pkill -9 node 2>/dev/null

# Start backend
echo "📦 Starting backend server..."
cd "$SCRIPT_DIR/server" && npm run dev > "$SCRIPT_DIR/server.log" 2>&1 &
SERVER_PID=$!

# Wait a bit for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend..."
cd "$SCRIPT_DIR/client" && npm run dev > "$SCRIPT_DIR/client.log" 2>&1 &
CLIENT_PID=$!

# Wait for services to start
sleep 3

echo ""
echo "✅ Servers started!"
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:5173"
echo ""
echo "📋 To stop: pkill -9 node"
echo "📋 Logs: tail -f server.log client.log"
