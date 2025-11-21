const express = require('express');
const { analyzeError } = require('../services/analyzer');
const { storeIncident, getRecentIncidents } = require('../services/sanity');

const router = express.Router();

router.post('/report-crash', async (req, res) => {
  try {
    const { endpoint, statusCode, errorMessage, requestBody } = req.body;
    
    // Validate required fields
    if (!endpoint || !statusCode || !errorMessage) {
      return res.status(400).json({ 
        error: 'Missing required fields: endpoint, statusCode, errorMessage' 
      });
    }
    
    // Analyze the error
    const { explanation, suggestedFix } = analyzeError(errorMessage, endpoint);
    
    // Create incident object
    const incident = {
      endpoint,
      statusCode,
      errorMessage,
      explanation,
      suggestedFix,
      timestamp: new Date().toISOString(),
      requestBody
    };
    
    // Store incident in Sanity
    await storeIncident(incident);
    
    // Return the incident
    res.status(200).json(incident);
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

module.exports = router;
