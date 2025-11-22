const express = require('express');
const { analyzeError } = require('../services/analyzer');
const { storeIncident, getRecentIncidents, getPatterns } = require('../services/sanity');
const { publishIncident, connectRedis } = require('../services/redis');
const crypto = require('crypto');
const { createClient } = require('redis');

const router = express.Router();

router.post('/report-crash', async (req, res) => {
  try {
    const { endpoint, statusCode, errorMessage, stackTrace, requestBody } = req.body;
    
    // Validate required fields
    if (!endpoint || !statusCode || !errorMessage) {
      return res.status(400).json({ 
        error: 'Missing required fields: endpoint, statusCode, errorMessage' 
      });
    }
    
    // Generate unique incident ID
    const incidentId = `inc_${crypto.randomBytes(6).toString('hex')}`;
    
    // Create incident object
    const incident = {
      incidentId,
      endpoint,
      statusCode,
      errorMessage,
      stackTrace: stackTrace || '',
      requestBody,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Publish to Redis stream for agent processing
      await publishIncident(incident);
      
      // Return 202 Accepted immediately
      res.status(202).json({
        status: 'queued',
        incidentId: incidentId,
        message: 'Incident queued for agent processing'
      });
    } catch (redisError) {
      console.error('Redis error, falling back to direct Sanity storage:', redisError);
      
      // Fallback: analyze and store directly if Redis is unavailable
      const { explanation, suggestedFix } = analyzeError(errorMessage, endpoint);
      const fallbackIncident = {
        ...incident,
        explanation,
        suggestedFix
      };
      
      await storeIncident(fallbackIncident);
      
      res.status(202).json({
        status: 'queued',
        incidentId: incidentId,
        message: 'Incident queued for agent processing (fallback mode)'
      });
    }
  } catch (error) {
    console.error('Error processing crash report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/incidents', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const incidents = await getRecentIncidents(limit);
    res.status(200).json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/patterns', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const patterns = await getPatterns(limit);
    res.status(200).json(patterns);
  } catch (error) {
    console.error('Error fetching patterns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SSE endpoint for agent activity
router.get('/agent-activity', async (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  console.log('SSE client connected to agent-activity stream');
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ 
    agent: 'system', 
    action: 'Connected to agent activity stream', 
    timestamp: new Date().toISOString() 
  })}\n\n`);
  
  // Create a dedicated Redis client for this SSE connection
  let redisClient = null;
  let isSubscribing = true;
  
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    await redisClient.connect();
    console.log('SSE Redis client connected');
    
    // Start reading from the agent-activity stream
    let lastId = '$'; // Start from new messages only
    
    const streamReader = async () => {
      while (isSubscribing) {
        try {
          const messages = await redisClient.xRead(
            [{ key: 'agent-activity', id: lastId }],
            { BLOCK: 5000, COUNT: 10 }
          );
          
          if (messages && messages.length > 0) {
            for (const stream of messages) {
              for (const message of stream.messages) {
                lastId = message.id;
                
                // Send the activity event to the client
                const eventData = {
                  agent: message.message.agent,
                  action: message.message.action,
                  timestamp: message.message.timestamp
                };
                
                res.write(`data: ${JSON.stringify(eventData)}\n\n`);
              }
            }
          }
        } catch (error) {
          if (isSubscribing) {
            console.error('Error reading agent-activity stream:', error);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    };
    
    // Start the stream reader
    streamReader();
    
  } catch (error) {
    console.error('Error setting up SSE connection:', error);
    res.write(`data: ${JSON.stringify({ 
      agent: 'system', 
      action: 'Error connecting to Redis', 
      timestamp: new Date().toISOString() 
    })}\n\n`);
  }
  
  // Handle client disconnect
  req.on('close', async () => {
    console.log('SSE client disconnected');
    isSubscribing = false;
    if (redisClient) {
      try {
        await redisClient.quit();
      } catch (error) {
        console.error('Error closing Redis client:', error);
      }
    }
  });
});

module.exports = router;
