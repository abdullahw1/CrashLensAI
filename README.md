# 🔴 CrashLensAI

**Autonomous AI-Powered Crash Analysis & Resolution System**

CrashLensAI uses three independent AI agents to automatically analyze crashes, detect patterns, and generate code fixes in real-time. Built with OpenAI GPT-4, Redis Streams, and Sanity CMS.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

---

## 🎥 Demo

Watch three AI agents work together autonomously:
1. **Triage Agent** 🔍 - Analyzes crashes and determines severity
2. **Pattern Agent** 📊 - Detects recurring issues across incidents
3. **Resolution Agent** 🔧 - Generates code fixes automatically

**Total time from crash to fix: ~6 seconds**

---

## ✨ Features

### 🤖 Autonomous AI Agents
- **3 independent agents** working asynchronously
- Real-time crash analysis with OpenAI GPT-4
- Automatic severity classification (Critical/High/Medium/Low)
- Root cause identification
- Code fix generation with syntax highlighting

### 📊 Pattern Detection
- Detects recurring issues automatically
- Groups similar crashes by endpoint and error
- Visual alerts for high-frequency problems
- Helps prioritize fixes for widespread issues

### 🎨 Live Dashboard
- Real-time agent activity feed via Server-Sent Events (SSE)
- Color-coded agent actions
- Pattern alert banners
- Incident cards with AI analysis
- Code fix viewer with copy-to-clipboard

### 🏗️ Scalable Architecture
- Redis Streams for agent coordination
- Sanity CMS for persistent storage
- Async processing with consumer groups
- Horizontal scalability

---

## 🏗️ Architecture

```
┌─────────────┐
│   Postman   │ (Simulates crashes)
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────────────┐
│           Backend API (Express)             │
│  - Receives crash reports                   │
│  - Publishes to Redis streams               │
└─────────────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────┐
│         Redis Streams (Message Broker)      │
│  - incidents: Incoming crashes              │
│  - incident-analyzed: Analyzed crashes      │
│  - agent-activity: Live agent actions       │
└─────────────────────────────────────────────┘
       │
       ├──→ 🔍 Triage Agent ──→ Sanity (stores)
       │
       ├──→ 📊 Pattern Agent ──→ Sanity (stores)
       │
       ├──→ 🔧 Resolution Agent ──→ Sanity (stores)
       │
       └──→ SSE Endpoint ──→ Dashboard (live updates)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **Redis** (local or cloud)
- **OpenAI API Key**
- **Sanity Account** (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/crashlens-ai.git
cd crashlens-ai/CrashLensAI
```

### 2. Set Up Backend

```bash
cd backend
npm install
```

Create `.env` file:
```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Redis (use cloud Redis or local)
REDIS_URL=redis://localhost:6379

# Sanity
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_TOKEN=your_sanity_token
SANITY_API_VERSION=2023-05-03

# Server
PORT=3001
```

### 3. Set Up Sanity Studio

```bash
cd ../sanity-studio
npm install
```

Create `.env` file:
```env
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

**Initialize Sanity** (first time only):
```bash
npx sanity init
# Follow prompts to create project
```

**Deploy schemas**:
```bash
npx sanity schema deploy
```

### 4. Set Up Frontend

```bash
cd ../frontend
npm install
```

Update `vite.config.js` proxy if needed (default: `http://localhost:3001`).

### 5. Start Redis

**Option A: Local Redis**
```bash
redis-server
```

**Option B: Cloud Redis** (RedisLabs, Upstash, etc.)
- Update `REDIS_URL` in backend `.env`

### 6. Start All Services

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Triage Agent:**
```bash
cd backend
node agents/triage-agent.js
```

**Terminal 3 - Pattern Agent:**
```bash
cd backend
node agents/pattern-agent.js
```

**Terminal 4 - Resolution Agent:**
```bash
cd backend
node agents/resolution-agent.js
```

**Terminal 5 - Frontend:**
```bash
cd frontend
npm run dev
```

### 7. Open Dashboard

```bash
open http://localhost:3000
```

### 8. Send Test Crash

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

Watch the dashboard for live agent activity! 🎉

---

## 📖 Detailed Installation

For step-by-step installation with screenshots and troubleshooting, see:
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete setup instructions
- [SANITY_QUICK_START.md](SANITY_QUICK_START.md) - Sanity setup guide

---

## 🎬 Demo & Testing

### Quick Demo Scripts

```bash
# Send single test crash
./SEND_TEST_CRASH.sh

# Send 6 crashes for pattern detection
./SEND_PATTERN_CRASHES.sh

# Full demo with service startup
./DEMO_SCRIPT.sh

# Stop all services
./STOP_DEMO.sh
```

### Using Postman

1. Import `CrashLensAI.postman_collection.json`
2. Try "Single Crash Scenarios" folder
3. Use "Rapid-Fire Pattern Detection" folder to trigger pattern alerts

See [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md) for details.

---

## 📚 Documentation

### Getting Started
- [README.md](README.md) - This file
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Installation instructions
- [QUICK_START_TASK_3.md](QUICK_START_TASK_3.md) - 5-minute quick start

### Architecture & Design
- [ARCHITECTURE_EXPLAINED.md](ARCHITECTURE_EXPLAINED.md) - Redis vs Sanity explained
- [DEMO_WALKTHROUGH.md](DEMO_WALKTHROUGH.md) - Complete demo flow with timeline
- [ABOUT_PROJECT.md](ABOUT_PROJECT.md) - Project overview

### Demo & Testing
- [COMPLETE_DEMO_GUIDE.md](COMPLETE_DEMO_GUIDE.md) - Detailed demo instructions
- [README_DEMO.md](README_DEMO.md) - Quick demo reference
- [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md) - Postman collection guide

### Implementation Details
- [TASK_3_IMPLEMENTATION_SUMMARY.md](TASK_3_IMPLEMENTATION_SUMMARY.md) - Technical implementation
- [backend/IMPLEMENTATION_NOTES.md](backend/IMPLEMENTATION_NOTES.md) - Backend notes
- [backend/TEST_AGENT.md](backend/TEST_AGENT.md) - Agent testing guide

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - REST API
- **Redis** - Message broker (Streams)
- **Sanity CMS** - Persistent storage
- **OpenAI GPT-4** - AI analysis

### Frontend
- **React** 18 + **Vite** - UI framework
- **Server-Sent Events (SSE)** - Real-time updates
- **CSS3** - Styling with animations

### Agents
- **3 Independent Node.js processes**
- **Redis Streams** for coordination
- **OpenAI API** for AI capabilities

---

## 📁 Project Structure

```
CrashLensAI/
├── backend/
│   ├── agents/
│   │   ├── triage-agent.js       # 🔍 Analyzes crashes
│   │   ├── pattern-agent.js      # 📊 Detects patterns
│   │   └── resolution-agent.js   # 🔧 Generates fixes
│   ├── routes/
│   │   └── incidents.js          # API routes + SSE endpoint
│   ├── services/
│   │   ├── redis.js              # Redis client & streams
│   │   ├── sanity.js             # Sanity client & queries
│   │   └── openai.js             # OpenAI integration
│   ├── server.js                 # Express server
│   └── .env                      # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentActivity.jsx    # Live agent feed
│   │   │   ├── PatternAlert.jsx     # Pattern banners
│   │   │   ├── ResolutionPanel.jsx  # Code fix modal
│   │   │   └── IncidentCard.jsx     # Incident display
│   │   └── App.jsx               # Main app
│   └── index.html
├── sanity-studio/
│   ├── schemas/
│   │   ├── incident.ts           # Incident schema
│   │   ├── pattern.ts            # Pattern schema
│   │   └── resolution.ts         # Resolution schema
│   └── sanity.config.ts
├── CrashLensAI.postman_collection.json
├── SEND_TEST_CRASH.sh
├── SEND_PATTERN_CRASHES.sh
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
OPENAI_API_KEY=sk-...              # Required
REDIS_URL=redis://localhost:6379   # Required
SANITY_PROJECT_ID=abc123           # Required
SANITY_DATASET=production          # Required
SANITY_TOKEN=sk...                 # Required
SANITY_API_VERSION=2023-05-03      # Required
PORT=3001                          # Optional
```

**Sanity Studio (.env)**
```env
SANITY_STUDIO_PROJECT_ID=abc123    # Required
SANITY_STUDIO_DATASET=production   # Required
```

### Redis Configuration

**Local Redis:**
```bash
redis-server
```

**Cloud Redis (RedisLabs):**
```env
REDIS_URL=redis://default:password@host:port
```

---

## 🧪 Testing

### Manual Testing

```bash
# Test backend health
curl http://localhost:3001/health

# Test SSE endpoint
curl -N http://localhost:3001/api/agent-activity

# Send test crash
curl -X POST http://localhost:3001/api/report-crash \
  -H 'Content-Type: application/json' \
  -d '{"endpoint":"/api/test","statusCode":500,"errorMessage":"Test"}'
```

### Pattern Detection Test

```bash
# Send 6 identical crashes
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/report-crash \
    -H 'Content-Type: application/json' \
    -d '{"endpoint":"/api/login","statusCode":500,"errorMessage":"Cannot read property id of undefined"}'
  sleep 1
done
```

Watch for purple pattern alert banner on dashboard!

---

## 🐛 Troubleshooting

### Dashboard shows "Waiting for agent activity..."

**Solution**: This is normal! Send a crash to see activity.
```bash
./SEND_TEST_CRASH.sh
```

### Connection status shows "Reconnecting..."

**Solution**: Refresh the browser page.
```bash
# In browser: Cmd+R (Mac) or Ctrl+R (Windows/Linux)
```

### Agents not processing crashes

**Solution**: Check if all 3 agents are running.
```bash
ps aux | grep agent
# Should see: triage-agent.js, pattern-agent.js, resolution-agent.js
```

### Redis connection errors

**Solution**: Verify Redis is running.
```bash
redis-cli ping
# Should return: PONG
```

### OpenAI API errors

**Solution**: Check API key and quota.
```bash
# Verify key is set
echo $OPENAI_API_KEY
# Check OpenAI dashboard for usage/limits
```

### Sanity errors

**Solution**: Verify project ID and token.
```bash
cd sanity-studio
npx sanity check
```

---

## 🚀 Deployment

### Backend Deployment (Heroku, Railway, etc.)

1. Set environment variables
2. Deploy backend + agents as separate processes
3. Ensure Redis is accessible
4. Configure CORS for frontend domain

### Frontend Deployment (Vercel, Netlify, etc.)

1. Build frontend: `npm run build`
2. Deploy `dist` folder
3. Update API proxy to production backend URL

### Redis Deployment

**Recommended**: Use managed Redis (RedisLabs, Upstash, AWS ElastiCache)

### Sanity Deployment

Sanity is already cloud-hosted. Just deploy schemas:
```bash
npx sanity schema deploy
```

---

## 📊 Performance

- **Crash to Analysis**: ~3 seconds
- **Analysis to Fix**: ~3 seconds
- **Total Time**: ~6 seconds
- **SSE Latency**: < 100ms
- **Pattern Detection**: Real-time (checks every 10s)

---

## 🔐 Security

- API keys stored in environment variables
- Redis authentication supported
- Sanity token-based auth
- CORS configured for frontend origin
- No sensitive data in logs

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** - GPT-4 for AI analysis
- **Redis** - Streams for agent coordination
- **Sanity** - Headless CMS for storage
- **React** - UI framework
- **Vite** - Build tool

---

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/crashlens-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/crashlens-ai/discussions)

---

## 🎯 Roadmap

- [ ] Add authentication & user management
- [ ] Implement resolution voting/feedback
- [ ] Add more AI models (Claude, Gemini)
- [ ] Create browser extension for crash reporting
- [ ] Add Slack/Discord notifications
- [ ] Implement incident history & analytics
- [ ] Add custom pattern rules
- [ ] Create mobile app

---

## 📈 Stats

- **3 Autonomous AI Agents**
- **Real-time Processing** via Redis Streams
- **Sub-second Latency** for live updates
- **Automatic Pattern Detection** (5+ similar crashes)
- **AI-Generated Code Fixes** with syntax highlighting

---

## 🌟 Star History

If you find CrashLensAI useful, please consider giving it a star! ⭐

---

**Built with ❤️ using OpenAI, Redis, and Sanity**

**CrashLensAI** - Autonomous AI-Powered Crash Analysis & Resolution
