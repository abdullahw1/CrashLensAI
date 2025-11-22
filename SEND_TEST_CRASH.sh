#!/bin/bash

# Send a test crash to CrashLensAI

echo "📤 Sending test crash to CrashLensAI..."
echo ""

curl -X POST http://localhost:3001/api/report-crash \
  -H 'Content-Type: application/json' \
  -d '{
    "endpoint": "/api/users/profile",
    "statusCode": 500,
    "errorMessage": "Cannot read property '\''id'\'' of undefined",
    "stackTrace": "at getUserProfile (/app/users.js:45:12)\n    at processRequest (/app/middleware.js:23:5)"
  }'

echo ""
echo ""
echo "✓ Crash sent! Check the dashboard at http://localhost:3000"
echo "  You should see agent activity and a new incident appear within seconds."
