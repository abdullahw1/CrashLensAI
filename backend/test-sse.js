// Simple test to verify SSE endpoint works
const http = require('http');

console.log('Testing SSE endpoint at http://localhost:3001/api/agent-activity');
console.log('This will connect and listen for 10 seconds...\n');

const req = http.get('http://localhost:3001/api/agent-activity', (res) => {
  console.log('Connected! Status:', res.statusCode);
  console.log('Headers:', res.headers);
  console.log('\nListening for events...\n');

  res.on('data', (chunk) => {
    const data = chunk.toString();
    console.log('Received:', data);
  });

  res.on('end', () => {
    console.log('\nConnection closed');
  });

  // Close after 10 seconds
  setTimeout(() => {
    console.log('\nTest complete, closing connection');
    req.destroy();
    process.exit(0);
  }, 10000);
});

req.on('error', (err) => {
  console.error('Error:', err.message);
  console.log('\nMake sure the backend server is running on port 3001');
  process.exit(1);
});
