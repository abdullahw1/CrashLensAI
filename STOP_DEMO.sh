#!/bin/bash

# Stop all CrashLensAI services

echo "🛑 Stopping CrashLensAI services..."

# Kill by port
echo "Stopping services on ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Kill agents
echo "Stopping agents..."
pkill -f "triage-agent.js" || true
pkill -f "pattern-agent.js" || true
pkill -f "resolution-agent.js" || true

# Kill by PID if file exists
if [ -f "CrashLensAI/DEMO_PIDS.txt" ]; then
    source CrashLensAI/DEMO_PIDS.txt
    kill $BACKEND_PID $TRIAGE_PID $PATTERN_PID $RESOLUTION_PID $FRONTEND_PID 2>/dev/null || true
    rm CrashLensAI/DEMO_PIDS.txt
fi

echo "✓ All services stopped"
echo ""
echo "Note: Redis is still running. To stop Redis:"
echo "  redis-cli shutdown"
