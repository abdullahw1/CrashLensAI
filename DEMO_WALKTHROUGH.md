# 🎬 CrashLensAI Demo Walkthrough

## 🤖 We Have THREE Autonomous AI Agents

Yes, we have **3 separate agents** running as independent processes, each with a specific job:

1. **Triage Agent** 🔍 - First responder, analyzes crashes
2. **Pattern Agent** 📊 - Detective, finds recurring issues
3. **Resolution Agent** 🔧 - Fixer, generates code solutions

---

## 🤖 Meet the Agents

### 1. Triage Agent 🔍

**File**: `backend/agents/triage-agent.js`

**Job**: First responder - analyzes every crash that comes in

**What it does**:
1. Listens to Redis stream: `incidents`
2. Reads crash details (endpoint, error message, stack trace)
3. Sends to OpenAI for AI analysis
4. Determines:
   - **Severity**: Critical, High, Medium, or Low
   - **Root Cause**: What actually went wrong
   - **Suggested Fix**: How to fix it
5. Stores enriched incident in Sanity
6. Publishes to Redis stream: `incident-analyzed`
7. Broadcasts activity: "Analyzing incident..." and "Completed analysis..."

**Example Activity**:
```
🔍 triage-agent: Analyzing incident inc_123
🔍 triage-agent: Completed analysis of inc_123 - High severity
```

**AI Prompt** (simplified):
```
Analyze this crash:
- Endpoint: /api/users/profile
- Error: Cannot read property 'id' of undefined
- Stack trace: at getUserProfile (/app/users.js:45:12)

Determine:
1. Severity (Critical/High/Medium/Low)
2. Root cause
3. Suggested fix
```

---

### 2. Pattern Agent 📊

**File**: `backend/agents/pattern-agent.js`

**Job**: Detective - finds patterns in crashes

**What it does**:
1. Listens to Redis stream: `incident-analyzed`
2. Maintains a sliding window of recent incidents (last 60 seconds)
3. Groups similar incidents by:
   - Same endpoint
   - Same error message
   - Same stack trace location
4. When 5+ similar crashes occur → Pattern detected!
5. Sends pattern to OpenAI for analysis
6. Stores pattern in Sanity
7. Broadcasts activity: "Detected pattern with X similar incidents"

**Example Activity**:
```
📊 pattern-agent: Detected pattern with 6 similar incidents
📊 pattern-agent: Pattern detected: Null pointer on /api/login (6 occurrences)
```

**Pattern Detection Logic**:
```javascript
// Checks every 10 seconds
// Groups incidents by endpoint + error
// If group.length >= 5 → PATTERN FOUND!
```

**AI Prompt** (simplified):
```
Analyze this pattern:
- 6 crashes on /api/login
- All with error: "Cannot read property 'id' of undefined"
- Occurred within 60 seconds

Describe:
1. Pattern type
2. Likely root cause
3. Impact assessment
```

---

### 3. Resolution Agent 🔧

**File**: `backend/agents/resolution-agent.js`

**Job**: Fixer - generates code solutions

**What it does**:
1. Listens to Redis stream: `incident-analyzed`
2. Checks if incident is fixable (Critical or High severity)
3. Sends incident details to OpenAI
4. Generates:
   - **Code patch**: Actual code to fix the issue
   - **Language**: JavaScript, Python, etc.
   - **Explanation**: Why this fix works
5. Stores resolution in Sanity
6. Broadcasts activity: "Generating code fix..." and "Generated fix"

**Example Activity**:
```
🔧 resolution-agent: Generating code fix for inc_123
🔧 resolution-agent: Generated JavaScript fix for inc_123
```

**AI Prompt** (simplified):
```
Generate a code fix for:
- Error: Cannot read property 'id' of undefined
- Location: getUserProfile (/app/users.js:45:12)
- Root cause: Null pointer exception

Provide:
1. Code patch with fix
2. Language
3. Explanation
```

**Example Generated Fix**:
```javascript
// Before (broken)
function getUserProfile(user) {
  return user.id;  // ❌ Crashes if user is null
}

// After (fixed)
function getUserProfile(user) {
  if (!user || !user.id) {
    throw new Error('User object is null or undefined');
  }
  return user.id;  // ✅ Safe
}
```

---

## 🎬 Demo Flow: What Happens When You Send a Crash

### Setup: All 3 Agents Running Independently

```
Terminal 1: node agents/triage-agent.js     (🔍 Listening...)
Terminal 2: node agents/pattern-agent.js    (📊 Listening...)
Terminal 3: node agents/resolution-agent.js (🔧 Listening...)
```

---

### Step 1: You Send a Crash via Postman

**Postman's Role**: Simulates a real application reporting a crash

```
POST http://localhost:3001/api/report-crash
{
  "endpoint": "/api/users/profile",
  "statusCode": 500,
  "errorMessage": "Cannot read property 'id' of undefined",
  "stackTrace": "at getUserProfile (/app/users.js:45:12)"
}
```

**What Postman does**:
- Acts as a "fake application" reporting crashes
- Sends HTTP POST request to backend
- In production, this would be your actual app

---

### Step 2: Backend Receives Crash

**Backend's Role**: Entry point, queues crash for processing

```javascript
// backend/routes/incidents.js
router.post('/report-crash', async (req, res) => {
  // 1. Generate incident ID
  const incidentId = `inc_${crypto.randomBytes(6).toString('hex')}`;
  
  // 2. Publish to Redis "incidents" stream
  await publishIncident({
    incidentId,
    endpoint: req.body.endpoint,
    statusCode: req.body.statusCode,
    errorMessage: req.body.errorMessage,
    stackTrace: req.body.stackTrace,
    timestamp: new Date().toISOString()
  });
  
  // 3. Return immediately (async processing)
  res.status(202).json({
    status: 'queued',
    incidentId: incidentId
  });
});
```

**Redis Activity**:
```
Stream: incidents
Message: {
  incidentId: "inc_abc123",
  endpoint: "/api/users/profile",
  statusCode: 500,
  errorMessage: "Cannot read property 'id' of undefined",
  stackTrace: "at getUserProfile (/app/users.js:45:12)",
  timestamp: "2025-11-22T00:00:00Z"
}
```

---

### Step 3: Triage Agent Processes (2-3 seconds)

**Triage Agent wakes up**:

```
🔍 Triage Agent: New message in "incidents" stream!
🔍 Triage Agent: Analyzing incident inc_abc123
```

**Redis Activity**:
```
Stream: agent-activity
Message: {
  agent: "triage-agent",
  action: "Analyzing incident inc_abc123",
  timestamp: "2025-11-22T00:00:01Z"
}
```

**Dashboard sees**: "🔍 triage-agent: Analyzing incident inc_abc123"

**Triage Agent → OpenAI**:
```
Analyzing with GPT-4...
Response:
{
  severity: "High",
  rootCause: "Null pointer exception - user object is undefined",
  suggestedFix: "Add null check before accessing user.id"
}
```

**Triage Agent → Sanity**:
```
Storing incident in Sanity...
Document created: {
  _id: "sanity_xyz789",
  incidentId: "inc_abc123",
  endpoint: "/api/users/profile",
  errorMessage: "Cannot read property 'id' of undefined",
  severity: "High",
  rootCause: "Null pointer exception - user object is undefined",
  suggestedFix: "Add null check before accessing user.id",
  analyzedBy: "triage-agent",
  timestamp: "2025-11-22T00:00:00Z"
}
```

**Triage Agent → Redis**:
```
Stream: incident-analyzed
Message: {
  incidentId: "inc_abc123",
  severity: "High",
  rootCause: "Null pointer exception",
  suggestedFix: "Add null check",
  sanityId: "sanity_xyz789"
}

Stream: agent-activity
Message: {
  agent: "triage-agent",
  action: "Completed analysis of inc_abc123 - High severity",
  timestamp: "2025-11-22T00:00:03Z"
}
```

**Dashboard sees**: "🔍 triage-agent: Completed analysis of inc_abc123 - High severity"

---

### Step 4: Pattern Agent Checks (1 second)

**Pattern Agent wakes up**:

```
📊 Pattern Agent: New message in "incident-analyzed" stream!
📊 Pattern Agent: Adding incident to sliding window
📊 Pattern Agent: Checking for patterns...
```

**Pattern Agent logic**:
```javascript
// Adds incident to in-memory window
incidentWindow.push({
  endpoint: "/api/users/profile",
  errorMessage: "Cannot read property 'id' of undefined",
  receivedAt: Date.now()
});

// Groups similar incidents
const groups = groupByEndpointAndError(incidentWindow);

// Check if any group has 5+ incidents
if (group.length >= 5) {
  // PATTERN DETECTED!
}
```

**If pattern found** (after 5+ similar crashes):

**Pattern Agent → OpenAI**:
```
Analyzing pattern...
Response: {
  patternType: "Repeated null pointer on /api/users/profile",
  description: "Multiple crashes due to undefined user object"
}
```

**Pattern Agent → Sanity**:
```
Storing pattern in Sanity...
Document created: {
  _id: "pattern_123",
  patternId: "pat_456",
  patternType: "Repeated null pointer on /api/users/profile",
  frequency: 6,
  affectedEndpoints: ["/api/users/profile"],
  firstSeen: "2025-11-22T00:00:00Z",
  lastSeen: "2025-11-22T00:01:00Z"
}
```

**Pattern Agent → Redis**:
```
Stream: agent-activity
Message: {
  agent: "pattern-agent",
  action: "Pattern detected: Repeated null pointer (6 occurrences)",
  timestamp: "2025-11-22T00:00:04Z"
}
```

**Dashboard sees**: 
- "📊 pattern-agent: Pattern detected..."
- Purple pattern alert banner appears!

---

### Step 5: Resolution Agent Generates Fix (3-4 seconds)

**Resolution Agent wakes up**:

```
🔧 Resolution Agent: New message in "incident-analyzed" stream!
🔧 Resolution Agent: Severity is High - generating fix
```

**Redis Activity**:
```
Stream: agent-activity
Message: {
  agent: "resolution-agent",
  action: "Generating code fix for inc_abc123",
  timestamp: "2025-11-22T00:00:04Z"
}
```

**Dashboard sees**: "🔧 resolution-agent: Generating code fix for inc_abc123"

**Resolution Agent → OpenAI**:
```
Generating code fix...
Response: {
  codePatch: "if (!user || !user.id) {\n  throw new Error('User is undefined');\n}\nreturn user.id;",
  language: "JavaScript",
  explanation: "Added null check to prevent accessing properties on undefined object"
}
```

**Resolution Agent → Sanity**:
```
Storing resolution in Sanity...
Document created: {
  _id: "res_789",
  resolutionId: "res_xyz",
  incidentId: "inc_abc123",
  codePatch: "if (!user || !user.id) { ... }",
  language: "JavaScript",
  explanation: "Added null check",
  generatedBy: "resolution-agent",
  timestamp: "2025-11-22T00:00:07Z"
}
```

**Resolution Agent → Redis**:
```
Stream: agent-activity
Message: {
  agent: "resolution-agent",
  action: "Generated JavaScript fix for inc_abc123",
  timestamp: "2025-11-22T00:00:07Z"
}
```

**Dashboard sees**: 
- "🔧 resolution-agent: Generated JavaScript fix for inc_abc123"
- "Fix Available" button appears on incident card!

---

### Step 6: Dashboard Updates

**Dashboard queries Sanity**:
```
GET /api/incidents
Response: [
  {
    incidentId: "inc_abc123",
    endpoint: "/api/users/profile",
    errorMessage: "Cannot read property 'id' of undefined",
    severity: "High",
    rootCause: "Null pointer exception",
    suggestedFix: "Add null check",
    analyzedBy: "triage-agent",
    timestamp: "2025-11-22T00:00:00Z"
  }
]
```

**Dashboard shows**:
- ✅ Incident card with severity badge
- ✅ Root cause explanation
- ✅ Suggested fix
- ✅ "Analyzed by triage-agent" badge
- ✅ "Fix Available" button

**User clicks "Fix Available"**:
- Modal opens with code patch
- Shows JavaScript code with syntax highlighting
- Copy button to copy the fix

---

## 📊 Complete Timeline

```
Time    | Component           | Action
--------|---------------------|------------------------------------------
0.0s    | Postman            | Sends crash report
0.1s    | Backend            | Publishes to Redis "incidents" stream
0.2s    | Triage Agent       | Reads from Redis, starts analyzing
0.2s    | Redis              | Broadcasts "Analyzing..." to agent-activity
0.2s    | Dashboard (SSE)    | Shows "🔍 Analyzing..."
0.5s    | Triage Agent       | Calls OpenAI for analysis
2.5s    | OpenAI             | Returns severity, root cause, fix
2.6s    | Triage Agent       | Stores in Sanity
2.7s    | Triage Agent       | Publishes to "incident-analyzed" stream
2.7s    | Redis              | Broadcasts "Completed..." to agent-activity
2.7s    | Dashboard (SSE)    | Shows "🔍 Completed analysis..."
2.8s    | Pattern Agent      | Reads from "incident-analyzed"
2.8s    | Pattern Agent      | Checks for patterns (none yet)
2.8s    | Resolution Agent   | Reads from "incident-analyzed"
2.8s    | Resolution Agent   | Severity is High → generate fix
2.8s    | Redis              | Broadcasts "Generating fix..." to agent-activity
2.8s    | Dashboard (SSE)    | Shows "🔧 Generating fix..."
3.0s    | Resolution Agent   | Calls OpenAI for code fix
6.0s    | OpenAI             | Returns code patch
6.1s    | Resolution Agent   | Stores in Sanity
6.1s    | Redis              | Broadcasts "Generated fix..." to agent-activity
6.1s    | Dashboard (SSE)    | Shows "🔧 Generated JavaScript fix..."
6.2s    | Dashboard          | Queries Sanity for incidents
6.3s    | Dashboard          | Displays incident card with "Fix Available"
```

**Total time**: ~6 seconds from crash to fix!

---

## 🎯 Role Summary During Demo

### Postman 📮
- **Role**: Crash simulator
- **What it does**: Sends HTTP POST requests to simulate app crashes
- **Why we use it**: Easy to send multiple crashes quickly for pattern detection
- **In production**: Your actual application would send these requests

### Redis ⚡
- **Role**: Message broker & real-time coordinator
- **What it does**: 
  - Queues crashes for processing
  - Notifies agents when work is ready
  - Broadcasts agent activity for live dashboard
- **Streams used**:
  - `incidents` - Incoming crashes
  - `incident-analyzed` - Analyzed crashes
  - `agent-activity` - Live agent actions
- **Why we use it**: Fast, async, enables autonomous agent coordination

### Sanity 💾
- **Role**: Permanent database
- **What it does**:
  - Stores analyzed incidents
  - Stores detected patterns
  - Stores code fixes
  - Provides data to dashboard
- **Why we use it**: Persistent storage, queryable, has admin UI

### 3 Agents 🤖
- **Triage Agent**: Analyzes crashes (severity, root cause, fix)
- **Pattern Agent**: Detects recurring issues
- **Resolution Agent**: Generates code solutions
- **Why 3 separate agents**: 
  - Each has a specific job
  - Work independently and asynchronously
  - Can scale separately
  - Demonstrates autonomous AI system

---

## 🎬 Demo Script with All Components

### Demo 1: Single Crash

**You say**: "Let me show you what happens when a crash occurs..."

**You do**: Send crash via Postman

**What audience sees**:
1. Postman sends request → Gets 202 Accepted
2. Dashboard agent activity: "🔍 triage-agent: Analyzing..."
3. Dashboard agent activity: "🔍 triage-agent: Completed analysis - High severity"
4. Dashboard agent activity: "🔧 resolution-agent: Generating fix..."
5. Dashboard agent activity: "🔧 resolution-agent: Generated JavaScript fix"
6. New incident card appears with AI analysis
7. "Fix Available" button appears

**You say**: "Notice how three different AI agents worked together autonomously - the Triage Agent analyzed it, and the Resolution Agent generated a fix. All in about 6 seconds."

### Demo 2: Pattern Detection

**You say**: "Now let's see pattern detection. I'll send 6 identical crashes rapidly..."

**You do**: Run rapid-fire script or Postman Runner

**What audience sees**:
1. Multiple "🔍 Analyzing..." messages
2. Multiple "🔧 Generating fix..." messages
3. After 5th crash: "📊 pattern-agent: Detected pattern..."
4. Purple pattern alert banner appears
5. Shows "6 occurrences on /api/login"

**You say**: "The Pattern Agent detected that we have a recurring issue. This helps teams prioritize fixes for widespread problems."

### Demo 3: Code Fix

**You say**: "Let's look at the actual fix the AI generated..."

**You do**: Click "Fix Available" button

**What audience sees**:
1. Modal opens with code patch
2. Syntax-highlighted JavaScript code
3. Explanation of the fix
4. Copy button

**You say**: "The Resolution Agent generated actual code that developers can copy and apply. This is all autonomous - no human wrote this fix."

---

## 🎉 Key Takeaways

1. **3 Autonomous Agents** working independently
2. **Redis** coordinates agents in real-time
3. **Sanity** stores everything permanently
4. **Postman** simulates crashes for demo
5. **Dashboard** shows live activity via SSE
6. **Total time**: 6 seconds from crash to fix
7. **Zero human intervention** - fully autonomous

---

**This is the power of autonomous AI agents! 🚀**
