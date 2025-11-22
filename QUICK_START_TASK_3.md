# Quick Start Guide - Task 3 Demo

## 🚀 5-Minute Demo Setup

### Step 1: Start All Services (4 terminals)

**Terminal 1 - Redis**
```bash
redis-server
```

**Terminal 2 - Backend**
```bash
cd CrashLensAI/backend
npm start
```

**Terminal 3 - Agents (run all 3)**
```bash
cd CrashLensAI/backend
node agents/triage-agent.js &
node agents/pattern-agent.js &
node agents/resolution-agent.js &
```

**Terminal 4 - Frontend**
```bash
cd CrashLensAI/frontend
npm run dev
```

### Step 2: Open Dashboard
Open browser to: `http://localhost:3000`

You should see:
- 🤖 Live Agent Activity panel at top (with "Connected" status)
- Empty incident list (ready for crashes)

### Step 3: Quick Test - Single Crash

Open Postman and send: **"Report Crash - Undefined Error"**

Watch the dashboard:
1. Agent activity shows: "Triage Agent: Analyzing incident..."
2. New incident appears with:
   - 🔴 Severity badge
   - Root cause explanation
   - Suggested fix
   - "Analyzed by triage-agent" badge

### Step 4: Pattern Detection Demo

In Postman, go to **"Rapid-Fire Pattern Detection"** folder:
1. Select all 6 "Login Crash" requests
2. Right-click → "Run"
3. Or send them manually one after another (quickly!)

Watch the dashboard:
1. Multiple agent activities appear
2. After 5+ crashes, a **purple pattern alert banner** appears
3. Banner shows:
   - "Pattern Detected"
   - Frequency: 6 occurrences
   - Affected: /api/login
   - Time range

### Step 5: View Code Fix

1. Look for an incident with "🔧 Fix Available" button
2. Click the button
3. Modal opens showing:
   - Code patch with syntax highlighting
   - Explanation
   - Copy button (try it!)

---

## 🎯 What to Look For

### Agent Activity Feed
- ✅ Real-time updates (no refresh needed)
- ✅ Color-coded agents:
  - Blue = Triage Agent
  - Purple = Pattern Agent
  - Green = Resolution Agent
- ✅ Auto-scrolls to latest
- ✅ Connection status indicator

### Pattern Alerts
- ✅ Purple banner with animation
- ✅ Shows frequency and endpoints
- ✅ Dismissible with X button

### Incident Cards
- ✅ Color-coded severity badges
- ✅ AI-generated root cause
- ✅ Suggested fixes
- ✅ Agent attribution
- ✅ Fix Available button (when applicable)

### Resolution Panel
- ✅ Code patch display
- ✅ Copy to clipboard
- ✅ Syntax highlighting
- ✅ Explanation text

---

## 🐛 Troubleshooting

**Agent Activity shows "Reconnecting..."**
- Check backend is running on port 3001
- Check Redis is running

**No patterns detected**
- Send at least 5 identical crashes within 60 seconds
- Check pattern-agent is running
- Look at pattern-agent terminal for logs

**No incidents showing**
- Check triage-agent is running
- Check Sanity connection in backend/.env
- Look at backend terminal for errors

**SSE not working**
- Check browser console for errors
- Try: `curl -N http://localhost:3001/api/agent-activity`
- Should see streaming events

---

## 📊 Demo Script for Presentation

**Opening (30 seconds)**
"CrashLensAI uses autonomous AI agents to analyze crashes in real-time. Watch as our agents work independently to triage, detect patterns, and generate fixes."

**Demo 1: Single Crash (1 minute)**
1. Send crash from Postman
2. Point to agent activity feed: "See the Triage Agent analyzing"
3. Point to new incident: "AI determined this is Critical severity"
4. Show root cause and fix: "Agent identified the issue and suggested a fix"

**Demo 2: Pattern Detection (1 minute)**
1. Send 6 rapid crashes
2. Point to activity feed: "Multiple agents processing simultaneously"
3. Point to pattern alert: "Pattern Agent detected recurring issue"
4. Highlight frequency: "6 occurrences in the last minute"

**Demo 3: Code Fix (30 seconds)**
1. Click "Fix Available" button
2. Show code patch: "Resolution Agent generated actual code to fix this"
3. Click copy: "Ready to apply to your codebase"

**Closing (30 seconds)**
"All of this happens autonomously - no human intervention needed. The agents continuously monitor, analyze, and respond to crashes in real-time."

---

## 🎬 Recording Tips

1. **Clear browser cache** before recording
2. **Zoom in** on browser (125-150%) for visibility
3. **Position windows**: Postman on left, Dashboard on right
4. **Keep terminal visible** to show agents running
5. **Slow down** when clicking - let animations complete
6. **Narrate** what's happening as you demo

---

## ✅ Success Checklist

Before demo:
- [ ] Redis running
- [ ] Backend running (port 3001)
- [ ] All 3 agents running
- [ ] Frontend running (port 3000)
- [ ] Postman collection imported
- [ ] Browser open to dashboard
- [ ] Agent activity shows "Connected"

During demo:
- [ ] Single crash shows agent activity
- [ ] Incident appears with AI analysis
- [ ] Rapid-fire triggers pattern detection
- [ ] Pattern alert banner appears
- [ ] Fix Available button works
- [ ] Code patch displays correctly
- [ ] Copy button works

---

## 🔗 Quick Links

- Dashboard: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health
- SSE Stream: http://localhost:3001/api/agent-activity
- Incidents API: http://localhost:3001/api/incidents
- Patterns API: http://localhost:3001/api/patterns

---

## 📞 Need Help?

Check these files:
- `TASK_3_TEST_GUIDE.md` - Detailed testing instructions
- `TASK_3_IMPLEMENTATION_SUMMARY.md` - Technical details
- `DEMO_FEATURES.md` - Feature overview
- Backend logs in terminal for errors
- Browser console for frontend errors

---

**Ready to impress! 🚀**
