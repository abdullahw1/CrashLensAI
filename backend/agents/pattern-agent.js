require('dotenv').config();
const { subscribeToStream, publishToStream, publishAgentActivity } = require('../services/redis');
const { analyzePattern } = require('../services/openai');
const { storePattern } = require('../services/sanity');
const crypto = require('crypto');

console.log('Starting Pattern Detection Agent...');

// Sliding window to track incidents (60 seconds)
const WINDOW_SIZE_MS = 60000; // 60 seconds
const PATTERN_THRESHOLD = 5; // 5+ similar incidents trigger pattern detection
const CHECK_INTERVAL_MS = 10000; // Check for patterns every 10 seconds

// In-memory sliding window of incidents
const incidentWindow = [];

/**
 * Add incident to sliding window and remove old entries
 * @param {Object} incident - The incident to add
 */
function addToWindow(incident) {
  const now = Date.now();
  
  // Add new incident
  incidentWindow.push({
    ...incident,
    receivedAt: now
  });
  
  // Remove incidents older than window size
  const cutoffTime = now - WINDOW_SIZE_MS;
  while (incidentWindow.length > 0 && incidentWindow[0].receivedAt < cutoffTime) {
    incidentWindow.shift();
  }
  
  console.log(`Pattern Agent: Window now contains ${incidentWindow.length} incidents`);
}

/**
 * Group incidents by similarity (endpoint and error type)
 * @returns {Array<Array>} Array of incident groups
 */
function groupSimilarIncidents() {
  const groups = {};
  
  for (const incident of incidentWindow) {
    // Create a key based on endpoint and first few words of error
    const errorWords = incident.errorMessage.toLowerCase().split(' ').slice(0, 5).join(' ');
    const key = `${incident.endpoint}:${errorWords}`;
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(incident);
  }
  
  // Return groups that meet the threshold
  return Object.values(groups).filter(group => group.length >= PATTERN_THRESHOLD);
}

/**
 * Process detected patterns
 * @param {Array<Array>} patternGroups - Groups of similar incidents
 */
async function processPatterns(patternGroups) {
  for (const group of patternGroups) {
    try {
      const patternId = `pat_${crypto.randomBytes(6).toString('hex')}`;
      
      console.log(`Pattern Agent: Detected pattern with ${group.length} incidents`);
      await publishAgentActivity('pattern-agent', `Detected pattern with ${group.length} similar incidents`);
      
      // Analyze pattern with OpenAI
      const analysis = await analyzePattern(group);
      
      console.log(`Pattern Agent: Pattern analysis complete - ${analysis.patternType}`);
      
      // Create pattern document
      const pattern = {
        patternId: patternId,
        patternType: analysis.patternType,
        affectedEndpoints: analysis.affectedEndpoints,
        frequency: group.length,
        firstSeen: group[0].timestamp,
        lastSeen: group[group.length - 1].timestamp,
        detectedBy: 'pattern-agent',
        likelyRootCause: analysis.likelyRootCause
      };
      
      // Store pattern in Sanity
      const storedPattern = await storePattern(pattern);
      console.log(`Pattern Agent: Stored pattern ${patternId} in Sanity with ID: ${storedPattern._id}`);
      
      // Publish pattern-detected event
      await publishToStream('pattern-detected', {
        patternId: patternId,
        patternType: analysis.patternType,
        affectedEndpoints: JSON.stringify(analysis.affectedEndpoints),
        frequency: group.length.toString(),
        timestamp: new Date().toISOString()
      });
      
      // Publish completion activity
      await publishAgentActivity('pattern-agent', `Pattern detected: ${analysis.patternType} (${group.length} occurrences)`);
      
      console.log(`Pattern Agent: Published pattern-detected event for ${patternId}`);
      
      // Remove processed incidents from window to avoid duplicate detection
      for (const incident of group) {
        const index = incidentWindow.findIndex(i => i.incidentId === incident.incidentId);
        if (index !== -1) {
          incidentWindow.splice(index, 1);
        }
      }
    } catch (error) {
      console.error('Pattern Agent: Error processing pattern:', error);
      
      try {
        await publishAgentActivity('pattern-agent', `Error processing pattern: ${error.message}`);
      } catch (activityError) {
        console.error('Failed to publish error activity:', activityError);
      }
    }
  }
}

/**
 * Periodic pattern check
 */
async function checkForPatterns() {
  try {
    const patternGroups = groupSimilarIncidents();
    
    if (patternGroups.length > 0) {
      console.log(`Pattern Agent: Found ${patternGroups.length} pattern group(s) to analyze`);
      await processPatterns(patternGroups);
    }
  } catch (error) {
    console.error('Pattern Agent: Error in pattern check:', error);
  }
}

/**
 * Process an incident from the Redis stream
 * @param {Object} message - The incident message from Redis
 * @param {string} messageId - The Redis message ID
 */
async function processIncident(message, messageId) {
  try {
    const incident = {
      incidentId: message.incidentId,
      endpoint: message.endpoint,
      statusCode: parseInt(message.statusCode),
      errorMessage: message.errorMessage,
      stackTrace: message.stackTrace,
      timestamp: message.timestamp
    };
    
    // Add to sliding window
    addToWindow(incident);
    
  } catch (error) {
    console.error(`Pattern Agent: Error processing incident:`, error);
  }
}

/**
 * Start the pattern detection agent
 */
async function start() {
  try {
    console.log('Pattern Agent: Connecting to Redis and subscribing to "incidents" stream...');
    
    // Start periodic pattern checking
    setInterval(checkForPatterns, CHECK_INTERVAL_MS);
    console.log(`Pattern Agent: Started periodic pattern checking (every ${CHECK_INTERVAL_MS / 1000}s)`);
    
    // Subscribe to the incidents stream
    await subscribeToStream(
      'incidents',
      processIncident,
      'pattern-group',
      'pattern-agent-1'
    );
  } catch (error) {
    console.error('Pattern Agent: Fatal error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nPattern Agent: Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nPattern Agent: Shutting down gracefully...');
  process.exit(0);
});

// Start the agent
start();
