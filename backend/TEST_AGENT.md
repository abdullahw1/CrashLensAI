# Testing the Triage Agent

## Prerequisites

1. **Redis** must be running locally:
   ```bash
   # Install Redis (macOS)
   brew install redis
   
   # Start Redis
   redis-server
   ```

2. **OpenAI API Key** must be configured in `.env`:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

3. **Sanity** must be configured (already set up in `.env`)

## Running the Test

### Step 1: Start the Backend API
```bash
cd CrashLensAI/backend
npm start
```

The backend should start on http://localhost:3001

### Step 2: Start the Triage Agent (in a new terminal)
```bash
cd CrashLensAI/backend
node agents/triage-agent.js
```

You should see:
```
Starting Triage Agent...
Triage Agent: Connecting to Redis and subscribing to "incidents" stream...
Redis client connected
Redis connection established
Created consumer group: triage-group
Subscribing to stream "incidents" as triage-group/triage-agent-1
```

### Step 3: Send a Test Crash from Postman

Use the existing Postman collection or send a POST request:

**Endpoint:** `POST http://localhost:3001/api/report-crash`

**Body (JSON):**
```json
{
  "endpoint": "/api/login",
  "statusCode": 500,
  "errorMessage": "Cannot read property 'id' of undefined",
  "stackTrace": "at login (/app/auth.js:45:12)\n    at processRequest (/app/server.js:120:5)",
  "requestBody": {
    "email": "test@example.com",
    "password": "secret123"
  }
}
```

**Expected Response (202 Accepted):**
```json
{
  "status": "queued",
  "incidentId": "inc_a1b2c3d4e5f6",
  "message": "Incident queued for agent processing"
}
```

### Step 4: Watch the Agent Logs

In the terminal running the triage agent, you should see:
```
Triage Agent: Analyzing incident inc_a1b2c3d4e5f6
OpenAI analysis complete: High severity
Triage Agent: Analysis complete for inc_a1b2c3d4e5f6 - Severity: High
Triage Agent: Stored incident inc_a1b2c3d4e5f6 in Sanity with ID: <sanity-doc-id>
Triage Agent: Published incident-analyzed event for inc_a1b2c3d4e5f6
```

### Step 5: Verify in Sanity

1. Go to your Sanity Studio (http://localhost:3333 or your deployed studio)
2. Navigate to "Incidents"
3. You should see the incident with:
   - Incident ID: `inc_a1b2c3d4e5f6`
   - Severity: `High` (or other AI-determined severity)
   - Root Cause: AI-generated explanation
   - Suggested Fix: AI-generated fix
   - Analyzed By: `triage-agent`

## Troubleshooting

### Redis Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution:** Make sure Redis is running with `redis-server`

### OpenAI API Error
```
Error: Invalid API key
```
**Solution:** Update `OPENAI_API_KEY` in `.env` with a valid key from https://platform.openai.com/api-keys

### Agent Not Processing
**Solution:** 
1. Check that Redis is running
2. Verify the backend published the incident (check backend logs)
3. Restart the agent

### Fallback Mode
If you see "Incident queued for agent processing (fallback mode)", it means Redis is unavailable and the system fell back to direct Sanity storage without agent processing.

## Testing Multiple Incidents

Send multiple crash reports to test the agent's continuous processing:

```bash
# Send 5 similar crashes for pattern detection (Task 2)
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/report-crash \
    -H "Content-Type: application/json" \
    -d '{
      "endpoint": "/api/login",
      "statusCode": 500,
      "errorMessage": "Cannot read property \"id\" of undefined",
      "stackTrace": "at login (/app/auth.js:45:12)"
    }'
  sleep 1
done
```

## Success Criteria

✅ Backend returns 202 with incident ID  
✅ Agent logs show "Analyzing incident..."  
✅ Agent logs show OpenAI analysis complete  
✅ Incident appears in Sanity with AI analysis  
✅ Agent publishes to "incident-analyzed" stream  
✅ Agent publishes activity to "agent-activity" stream  
