#!/bin/bash

# Send multiple identical crashes to trigger pattern detection

echo "📤 Sending 6 identical crashes to trigger pattern detection..."
echo ""

for i in {1..6}; do
  echo "Sending crash $i/6..."
  curl -X POST http://localhost:3001/api/report-crash \
    -H 'Content-Type: application/json' \
    -d '{
      "endpoint": "/api/login",
      "statusCode": 500,
      "errorMessage": "Cannot read property '\''id'\'' of undefined",
      "stackTrace": "at login (/app/auth.js:45:12)"
    }' \
    -s -o /dev/null
  
  sleep 1
done

echo ""
echo "✓ All 6 crashes sent!"
echo ""
echo "🔍 Check the dashboard at http://localhost:3000"
echo "   You should see:"
echo "   - Multiple agent activities in the feed"
echo "   - A purple 'Pattern Detected' banner appear"
echo "   - Pattern showing 6 occurrences on /api/login"
