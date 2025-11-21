const { createClient } = require('@sanity/client');

// Initialize Sanity client
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false
});

/**
 * Store an incident document in Sanity
 * @param {Object} incident - The incident object to store
 * @returns {Promise<Object>} The created incident document with _id
 */
async function storeIncident(incident) {
  try {
    const doc = {
      _type: 'incident',
      endpoint: incident.endpoint,
      statusCode: incident.statusCode,
      errorMessage: incident.errorMessage,
      explanation: incident.explanation,
      suggestedFix: incident.suggestedFix,
      timestamp: incident.timestamp,
      requestBody: incident.requestBody ? JSON.stringify(incident.requestBody) : null
    };
    
    const result = await client.create(doc);
    return result;
  } catch (error) {
    console.error('Error storing incident in Sanity:', error);
    throw error;
  }
}

/**
 * Fetch the most recent incidents from Sanity
 * @param {number} limit - Number of incidents to fetch (default: 10)
 * @returns {Promise<Array>} Array of incident documents
 */
async function getRecentIncidents(limit = 10) {
  try {
    const query = `*[_type == "incident"] | order(timestamp desc)[0...${limit}]`;
    const incidents = await client.fetch(query);
    return incidents;
  } catch (error) {
    console.error('Error fetching incidents from Sanity:', error);
    throw error;
  }
}

/**
 * Fetch a single incident by ID
 * @param {string} id - The incident document ID
 * @returns {Promise<Object>} The incident document
 */
async function getIncidentById(id) {
  try {
    const incident = await client.getDocument(id);
    return incident;
  } catch (error) {
    console.error('Error fetching incident from Sanity:', error);
    throw error;
  }
}

module.exports = {
  storeIncident,
  getRecentIncidents,
  getIncidentById
};
