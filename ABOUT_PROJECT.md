# CrashLensAI: AI-Powered Crash Analysis & Auto-Resolution

## 🎯 Inspiration

Every developer has been there—waking up to a flood of error alerts, spending hours digging through logs, and manually triaging which crashes need immediate attention. We've experienced the pain of production incidents where critical bugs get buried under hundreds of minor errors, and teams waste valuable time on repetitive crash analysis.

**What if AI agents could do the heavy lifting?**

CrashLensAI was born from this frustration. We envisioned a system where autonomous AI agents work 24/7 to analyze crashes, detect patterns, and even auto-resolve common issues—transforming reactive incident management into a proactive, self-healing system.

## 🏗️ What We Built

CrashLensAI is an **agentic AI platform** that revolutionizes how teams handle API crashes:

### Core Features

1. **Intelligent Triage Agent**
   - Consumes crash reports from Redis streams in real-time
   - Uses OpenAI GPT-4 to analyze errors, stack traces, and context
   - Determines severity levels (Critical/High/Medium/Low)
   - Identifies root causes and suggests specific fixes
   - Stores enriched incidents in Sanity CMS

2. **Pattern Detection Agent** *(Planned)*
   - Detects recurring crash patterns across incidents
   - Groups similar errors for batch resolution
   - Identifies systemic issues vs. one-off bugs

3. **Auto-Resolution Agent** *(Planned)*
   - Automatically applies fixes for known issues
   - Generates pull requests with suggested code changes
   - Learns from successful resolutions

4. **Real-Time Dashboard**
   - Live incident feed with AI-generated insights
   - Severity-based filtering and prioritization
   - Beautiful, responsive UI built with React

### Architecture

```
┌─────────────┐
│   Client    │ POST /api/report-crash
│   (Postman) │────────────────────────┐
└─────────────┘                        │
                                       ▼
                              ┌─────────────────┐
                              │  Express API    │
                              │  (Node.js)      │
                              └────────┬────────┘
                                       │ Publish
                                       ▼
                              ┌─────────────────┐
                              │  Redis Streams  │
                              │  (Cloud)        │
                              └────────┬────────┘
                                       │ Subscribe
                                       ▼
                              ┌─────────────────┐
                              │  Triage Agent   │
                              │  (Autonomous)   │
                              └────────┬────────┘
                                       │ Analyze
                                       ▼
                              ┌─────────────────┐
                              │  OpenAI GPT-4   │
                              │  (AI Analysis)  │
                              └────────┬────────┘
                                       │ Store
                                       ▼
                              ┌─────────────────┐
                              │  Sanity CMS     │
                              │  (Database)     │
                              └─────────────────┘
```

## 🛠️ How We Built It

### Tech Stack

**Backend:**
- **Node.js + Express** - REST API server
- **Redis Streams** - Event-driven architecture for agent communication
- **OpenAI API** - GPT-4o-mini for intelligent crash analysis
- **Sanity CMS** - Structured content storage with real-time capabilities

**Frontend:**
- **React** - Component-based UI
- **Vite** - Fast build tooling
- **CSS3** - Custom styling with animations

**Infrastructure:**
- **Redis Cloud** - Managed Redis instance for production reliability
- **Sanity Studio** - Content management interface

### Development Process

1. **Requirements & Design** - Created comprehensive spec documents following EARS (Easy Approach to Requirements Syntax) and INCOSE quality standards

2. **Agentic Architecture** - Designed event-driven system using Redis Streams for agent communication, enabling:
   - Asynchronous processing
   - Scalable agent deployment
   - Fault tolerance with consumer groups

3. **AI Integration** - Implemented OpenAI analysis with:
   - Structured JSON responses
   - Severity classification
   - Root cause analysis
   - Actionable fix suggestions
   - Fallback to rule-based analysis

4. **Real-Time Processing** - Built autonomous triage agent that:
   - Subscribes to incident streams
   - Processes crashes continuously
   - Publishes analysis results
   - Tracks agent activity

### Key Implementation Details

**Redis Streams for Agent Communication:**
```javascript
// Publish incident to stream
await publishIncident({
  incidentId: 'inc_abc123',
  endpoint: '/api/login',
  statusCode: 500,
  errorMessage: 'Cannot read property "id" of undefined'
});

// Agent subscribes with consumer group
await subscribeToStream(
  'incidents',
  processIncident,
  'triage-group',
  'triage-agent-1'
);
```

**OpenAI Analysis:**
```javascript
const analysis = await analyzeIncident(incident);
// Returns: { severity, rootCause, suggestedFix }
```

**Async API Response:**
```javascript
// Return 202 Accepted immediately
res.status(202).json({
  status: 'queued',
  incidentId: 'inc_abc123',
  message: 'Incident queued for agent processing'
});
```

## 📚 What We Learned

### Technical Insights

1. **Event-Driven Architecture is Powerful**
   - Redis Streams provide reliable message delivery
   - Consumer groups enable horizontal scaling
   - Decoupled agents can be deployed independently

2. **AI Agents Need Structure**
   - Prompt engineering is critical for consistent results
   - JSON schema validation prevents parsing errors
   - Fallback strategies ensure system reliability

3. **Async Processing Improves UX**
   - 202 Accepted responses keep APIs fast
   - Background agents handle heavy lifting
   - Users get immediate feedback

4. **Content Management Matters**
   - Sanity CMS provides flexible schema evolution
   - Real-time queries enable live dashboards
   - Structured content simplifies agent logic

### Challenges & Solutions

**Challenge 1: OpenAI Response Consistency**
- *Problem:* GPT-4 sometimes returned extra text with JSON
- *Solution:* Regex extraction + validation + fallback analysis

**Challenge 2: Redis Connection Management**
- *Problem:* Connection errors caused agent crashes
- *Solution:* Automatic reconnection + graceful error handling

**Challenge 3: Agent Coordination**
- *Problem:* Multiple agents processing same incident
- *Solution:* Redis consumer groups with message acknowledgment

**Challenge 4: Real-Time Updates**
- *Problem:* Frontend needed live incident updates
- *Solution:* Polling API + Sanity real-time subscriptions (future)

## 🎓 Key Takeaways

1. **Agentic AI is the Future** - Autonomous agents that continuously process, analyze, and act on data will transform how we build systems

2. **Event Streams Enable Scale** - Redis Streams provide the backbone for reliable, scalable agent communication

3. **AI + Human Collaboration** - AI handles repetitive analysis; humans focus on complex decisions

4. **Structured Data Wins** - Sanity CMS made schema evolution painless and enabled rich queries

## 🏆 Sponsors Used

### OpenAI
- **GPT-4o-mini** for intelligent crash analysis
- Structured JSON responses for severity, root cause, and fix suggestions
- Fallback to rule-based analysis ensures reliability

### Sanity
- **Sanity CMS** for structured incident storage
- Real-time content API for live dashboards
- Flexible schema evolution as features grow
- Sanity Studio for content management

### Redis (Redis Cloud)
- **Redis Streams** for event-driven agent architecture
- Consumer groups for scalable processing
- Cloud-hosted for production reliability
- Sub-100ms message delivery

## 🚀 Future Enhancements

1. **Pattern Detection Agent** - Identify recurring crashes and systemic issues
2. **Auto-Resolution Agent** - Generate and apply fixes automatically
3. **GitHub Integration** - Create PRs with suggested code changes
4. **Slack Notifications** - Alert teams on critical incidents
5. **ML-Based Severity Prediction** - Train custom models on historical data
6. **Multi-Tenant Support** - SaaS platform for multiple teams

## 🎬 Demo

Check out our live demo showing:
- Real-time crash reporting via Postman
- Autonomous agent processing with OpenAI analysis
- Live dashboard updates with AI-generated insights
- End-to-end incident lifecycle in under 5 seconds

---

**Built with ❤️ for the hackathon**

*Transforming crashes into insights, one AI agent at a time.*
