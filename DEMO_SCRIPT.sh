#!/bin/bash

# CrashLensAI Complete Demo Script
# This script will start all services and run a complete demo

set -e

echo "🚀 CrashLensAI Demo Script"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${GREEN}✓${NC} $service is running on port $port"
        return 0
    else
        echo -e "${RED}✗${NC} $service is NOT running on port $port"
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo "Killing process on port $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
}

echo "Step 1: Stopping any existing services..."
echo "=========================================="
kill_port 3000  # Frontend
kill_port 3001  # Backend
kill_port 6379  # Redis (if started by script)
pkill -f "triage-agent.js" || true
pkill -f "pattern-agent.js" || true
pkill -f "resolution-agent.js" || true
sleep 2
echo -e "${GREEN}✓${NC} All services stopped"
echo ""

echo "Step 2: Checking Redis..."
echo "========================="
if ! redis-cli ping >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Redis is not running. Starting Redis..."
    redis-server --daemonize yes
    sleep 2
    if redis-cli ping >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Redis started successfully"
    else
        echo -e "${RED}✗${NC} Failed to start Redis. Please start it manually: redis-server"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} Redis is already running"
fi
echo ""

echo "Step 3: Starting Backend Server..."
echo "==================================="
cd CrashLensAI/backend
npm start > /tmp/crashlens-backend.log 2>&1 &
BACKEND_PID=$!
cd ../..
sleep 3

if check_service 3001 "Backend"; then
    echo -e "${GREEN}✓${NC} Backend started (PID: $BACKEND_PID)"
else
    echo -e "${RED}✗${NC} Backend failed to start. Check logs: tail -f /tmp/crashlens-backend.log"
    exit 1
fi
echo ""

echo "Step 4: Starting AI Agents..."
echo "=============================="
cd CrashLensAI/backend

echo "Starting Triage Agent..."
node agents/triage-agent.js > /tmp/crashlens-triage.log 2>&1 &
TRIAGE_PID=$!
sleep 1
echo -e "${GREEN}✓${NC} Triage Agent started (PID: $TRIAGE_PID)"

echo "Starting Pattern Agent..."
node agents/pattern-agent.js > /tmp/crashlens-pattern.log 2>&1 &
PATTERN_PID=$!
sleep 1
echo -e "${GREEN}✓${NC} Pattern Agent started (PID: $PATTERN_PID)"

echo "Starting Resolution Agent..."
node agents/resolution-agent.js > /tmp/crashlens-resolution.log 2>&1 &
RESOLUTION_PID=$!
sleep 1
echo -e "${GREEN}✓${NC} Resolution Agent started (PID: $RESOLUTION_PID)"

cd ../..
echo ""

echo "Step 5: Starting Frontend..."
echo "============================"
cd CrashLensAI/frontend
npm run dev > /tmp/crashlens-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..
sleep 5

if check_service 3000 "Frontend"; then
    echo -e "${GREEN}✓${NC} Frontend started (PID: $FRONTEND_PID)"
else
    echo -e "${RED}✗${NC} Frontend failed to start. Check logs: tail -f /tmp/crashlens-frontend.log"
    exit 1
fi
echo ""

echo "Step 6: Service Status Check..."
echo "================================"
check_service 6379 "Redis" || echo -e "${RED}✗${NC} Redis check failed"
check_service 3001 "Backend" || echo -e "${RED}✗${NC} Backend check failed"
check_service 3000 "Frontend" || echo -e "${RED}✗${NC} Frontend check failed"
echo ""

echo "Step 7: Testing SSE Connection..."
echo "=================================="
sleep 2
curl -s -N -m 2 http://localhost:3001/api/agent-activity > /tmp/sse-test.txt 2>&1 &
SSE_TEST_PID=$!
sleep 2
kill $SSE_TEST_PID 2>/dev/null || true

if grep -q "data:" /tmp/sse-test.txt 2>/dev/null; then
    echo -e "${GREEN}✓${NC} SSE endpoint is working"
else
    echo -e "${YELLOW}⚠${NC} SSE endpoint may not be working properly"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}✓ ALL SERVICES STARTED SUCCESSFULLY!${NC}"
echo "=========================================="
echo ""
echo "📊 Service URLs:"
echo "   Dashboard:  http://localhost:3000"
echo "   Backend:    http://localhost:3001"
echo "   Health:     http://localhost:3001/health"
echo ""
echo "📝 Log Files:"
echo "   Backend:    tail -f /tmp/crashlens-backend.log"
echo "   Triage:     tail -f /tmp/crashlens-triage.log"
echo "   Pattern:    tail -f /tmp/crashlens-pattern.log"
echo "   Resolution: tail -f /tmp/crashlens-resolution.log"
echo "   Frontend:   tail -f /tmp/crashlens-frontend.log"
echo ""
echo "🎬 DEMO INSTRUCTIONS:"
echo "===================="
echo ""
echo "1. Open browser to: http://localhost:3000"
echo "   You should see the dashboard with 'Agent Activity' panel"
echo ""
echo "2. Send a test crash using curl:"
echo ""
echo "   curl -X POST http://localhost:3001/api/report-crash \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{
echo "       \"endpoint\": \"/api/users/profile\","
echo "       \"statusCode\": 500,"
echo "       \"errorMessage\": \"Cannot read property id of undefined\","
echo "       \"stackTrace\": \"at getUserProfile (/app/users.js:45:12)\""
echo "     }'"
echo ""
echo "3. Watch the dashboard:"
echo "   - Agent Activity feed will show 'Triage Agent: Analyzing...'"
echo "   - New incident will appear with AI analysis"
echo "   - Severity badge, root cause, and fix will be displayed"
echo ""
echo "4. For pattern detection, send 6 rapid crashes:"
echo ""
echo "   for i in {1..6}; do"
echo "     curl -X POST http://localhost:3001/api/report-crash \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"endpoint\":\"/api/login\",\"statusCode\":500,\"errorMessage\":\"Cannot read property id of undefined\"}'"
echo "     sleep 1"
echo "   done"
echo ""
echo "5. Watch for purple 'Pattern Detected' banner to appear!"
echo ""
echo "🛑 To stop all services, run:"
echo "   ./CrashLensAI/STOP_DEMO.sh"
echo ""
echo "Or manually:"
echo "   kill $BACKEND_PID $TRIAGE_PID $PATTERN_PID $RESOLUTION_PID $FRONTEND_PID"
echo ""

# Save PIDs for cleanup script
cat > CrashLensAI/DEMO_PIDS.txt << EOF
BACKEND_PID=$BACKEND_PID
TRIAGE_PID=$TRIAGE_PID
PATTERN_PID=$PATTERN_PID
RESOLUTION_PID=$RESOLUTION_PID
FRONTEND_PID=$FRONTEND_PID
EOF

echo "Press Ctrl+C to stop monitoring, or wait 30 seconds..."
echo ""
echo "Monitoring logs for 30 seconds..."
echo "=================================="

# Monitor for 30 seconds
timeout 30 tail -f /tmp/crashlens-backend.log 2>/dev/null || true

echo ""
echo "Demo script complete! Services are still running."
echo "Open http://localhost:3000 to see the dashboard."
