# Postman Testing Guide for CrashLensAI

## Import the Collection

1. Open Postman
2. Click "Import" button (top left)
3. Select the file: `CrashLensAI.postman_collection.json`
4. The collection will appear in your Collections sidebar

## Available Requests

### 1. **Report Crash - Undefined Error**
- **Method**: POST
- **URL**: `http://localhost:3001/api/report-crash`
- **Purpose**: Test crash reporting with an undefined property error
- **Tests Included**:
  - ✅ Status code is 200
  - ✅ Response has explanation field
  - ✅ Response has suggestedFix field
  - ✅ Response has timestamp field

### 2. **Report Crash - Timeout Error**
- **Method**: POST
- **URL**: `http://localhost:3001/api/report-crash`
- **Purpose**: Test crash reporting with a timeout error
- **Tests Included**: Same as above

### 3. **Report Crash - Connection Error**
- **Method**: POST
- **URL**: `http://localhost:3001/api/report-crash`
- **Purpose**: Test crash reporting with a database connection error
- **Tests Included**: Same as above

### 4. **Get All Incidents**
- **Method**: GET
- **URL**: `http://localhost:3001/api/incidents`
- **Purpose**: Retrieve all incidents from Sanity (10 most recent)

### 5. **Get Incidents with Limit**
- **Method**: GET
- **URL**: `http://localhost:3001/api/incidents?limit=5`
- **Purpose**: Retrieve a limited number of incidents

### 6. **Health Check**
- **Method**: GET
- **URL**: `http://localhost:3001/health`
- **Purpose**: Verify the backend server is running

## End-to-End Testing Flow

Follow these steps to verify the complete system:

### Step 1: Check Backend Health
1. Run the **Health Check** request
2. Expected response: `{"status": "ok"}`

### Step 2: Report a Crash
1. Run **Report Crash - Undefined Error**
2. Check the "Test Results" tab - all tests should pass ✅
3. Note the response includes:
   - `endpoint`
   - `statusCode`
   - `errorMessage`
   - `explanation` (AI-generated)
   - `suggestedFix` (AI-generated)
   - `timestamp`

### Step 3: Verify in Sanity
1. The incident is automatically stored in Sanity
2. You can verify this by running **Get All Incidents**
3. The incident you just created should appear in the response

### Step 4: Check Dashboard
1. Open http://localhost:3000 in your browser
2. The incident should appear on the dashboard
3. It will be marked as "🔥 Latest"
4. The dashboard auto-refreshes every 3 seconds

### Step 5: Test Multiple Incidents
1. Run **Report Crash - Timeout Error**
2. Run **Report Crash - Connection Error**
3. Refresh the dashboard or wait 3 seconds
4. All incidents should appear, with the most recent at the top

## Automated Testing

Each POST request includes automated tests that verify:
- ✅ HTTP 200 status code
- ✅ `explanation` field exists
- ✅ `suggestedFix` field exists
- ✅ `timestamp` field exists

To run all tests:
1. Select the collection in Postman
2. Click "Run" button
3. Select all requests
4. Click "Run CrashLensAI API"
5. View test results

## Custom Crash Reports

You can create your own crash reports by modifying the request body:

```json
{
  "endpoint": "/your/api/endpoint",
  "statusCode": 500,
  "errorMessage": "Your error message here",
  "requestBody": {
    "optional": "request data"
  }
}
```

The AI will analyze the error message and generate:
- A plain-English explanation
- A suggested fix based on error patterns

## Troubleshooting

### Backend Not Responding
- Make sure the backend is running: `cd backend && npm start`
- Check it's on port 3001: http://localhost:3001/health

### Incidents Not Appearing in Dashboard
- Verify the frontend is running: `cd frontend && npm run dev`
- Check it's on port 3000: http://localhost:3000
- The dashboard auto-refreshes every 3 seconds

### Sanity Errors
- Verify your `.env` file has correct Sanity credentials
- Check `SANITY_PROJECT_ID`, `SANITY_DATASET`, and `SANITY_TOKEN`

## Next Steps

After testing with Postman:
1. Try creating incidents with different error types
2. Watch them appear in real-time on the dashboard
3. Verify the AI-generated explanations and fixes make sense
4. Move on to Task 4: Lightpanda similarity search
