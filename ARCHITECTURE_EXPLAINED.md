# 🏗️ CrashLensAI Architecture: Redis vs Sanity

## Quick Answer

**Redis** = Real-time messaging & agent coordination (temporary, fast)
**Sanity** = Permanent storage & data retrieval (persistent, queryable)

---

## 📊 Visual Flow

```
Crash Report
    ↓
Backend API
    ↓
┌─────────────────────────────────────────────────┐
│  REDIS (Message Broker)                         │
│  - Streams for agent communication              │
│  - Temporary, in-memory                         │
│  - Fast pub/sub messaging                       │
└─────────────────────────────────────────────────┘
    ↓
    ├─→ Stream: "incidents" ──→ Triage Agent
    │                              ↓
    │                          Analyzes with AI
    │                              ↓
    │                          ┌──────────────────┐
    │                          │  SANITY CMS      │
    │                          │  - Stores result │
    │                          │  - Permanent DB  │
    │                          └──────────────────┘
    │                              ↓
    ├─→ Stream: "incident-analyzed" ──→ Pattern Agent
    │                                      ↓
    │                                  Detects patterns
    │                                      ↓
    │                                  Stores in Sanity
    │                                      ↓
    ├─→ Stream: "incident-analyzed" ──→ Resolution Agent
    │                                      ↓
    │                                  Generates fix
    │                                      ↓
    │                                  Stores in Sanity
    │
    └─→ Stream: "agent-activity" ──→ SSE Endpoint ──→ Dashboard
                                                         ↓
                                                    Live Updates!
```

---

## 🔴 Redis: The Message Highway

### Purpose: Real-time Agent Communication

Redis acts as a **message broker** using Redis Streams to coordinate between agents.

### What Redis Does:

1. **Queues Incoming Crashes**
   - Stream: `incidents`
   - Backend publishes crash reports here
   - Triage Agent subscribes and processes

2. **Notifies Agents of Analyzed Incidents**
   - Stream: `incident-analyzed`
   - Triage Agent publishes after analysis
   - Pattern & Resolution Agents subscribe

3. **Broadcasts Agent Activity**
   - Stream: `agent-activity`
   - All agents publish their actions here
   - SSE endpoint reads and streams to dashboard

4. **Enables Async Processing**
   - Agents work independently
   - No blocking or waiting
   - Scalable architecture

### Redis Streams in Use:

```javascript
// Stream 1: incidents
{
  incidentId: "inc_123",
  endpoint: "/api/users",
  errorMessage: "Cannot read property 'id' of undefined",
  statusCode: 500,
  timestamp: "2025-11-22T00:00:00Z"
}

// Stream 2: incident-analyzed
{
  incidentId: "inc_123",
  severity: "High",
  rootCause: "Null pointer exception",
  suggestedFix: "Add null check",
  sanityId: "abc123"
}

// Stream 3: agent-activity
{
  agent: "triage-agent",
  action: "Analyzing incident inc_123",
  timestamp: "2025-11-22T00:00:01Z"
}
```

### Why Redis?

✅ **Fast** - In-memory, sub-millisecond latency
✅ **Pub/Sub** - Multiple agents can subscribe to same stream
✅ **Ordered** - Messages processed in sequence
✅ **Scalable** - Can handle thousands of messages/second
✅ **Temporary** - Don't need to store forever

---

## 🟢 Sanity: The Permanent Database

### Purpose: Long-term Storage & Querying

Sanity is a **headless CMS** that stores all analyzed data permanently.

### What Sanity Does:

1. **Stores Analyzed Incidents**
   - After Triage Agent analyzes
   - Includes AI-generated insights
   - Queryable and searchable

2. **Stores Detected Patterns**
   - After Pattern Agent finds recurring issues
   - Tracks frequency and affected endpoints
   - Historical pattern data

3. **Stores Code Fixes**
   - After Resolution Agent generates solutions
   - Code patches and explanations
   - Linked to incidents

4. **Provides Data to Dashboard**
   - Frontend queries Sanity for incidents
   - Displays historical data
   - Supports filtering and sorting

### Sanity Schemas:

```typescript
// Schema 1: incident
{
  _id: "abc123",
  incidentId: "inc_123",
  endpoint: "/api/users",
  errorMessage: "Cannot read property 'id' of undefined",
  statusCode: 500,
  severity: "High",
  rootCause: "Null pointer exception",
  suggestedFix: "Add null check before accessing user.id",
  analyzedBy: "triage-agent",
  timestamp: "2025-11-22T00:00:00Z"
}

// Schema 2: pattern
{
  _id: "pattern123",
  patternId: "pat_456",
  patternType: "Null pointer on /api/users",
  frequency: 15,
  affectedEndpoints: ["/api/users", "/api/profile"],
  firstSeen: "2025-11-22T00:00:00Z",
  lastSeen: "2025-11-22T01:00:00Z"
}

// Schema 3: resolution
{
  _id: "res123",
  resolutionId: "res_789",
  incidentId: "inc_123",
  codePatch: "if (user && user.id) { ... }",
  language: "JavaScript",
  explanation: "Added null check",
  generatedBy: "resolution-agent"
}
```

### Why Sanity?

✅ **Persistent** - Data stored permanently
✅ **Queryable** - Rich query language (GROQ)
✅ **Structured** - Schema-based data modeling
✅ **API-first** - Easy to integrate
✅ **Real-time** - Can subscribe to changes
✅ **Studio** - Built-in admin UI for viewing data

---

## 🔄 Complete Data Flow Example

### Step-by-Step: What Happens When a Crash Occurs

```
1. Crash Report Arrives
   POST /api/report-crash
   {
     endpoint: "/api/users",
     statusCode: 500,
     errorMessage: "Cannot read property 'id' of undefined"
   }

2. Backend → Redis
   Publishes to "incidents" stream
   ✅ Redis stores temporarily in stream

3. Triage Agent ← Redis
   Reads from "incidents" stream
   Publishes to "agent-activity": "Analyzing incident..."
   ✅ Redis broadcasts activity

4. Triage Agent → OpenAI
   Sends crash data for AI analysis
   Gets back: severity, root cause, fix

5. Triage Agent → Sanity
   Stores enriched incident with AI analysis
   ✅ Sanity stores permanently

6. Triage Agent → Redis
   Publishes to "incident-analyzed" stream
   Publishes to "agent-activity": "Completed analysis..."
   ✅ Redis notifies other agents

7. Pattern Agent ← Redis
   Reads from "incident-analyzed" stream
   Checks for similar incidents
   If pattern found → Sanity
   ✅ Sanity stores pattern

8. Resolution Agent ← Redis
   Reads from "incident-analyzed" stream
   Generates code fix with OpenAI
   Stores fix → Sanity
   ✅ Sanity stores resolution

9. Dashboard ← Redis (SSE)
   Reads from "agent-activity" stream
   Shows live agent actions
   ✅ Real-time updates

10. Dashboard ← Sanity (REST)
    Queries for incidents, patterns, resolutions
    Displays historical data
    ✅ Persistent data retrieval
```

---

## 🎯 Key Differences

| Feature | Redis | Sanity |
|---------|-------|--------|
| **Purpose** | Message broker | Database |
| **Storage** | Temporary (in-memory) | Permanent (disk) |
| **Speed** | Ultra-fast (< 1ms) | Fast (< 100ms) |
| **Data Type** | Streams, pub/sub | Documents, schemas |
| **Use Case** | Agent coordination | Data persistence |
| **Query** | Stream reading | GROQ queries |
| **Retention** | Short-term | Long-term |
| **Scalability** | Horizontal | Vertical + CDN |

---

## 💡 Why Both?

### Redis Alone Wouldn't Work Because:
- ❌ Data is temporary (lost on restart)
- ❌ No rich querying (can't filter by severity)
- ❌ No historical analysis
- ❌ No admin UI for viewing data

### Sanity Alone Wouldn't Work Because:
- ❌ Not designed for pub/sub messaging
- ❌ Slower for real-time coordination
- ❌ No stream-based processing
- ❌ Agents would need to poll constantly

### Together They're Perfect:
- ✅ Redis handles real-time messaging
- ✅ Sanity handles permanent storage
- ✅ Agents work asynchronously
- ✅ Dashboard gets both live and historical data
- ✅ Scalable and maintainable

---

## 🔍 Real Example from Your System

### When You Send a Crash:

```bash
curl -X POST http://localhost:3001/api/report-crash \
  -d '{"endpoint":"/api/users","statusCode":500,"errorMessage":"Error"}'
```

**Redis Activity** (temporary, fast):
```
1. incidents stream: New crash queued
2. agent-activity stream: "triage-agent: Analyzing..."
3. incident-analyzed stream: Analysis complete
4. agent-activity stream: "triage-agent: Completed..."
5. agent-activity stream: "resolution-agent: Generating fix..."
```

**Sanity Activity** (permanent, queryable):
```
1. incident document created with AI analysis
2. pattern document created (if pattern detected)
3. resolution document created with code fix
```

**Dashboard Sees**:
- Live updates from Redis (SSE)
- Historical data from Sanity (REST API)

---

## 🎨 Analogy

Think of it like a restaurant:

**Redis** = The kitchen order system
- Orders come in fast
- Chefs see them immediately
- Temporary (order tickets thrown away after cooking)
- Real-time coordination

**Sanity** = The accounting system
- Records all orders permanently
- Can query: "How many burgers sold this month?"
- Historical analysis
- Business intelligence

You need **both** for a successful restaurant!

---

## 📝 Summary

### Redis (Message Broker)
- **Role**: Real-time agent communication
- **Streams**: incidents, incident-analyzed, agent-activity
- **Lifespan**: Temporary (minutes to hours)
- **Speed**: Ultra-fast (< 1ms)
- **Used By**: Agents for coordination, SSE for live updates

### Sanity (Database)
- **Role**: Permanent data storage
- **Collections**: incidents, patterns, resolutions
- **Lifespan**: Permanent (forever)
- **Speed**: Fast (< 100ms)
- **Used By**: Dashboard for queries, Agents for storage

### Together
- Redis = "What's happening right now?"
- Sanity = "What happened and what do we know?"
- Result = Real-time autonomous AI system with historical intelligence

---

## 🚀 This Architecture Enables:

1. **Autonomous Agents** - Work independently via Redis streams
2. **Real-time Dashboard** - SSE from Redis for live updates
3. **Historical Analysis** - Query Sanity for trends and patterns
4. **Scalability** - Add more agents without changing code
5. **Reliability** - Data persisted even if Redis restarts
6. **Performance** - Fast messaging + efficient storage

---

**TL;DR**: Redis is the nervous system (fast signals), Sanity is the brain (long-term memory). Both are essential for CrashLensAI to work autonomously and intelligently! 🧠⚡
