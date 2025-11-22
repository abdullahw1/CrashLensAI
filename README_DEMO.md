# 🚀 CrashLensAI - Live Dashboard Demo

## ✅ System Status: FULLY OPERATIONAL

All services are running and the live dashboard with agent activity feed is working perfectly!

---

## 🎯 Quick Start (30 Seconds)

1. **Open Dashboard**: http://localhost:3000
2. **Send Test Crash**:
   ```bash
   ./CrashLensAI/SEND_TEST_CRASH.sh
   ```
3. **Watch**: Agent activity appears in real-time!

---

## 🎬 Full Demo (3 Minutes)

### 1. Single Crash Demo
```bash
curl -X POST http://localhost:3001/api/report-crash \
  -H 'Content-Type: application/json' \
  -d '{"endpoint":"/api/users/profile","statusCode":500,"errorMessage":"Cannot read property id of undefined"}'
```

**Watch for**:
- 🔍 Triage Agent analyzing
- 🔧 Resolution Agent generating fix
- New incident card with AI analysis
- "Fix Available" button

### 2. Pattern Detection Demo
```bash
./CrashLensAI/SEND_PATTERN_CRASHES.sh
```

**Watch for**:
- Multiple agent activities
- Purple "Pattern Detected" banner
- Frequency count and affected endpoints

---

## 📊 What's Working

✅ **SSE Endpoint** - Real-time streaming at `/api/agent-activity`
✅ **Agent Activity Feed** - Live updates, color-coded agents
✅ **Pattern Alerts** - Animated banners for recurring issues
✅ **Resolution Panel** - Code patches with copy functionality
✅ **AI Analysis** - Severity, root cause, suggested fixes
✅ **All 3 Agents** - Triage, Pattern, Resolution running

---

## 🔧 Services Running

| Service | Status | Port/Location |
|---------|--------|---------------|
| Redis | ✅ Running | Cloud (RedisLabs) |
| Backend | ✅ Running | 3001 |
| Frontend | ✅ Running | 3000 |
| Triage Agent | ✅ Running | Background |
| Pattern Agent | ✅ Running | Background |
| Resolution Agent | ✅ Running | Background |

---

## 🎨 UI Features

### Agent Activity Feed
- Real-time SSE connection
- Color-coded agents (Blue/Purple/Green)
- Connection status indicator
- Auto-scroll to latest
- Keeps last 50 activities

### Pattern Alerts
- Purple animated banners
- Shows frequency and endpoints
- Dismissible with X button
- Auto-refresh every 5 seconds

### Incident Cards
- AI-analyzed severity badges
- Root cause explanations
- Suggested fixes
- Agent attribution
- "Fix Available" button

### Resolution Panel
- Modal with code patches
- Syntax highlighting
- Copy-to-clipboard
- Explanation text
- Agent and timestamp info

---

## 📝 Demo Scripts

All scripts are executable and ready to use:

```bash
# Send single test crash
./CrashLensAI/SEND_TEST_CRASH.sh

# Send 6 crashes for pattern detection
./CrashLensAI/SEND_PATTERN_CRASHES.sh

# Stop all services
./CrashLensAI/STOP_DEMO.sh

# Full demo with service startup
./CrashLensAI/DEMO_SCRIPT.sh
```

---

## 🧪 Test Pages

### Main Dashboard
```
http://localhost:3000
```

### SSE Test Page
```
file:///path/to/CrashLensAI/test-sse.html
```
(Open in browser to see raw SSE stream)

---

## 🐛 Troubleshooting

### Issue: "Waiting for agent activity..."
**Solution**: This is normal! Send a crash to see activity.
```bash
./CrashLensAI/SEND_TEST_CRASH.sh
```

### Issue: Connection shows "Reconnecting..."
**Solution**: Refresh the browser page (Cmd+R / Ctrl+R)

### Issue: No incidents showing
**Solution**: Send a test crash and wait 2-3 seconds for AI analysis

---

## 📚 Documentation

- **COMPLETE_DEMO_GUIDE.md** - Detailed demo instructions
- **TASK_3_TEST_GUIDE.md** - Comprehensive testing guide
- **TASK_3_IMPLEMENTATION_SUMMARY.md** - Technical details
- **QUICK_START_TASK_3.md** - 5-minute setup guide

---

## 🎥 Recording Checklist

Before recording your demo:
- [ ] Open http://localhost:3000
- [ ] Verify "Connected" status in Agent Activity panel
- [ ] Have terminal ready with curl commands
- [ ] Zoom browser to 125% for visibility
- [ ] Clear any old incidents if needed (refresh page)
- [ ] Test one crash to verify everything works

---

## 🎉 Demo Flow

1. **Show Dashboard** (10 sec)
   - Point out Agent Activity panel
   - Show "Connected" status

2. **Send Single Crash** (30 sec)
   - Run curl command
   - Watch agent activity appear
   - Show incident card with AI analysis
   - Click "Fix Available" button

3. **Pattern Detection** (45 sec)
   - Run pattern crash script
   - Watch multiple activities
   - Point out pattern alert banner
   - Highlight frequency count

4. **Wrap Up** (15 sec)
   - "All autonomous - no human intervention"
   - "Real-time analysis and fixes"
   - "Ready for production"

**Total Time**: ~2 minutes

---

## 🚀 You're Ready to Demo!

Everything is working perfectly. The system is:
- ✅ Processing crashes in real-time
- ✅ Streaming agent activity via SSE
- ✅ Detecting patterns automatically
- ✅ Generating code fixes
- ✅ Displaying everything beautifully

**Just open http://localhost:3000 and start sending crashes!**

---

## 📞 Quick Commands

```bash
# Check system health
curl http://localhost:3001/health

# Test SSE endpoint
curl -N -m 3 http://localhost:3001/api/agent-activity

# Send test crash
curl -X POST http://localhost:3001/api/report-crash \
  -H 'Content-Type: application/json' \
  -d '{"endpoint":"/api/test","statusCode":500,"errorMessage":"Test"}'

# Check recent agent activity
redis-cli -u "redis://default:qlzA0MTtqjjTELdel3sZ1aDBYm4hCRSC@redis-11101.c273.us-east-1-2.ec2.cloud.redislabs.com:11101" \
  XREVRANGE agent-activity + - COUNT 5
```

---

**Status**: ✅ READY FOR DEMO
**Last Tested**: November 21, 2025
**All Systems**: OPERATIONAL 🎉
