require('dotenv').config();
const { subscribeToStream, publishToStream, publishAgentActivity } = require('../services/redis');
const { generateCodeFix } = require('../services/openai');
const { storeResolution } = require('../services/sanity');
const crypto = require('crypto');

console.log('Starting Auto-Resolution Agent...');

/**
 * Check if incident is fixable based on severity
 * @param {string} severity - The incident severity
 * @returns {boolean} True if incident should be auto-fixed
 */
function isFixable(severity) {
  return severity === 'Critical' || severity === 'High';
}

/**
 * Process an analyzed incident from the Redis stream
 * @param {Object} message - The incident-analyzed message from Redis
 * @param {string} messageId - The Redis message ID
 */
async function processAnalyzedIncident(message, messageId) {
  const incidentId = message.incidentId;
  
  try {
    const severity = message.severity;
    
    console.log(`Resolution Agent: Received analyzed incident ${incidentId} with severity: ${severity}`);
    
    // Check if incident is fixable (Critical or High severity)
    if (!isFixable(severity)) {
      console.log(`Resolution Agent: Skipping ${incidentId} - severity ${severity} does not require auto-fix`);
      return;
    }
    
    console.log(`Resolution Agent: Generating code fix for ${incidentId}`);
    await publishAgentActivity('resolution-agent', `Generating code fix for ${incidentId}`);
    
    // Prepare incident object for fix generation
    const incident = {
      incidentId: incidentId,
      severity: severity,
      rootCause: message.rootCause,
      suggestedFix: message.suggestedFix,
      endpoint: message.endpoint || 'Unknown',
      statusCode: message.statusCode || 500,
      errorMessage: message.errorMessage || 'Unknown error',
      stackTrace: message.stackTrace || ''
    };
    
    // Generate code fix with OpenAI
    const fix = await generateCodeFix(incident);
    
    console.log(`Resolution Agent: Code fix generated for ${incidentId} in ${fix.language}`);
    
    // Create resolution document
    const resolutionId = `res_${crypto.randomBytes(6).toString('hex')}`;
    const resolution = {
      resolutionId: resolutionId,
      incidentId: incidentId,
      codePatch: fix.codePatch,
      language: fix.language,
      explanation: fix.explanation,
      generatedBy: 'resolution-agent',
      timestamp: new Date().toISOString()
    };
    
    // Store resolution in Sanity
    const storedResolution = await storeResolution(resolution);
    console.log(`Resolution Agent: Stored resolution ${resolutionId} in Sanity with ID: ${storedResolution._id}`);
    
    // Publish fix-proposed event
    await publishToStream('fix-proposed', {
      incidentId: incidentId,
      resolutionId: resolutionId,
      codePatch: fix.codePatch,
      language: fix.language,
      timestamp: new Date().toISOString()
    });
    
    // Publish completion activity
    await publishAgentActivity('resolution-agent', `Generated ${fix.language} fix for ${incidentId}`);
    
    console.log(`Resolution Agent: Published fix-proposed event for ${incidentId}`);
  } catch (error) {
    console.error(`Resolution Agent: Error processing incident ${incidentId}:`, error);
    
    // Publish error activity
    try {
      await publishAgentActivity('resolution-agent', `Error generating fix for ${incidentId}: ${error.message}`);
    } catch (activityError) {
      console.error('Failed to publish error activity:', activityError);
    }
  }
}

/**
 * Start the auto-resolution agent
 */
async function start() {
  try {
    console.log('Resolution Agent: Connecting to Redis and subscribing to "incident-analyzed" stream...');
    
    // Subscribe to the incident-analyzed stream
    await subscribeToStream(
      'incident-analyzed',
      processAnalyzedIncident,
      'resolution-group',
      'resolution-agent-1'
    );
  } catch (error) {
    console.error('Resolution Agent: Fatal error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nResolution Agent: Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nResolution Agent: Shutting down gracefully...');
  process.exit(0);
});

// Start the agent
start();
