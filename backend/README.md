# CrashLensAI Backend

Backend API for CrashLensAI crash reporting system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Sanity:
   - Create a Sanity project at https://www.sanity.io/
   - Deploy the incident schema (see `sanity-schema.js`)
   - Get your project ID, dataset name, and create a write token
   - Update `.env` file with your Sanity credentials:
     ```
     SANITY_PROJECT_ID=your_project_id
     SANITY_DATASET=production
     SANITY_TOKEN=your_write_token
     ```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### POST /api/report-crash

Report a crash and receive analysis. The incident is stored in Sanity.

**Request:**
```bash
curl -X POST http://localhost:3001/api/report-crash \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/api/login",
    "statusCode": 500,
    "errorMessage": "Cannot read property '\''id'\'' of undefined",
    "requestBody": { "email": "test@example.com" }
  }'
```

**Expected Response:**
```json
{
  "endpoint": "/api/login",
  "statusCode": 500,
  "errorMessage": "Cannot read property 'id' of undefined",
  "explanation": "The /api/login endpoint crashed because a variable was undefined when trying to access a property.",
  "suggestedFix": "Add null-checks before accessing object properties.",
  "timestamp": "2025-11-21T12:00:00.000Z"
}
```

### GET /api/incidents

Retrieve the 10 most recent incidents from Sanity.

**Request:**
```bash
curl http://localhost:3001/api/incidents
```

**Optional query parameter:**
- `limit` - Number of incidents to retrieve (default: 10)

**Example with limit:**
```bash
curl http://localhost:3001/api/incidents?limit=5
```

**Expected Response:**
```json
[
  {
    "_id": "abc123",
    "_type": "incident",
    "endpoint": "/api/login",
    "statusCode": 500,
    "errorMessage": "Cannot read property 'id' of undefined",
    "explanation": "The /api/login endpoint crashed because a variable was undefined when trying to access a property.",
    "suggestedFix": "Add null-checks before accessing object properties.",
    "timestamp": "2025-11-21T12:00:00.000Z",
    "requestBody": "{\"email\":\"test@example.com\"}"
  }
]
```

### GET /health

Health check endpoint.

**Request:**
```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ok"
}
```

## Testing

### Manual Testing with Postman

1. **Create an incident:**
   - Method: POST
   - URL: `http://localhost:3001/api/report-crash`
   - Headers: `Content-Type: application/json`
   - Body:
     ```json
     {
       "endpoint": "/api/login",
       "statusCode": 500,
       "errorMessage": "Cannot read property 'id' of undefined",
       "requestBody": { "email": "test@example.com" }
     }
     ```
   - Expected: HTTP 200 with incident JSON

2. **Verify incident in Sanity:**
   - Go to your Sanity Studio
   - Check that the incident document was created

3. **Retrieve incidents:**
   - Method: GET
   - URL: `http://localhost:3001/api/incidents`
   - Expected: HTTP 200 with array of incidents

### Test with different error types:

**Undefined error:**
```bash
curl -X POST http://localhost:3001/api/report-crash \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/api/users",
    "statusCode": 500,
    "errorMessage": "Cannot read property '\''name'\'' of undefined"
  }'
```

**Timeout error:**
```bash
curl -X POST http://localhost:3001/api/report-crash \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/api/data",
    "statusCode": 504,
    "errorMessage": "Request timed out after 30s"
  }'
```

**Connection error:**
```bash
curl -X POST http://localhost:3001/api/report-crash \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/api/external",
    "statusCode": 500,
    "errorMessage": "Connection refused ECONNREFUSED"
  }'
```

**Retrieve all incidents:**
```bash
curl http://localhost:3001/api/incidents
```
