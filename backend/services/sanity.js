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
      incidentId: incident.incidentId,
      endpoint: incident.endpoint,
      statusCode: incident.statusCode,
      errorMessage: incident.errorMessage,
      stackTrace: incident.stackTrace || null,
      explanation: incident.explanation || null,
      suggestedFix: incident.suggestedFix || null,
      severity: incident.severity || null,
      rootCause: incident.rootCause || null,
      analyzedBy: incident.analyzedBy || null,
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

/**
 * Store a pattern document in Sanity
 * @param {Object} pattern - The pattern object to store
 * @returns {Promise<Object>} The created pattern document with _id
 */
async function storePattern(pattern) {
  try {
    const doc = {
      _type: 'pattern',
      patternId: pattern.patternId,
      patternType: pattern.patternType,
      affectedEndpoints: pattern.affectedEndpoints || [],
      frequency: pattern.frequency,
      firstSeen: pattern.firstSeen,
      lastSeen: pattern.lastSeen,
      detectedBy: pattern.detectedBy || null,
      likelyRootCause: pattern.likelyRootCause || null
    };
    
    const result = await client.create(doc);
    console.log(`Stored pattern ${pattern.patternId} in Sanity with ID: ${result._id}`);
    return result;
  } catch (error) {
    console.error('Error storing pattern in Sanity:', error);
    throw error;
  }
}

/**
 * Fetch patterns from Sanity
 * @param {number} limit - Number of patterns to fetch (default: 10)
 * @returns {Promise<Array>} Array of pattern documents
 */
async function getPatterns(limit = 10) {
  try {
    const query = `*[_type == "pattern"] | order(frequency desc, lastSeen desc)[0...${limit}]`;
    const patterns = await client.fetch(query);
    return patterns;
  } catch (error) {
    console.error('Error fetching patterns from Sanity:', error);
    throw error;
  }
}

/**
 * Store a resolution document in Sanity
 * @param {Object} resolution - The resolution object to store
 * @returns {Promise<Object>} The created resolution document with _id
 */
async function storeResolution(resolution) {
  try {
    const doc = {
      _type: 'resolution',
      resolutionId: resolution.resolutionId,
      incidentId: resolution.incidentId,
      codePatch: resolution.codePatch || null,
      language: resolution.language || null,
      explanation: resolution.explanation || null,
      generatedBy: resolution.generatedBy || null,
      timestamp: resolution.timestamp
    };
    
    const result = await client.create(doc);
    console.log(`Stored resolution ${resolution.resolutionId} in Sanity with ID: ${result._id}`);
    return result;
  } catch (error) {
    console.error('Error storing resolution in Sanity:', error);
    throw error;
  }
}

/**
 * Fetch resolutions from Sanity
 * @param {string} incidentId - Optional incident ID to filter by
 * @returns {Promise<Array>} Array of resolution documents
 */
async function getResolutions(incidentId = null) {
  try {
    let query;
    if (incidentId) {
      query = `*[_type == "resolution" && incidentId == "${incidentId}"] | order(timestamp desc)`;
    } else {
      query = `*[_type == "resolution"] | order(timestamp desc)[0...10]`;
    }
    const resolutions = await client.fetch(query);
    return resolutions;
  } catch (error) {
    console.error('Error fetching resolutions from Sanity:', error);
    throw error;
  }
}

module.exports = {
  storeIncident,
  getRecentIncidents,
  getIncidentById,
  storePattern,
  getPatterns,
  storeResolution,
  getResolutions
};
