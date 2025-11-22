# ✅ Complete Demo Guide - Task 3 Live Dashboard

## 🎉 GOOD NEWS: Everything is Working!

The SSE endpoint is working perfectly and agent activity is streaming in real-time. Here's how to see it in action:

---

## 🚀 Quick Demo (2 Minutes)

### Step 1: Open the Dashboard
```bash
open http://localhost:3000
```

The dashboard should show:
- 🤖 Live Agent Activity panel at the top
- Connection status: "Connected" (green dot)
- "Waiting for agent activity..." message (this is normal - waiting for crashes)

### Step 2: Send a Test Crash

Open a new terminal and run:
```bash
curl -X POST http://localhost:3001/api/report-crash \
  -H 'Content-Type: application/json' \
  -d '{
    "endpoint": "/api/users/profile",
    "statusCode": 500,
    "errorMessage": "Cannot read property id of undefined",
    "stackTrace": "at getUserProfile (/app/users.js:45:12)"
  }'
```

### Step 3: Watch the Magic! ✨

Within 1-2 seconds, you should see:

1. **Agent Activity Feed** (top panel):
   - 🔍 "triage-agent: Analyzing incident..."
   - 🔍 "triage-agent: Completed analysis..."
   - 🔧 "resolution-agent: Generating code fix..."
   - 🔧 "resolution-agent: Generated JavaScript fix..."

2. **New Incident Card** appears below with:
   - Color-coded severity badge
   - Root cause explanation
   - Suggested fix
   - "Analyzed by triage-agent" badge
   - "🔧 Fix Available" button (click to see code patch!)

---

## 🎬 Pattern Detection Demo (3 Minutes)

### Send 6 Identical Crashes

Run this command to send 6 rapid crashes:

```bash
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/report-crash \
    -H 'Content-Type: application/json' \
    -d '{"endpoint":"/api/login","statusCode":500,"errorMessage":"Cannot read property id of undefined","stackTrace":"at login (/app/auth.js:45:12)"}'
  sleep 1
done
```

### What You'll See:

1. **Agent Activity Feed** goes crazy with multiple entries
2. After 5+ crashes, a **PURPLE PATTERN ALERT BANNER** appears showing:
   - "Pattern Detected" badge
   - Frequency: 6 occurrences
   - Affected endpoint: /api/login
   - Time range
3. Multiple incident cards appear
4. Pattern Agent activity shows pattern detection

---

## 🧪 Alternative: Test with HTML Page

If you want to see the raw SSE stream:

```bash
open CrashLensAI/test-sse.html
```

This page:
- Connects to the SSE endpoint
- Shows live agent activity
- Has a "Send Test Crash" button
- Displays connection status

---

## 🔍 Verify SSE is Working

### Test 1: Check SSE Endpoint Directly
```bash
curl -N -m 5 http://localhost:3001/api/agent-activity
```

You should see:
```
data: {"agent":"system","action":"Connected to agent activity stream","timestamp":"..."}
```

### Test 2: Check Redis Stream
```bash
redis-cli -u "redis://default:qlzA0MTtqjjTELdel3sZ1aDBYm4hCRSC@redis-11101.c273.us-east-1-2.ec2.cloud.redislabs.com:11101" XRANGE agent-activity - + COUNT 5
```

You should see agent activity events.

---

## 📊 What's Currently Running

All services are already running:
- ✅ Redis (cloud instance)
- ✅ Backend (port 3001)
- ✅ Frontend (port 3000)
- ✅ Triage Agent
- ✅ Pattern Agent
- ✅ Resolution Agent

---

## 🎯 Demo Script for Presentation

### Opening (30 seconds)
"CrashLensAI uses autonomous AI agents to analyze crashes in real-time. Let me show you the live dashboard."

**Action**: Open http://localhost:3000

### Demo 1: Single Crash Analysis (1 minute)
"Watch what happens when a crash occurs..."

**Action**: Send crash via curl (see Step 2 above)

**Narrate**:
- "See the Triage Agent analyzing the incident in real-time"
- "The agent determined this is High severity"
- "It identified the root cause and suggested a fix"
- "Click the Fix Available button to see the actual code patch"

### Demo 2: Pattern Detection (1 minute)
"Now let's see pattern detection in action..."

**Action**: Send 6 rapid crashes (see Pattern Detection Demo above)

**Narrate**:
- "Multiple agents are processing simultaneously"
- "After 5 similar crashes, the Pattern Agent detects a recurring issue"
- "A pattern alert appears showing the frequency and affected endpoints"
- "This helps teams prioritize fixes for widespread issues"

### Demo 3: Code Fix (30 seconds)
**Action**: Click "Fix Available" button on any incident

**Narrate**:
- "The Resolution Agent generated actual code to fix this issue"
- "Developers can copy this and apply it to their codebase"
- "All of this happens autonomously - no human intervention needed"

---

## 🐛 Troubleshooting

### "Waiting for agent activity..." stays forever

**Solution**: Send a crash! The message is normal when no crashes are being processed.

```bash
curl -X POST http://localhost:3001/api/report-crash \
  -H 'Content-Type: application/json' \
  -d '{"endpoint":"/api/test","statusCode":500,"errorMessage":"Test","stackTrace":"test"}'
```

### Connection status shows "Reconnecting..."

**Solution**: Refresh the page. The backend was restarted and the SSE connection needs to reconnect.

```bash
# In browser, press Cmd+R (Mac) or Ctrl+R (Windows/Linux)
```

### No incidents showing

**Solution**: Check if agents are running and send a test crash.

```bash
# Check agent logs
tail -f /tmp/crashlens-triage.log
```

### SSE endpoint returns 404

**Solution**: Backend needs to be restarted to load the new route.

```bash
# Already done - backend is running with the SSE endpoint
```

---

## 📝 Key Features to Highlight

### Real-Time Agent Visibility
- See AI agents working autonomously
- Color-coded by agent type
- Sub-second latency

### Pattern Recognition
- Detects recurring issues automatically
- Visual alerts for high-frequency problems
- Helps prioritize fixes

### Actionable Fixes
- AI-generated code patches
- Copy-to-clipboard functionality
- Language-specific solutions

### Professional UI
- Dark theme
- Smooth animations
- Responsive design
- Real-time updates without refresh

---

## 🎥 Recording Tips

1. **Clear browser cache** before recording
2. **Zoom browser to 125%** for better visibility
3. **Position windows**: Terminal on left, Browser on right
4. **Slow down** - let animations complete
5. **Narrate** what's happening as you demo
6. **Show the curl commands** in terminal
7. **Highlight** the agent activity feed updating

---

## ✅ Success Checklist

Before presenting:
- [ ] Dashboard loads at http://localhost:3000
- [ ] Agent Activity panel shows "Connected"
- [ ] Send test crash - activity appears within 2 seconds
- [ ] Incident card shows AI analysis
- [ ] Send 6 rapid crashes - pattern alert appears
- [ ] Click "Fix Available" - modal shows code patch
- [ ] Copy button works in resolution panel

---

## 🔗 Quick Links

- **Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **SSE Test Page**: file:///.../CrashLensAI/test-sse.html
- **Health Check**: http://localhost:3001/health

---

## 🎉 You're Ready!

Everything is working perfectly. The SSE endpoint is streaming agent activity in real-time, and the dashboard is displaying it beautifully.

**Just open http://localhost:3000 and send a crash to see it in action!**

---

## 📞 Need Help?

If something isn't working:
1. Refresh the browser page (Cmd+R / Ctrl+R)
2. Check backend is running: `curl http://localhost:3001/health`
3. Check SSE endpoint: `curl -N -m 3 http://localhost:3001/api/agent-activity`
4. Send a test crash and watch the activity feed

**The system is fully operational and ready to demo!** 🚀
