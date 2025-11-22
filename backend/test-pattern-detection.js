// Test script to send multiple similar crashes for pattern detection
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Similar crash payload
const crashPayload = {
  endpoint: '/api/login',
  statusCode: 500,
  errorMessage: 'Cannot read property "id" of undefined',
  stackTrace: 'at login (/app/auth.js:45:12)\nat processRequest (/app/middleware.js:23:5)',
  requestBody: { email: 'test@example.com', password: '***' }
};

async function sendCrash(index) {
  try {
    const response = await axios.post(`${API_URL}/report-crash`, crashPayload);
    console.log(`Crash ${index} sent:`, response.data);
  } catch (error) {
    console.error(`Error sending crash ${index}:`, error.message);
  }
}

async function testPatternDetection() {
  console.log('Sending 6 similar crashes to trigger pattern detection...\n');
  
  // Send 6 similar crashes
  for (let i = 1; i <= 6; i++) {
    await sendCrash(i);
    await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between crashes
  }
  
  console.log('\nAll crashes sent. Wait 10-15 seconds for pattern detection...');
  console.log('Check pattern agent logs and GET /api/patterns endpoint');
}

testPatternDetection();
