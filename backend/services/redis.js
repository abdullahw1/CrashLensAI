const { createClient } = require('redis');

// Initialize Redis client
const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('Redis client connected');
});

// Connect to Redis
let isConnected = false;

async function connectRedis() {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
      console.log('Redis connection established');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }
}

/**
 * Publish an incident to the Redis "incidents" stream
 * @param {Object} incident - The incident object to publish
 * @returns {Promise<string>} The message ID
 */
async function publishIncident(incident) {
  try {
    await connectRedis();
    
    const messageId = await client.xAdd('incidents', '*', {
      incidentId: incident.incidentId,
      endpoint: incident.endpoint,
      statusCode: incident.statusCode.toString(),
      errorMessage: incident.errorMessage,
      stackTrace: incident.stackTrace || '',
      requestBody: incident.requestBody ? JSON.stringify(incident.requestBody) : '',
      timestamp: incident.timestamp
    });
    
    console.log(`Published incident ${incident.incidentId} to Redis stream with ID: ${messageId}`);
    return messageId;
  } catch (error) {
    console.error('Error publishing incident to Redis:', error);
    throw error;
  }
}

/**
 * Subscribe to a Redis stream and process messages
 * @param {string} streamName - Name of the stream to subscribe to
 * @param {Function} callback - Function to call for each message
 * @param {string} consumerGroup - Optional consumer group name
 * @param {string} consumerName - Optional consumer name
 */
async function subscribeToStream(streamName, callback, consumerGroup = null, consumerName = null) {
  try {
    await connectRedis();
    
    let lastId = '0'; // Start from the beginning for new consumers
    
    if (consumerGroup && consumerName) {
      // Try to create consumer group (ignore error if it already exists)
      try {
        await client.xGroupCreate(streamName, consumerGroup, '0', { MKSTREAM: true });
        console.log(`Created consumer group: ${consumerGroup}`);
      } catch (error) {
        if (!error.message.includes('BUSYGROUP')) {
          throw error;
        }
      }
      
      // Read from consumer group
      console.log(`Subscribing to stream "${streamName}" as ${consumerGroup}/${consumerName}`);
      
      while (true) {
        try {
          const messages = await client.xReadGroup(
            consumerGroup,
            consumerName,
            [{ key: streamName, id: '>' }],
            { BLOCK: 5000, COUNT: 10 }
          );
          
          if (messages && messages.length > 0) {
            for (const stream of messages) {
              for (const message of stream.messages) {
                await callback(message.message, message.id);
                // Acknowledge the message
                await client.xAck(streamName, consumerGroup, message.id);
              }
            }
          }
        } catch (error) {
          console.error(`Error reading from stream ${streamName}:`, error);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    } else {
      // Simple subscription without consumer group
      console.log(`Subscribing to stream "${streamName}"`);
      
      while (true) {
        try {
          const messages = await client.xRead(
            [{ key: streamName, id: lastId }],
            { BLOCK: 5000, COUNT: 10 }
          );
          
          if (messages && messages.length > 0) {
            for (const stream of messages) {
              for (const message of stream.messages) {
                lastId = message.id;
                await callback(message.message, message.id);
              }
            }
          }
        } catch (error) {
          console.error(`Error reading from stream ${streamName}:`, error);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
  } catch (error) {
    console.error('Error subscribing to stream:', error);
    throw error;
  }
}

/**
 * Publish agent activity to the Redis "agent-activity" stream
 * @param {string} agentName - Name of the agent
 * @param {string} action - Description of the action
 * @returns {Promise<string>} The message ID
 */
async function publishAgentActivity(agentName, action) {
  try {
    await connectRedis();
    
    const messageId = await client.xAdd('agent-activity', '*', {
      agent: agentName,
      action: action,
      timestamp: new Date().toISOString()
    });
    
    return messageId;
  } catch (error) {
    console.error('Error publishing agent activity to Redis:', error);
    throw error;
  }
}

/**
 * Publish to a generic stream
 * @param {string} streamName - Name of the stream
 * @param {Object} data - Data to publish
 * @returns {Promise<string>} The message ID
 */
async function publishToStream(streamName, data) {
  try {
    await connectRedis();
    
    const messageId = await client.xAdd(streamName, '*', data);
    console.log(`Published to stream "${streamName}" with ID: ${messageId}`);
    return messageId;
  } catch (error) {
    console.error(`Error publishing to stream ${streamName}:`, error);
    throw error;
  }
}

/**
 * Close the Redis connection
 */
async function closeConnection() {
  if (isConnected) {
    await client.quit();
    isConnected = false;
    console.log('Redis connection closed');
  }
}

module.exports = {
  connectRedis,
  publishIncident,
  subscribeToStream,
  publishAgentActivity,
  publishToStream,
  closeConnection
};
