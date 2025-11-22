require('dotenv').config();
const { subscribeToStream, publishToStream, publishAgentActivity } = require('../services/redis');
const { analyzeIncident } = require('../services/openai');
const { storeIncident } = require('../services/sanity');

console.log('Starting Triage Agent...');

/**
 * Process an incident from the Redis stream
 * @param {Object} message - The incident message from Redis
 * @param {string} messageId - The Redis message ID
 */
async function processIncident(message, messageId) {
  const incidentId = message.incidentId;
  
  try {
    console.log(`Triage Agent: Analyzing incident ${incidentId}`);
    
    // Publish agent activity
    try {
      const activityId = await publishAgentActivity('triage-agent', `Analyzing incident ${incidentId}`);
      console.log(`Published agent activity with ID: ${activityId}`);
    } catch (actError) {
      console.error('Failed to publish agent activity:', actError);
    }
    
    // Prepare incident object for OpenAI analysis
    const incident = {
      incidentId: message.incidentId,
      endpoint: message.endpoint,
      statusCode: parseInt(message.statusCode),
      errorMessage: message.errorMessage,
      stackTrace: message.stackTrace,
      requestBody: message.requestBody ? JSON.parse(message.requestBody) : null,
      timestamp: message.timestamp
    };
    
    // Analyze incident with OpenAI
    const analysis = await analyzeIncident(incident);
    
    console.log(`Triage Agent: Analysis complete for ${incidentId} - Severity: ${analysis.severity}`);
    
    // Create enriched incident object
    const enrichedIncident = {
      ...incident,
      severity: analysis.severity,
      rootCause: analysis.rootCause,
      suggestedFix: analysis.suggestedFix,
      analyzedBy: 'triage-agent'
    };
    
    // Store enriched incident in Sanity
    const storedIncident = await storeIncident(enrichedIncident);
    console.log(`Triage Agent: Stored incident ${incidentId} in Sanity with ID: ${storedIncident._id}`);
    
    // Publish to "incident-analyzed" stream
    await publishToStream('incident-analyzed', {
      incidentId: incidentId,
      severity: analysis.severity,
      rootCause: analysis.rootCause,
      suggestedFix: analysis.suggestedFix,
      sanityId: storedIncident._id,
      timestamp: new Date().toISOString()
    });
    
    // Publish completion activity
    try {
      const completionId = await publishAgentActivity('triage-agent', `Completed analysis of ${incidentId} - ${analysis.severity} severity`);
      console.log(`Published completion activity with ID: ${completionId}`);
    } catch (actError) {
      console.error('Failed to publish completion activity:', actError);
    }
    
    console.log(`Triage Agent: Published incident-analyzed event for ${incidentId}`);
  } catch (error) {
    console.error(`Triage Agent: Error processing incident ${incidentId}:`, error);
    
    // Publish error activity
    try {
      await publishAgentActivity('triage-agent', `Error analyzing ${incidentId}: ${error.message}`);
    } catch (activityError) {
      console.error('Failed to publish error activity:', activityError);
    }
  }
}

/**
 * Start the triage agent
 */
async function start() {
  try {
    console.log('Triage Agent: Connecting to Redis and subscribing to "incidents" stream...');
    
    // Subscribe to the incidents stream with consumer group
    await subscribeToStream(
      'incidents',
      processIncident,
      'triage-group',
      'triage-agent-1'
    );
  } catch (error) {
    console.error('Triage Agent: Fatal error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nTriage Agent: Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nTriage Agent: Shutting down gracefully...');
  process.exit(0);
});

// Start the agent
start();
