const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analyze an incident using OpenAI
 * @param {Object} incident - The incident object containing error details
 * @returns {Promise<Object>} Analysis result with severity, rootCause, and suggestedFix
 */
async function analyzeIncident(incident) {
  try {
    const prompt = `You are a crash analysis expert. Analyze this API crash and provide a structured response.

Endpoint: ${incident.endpoint}
Status Code: ${incident.statusCode}
Error Message: ${incident.errorMessage}
Stack Trace: ${incident.stackTrace || 'Not provided'}
Request Context: ${incident.requestBody ? JSON.stringify(incident.requestBody) : 'Not provided'}

Provide your analysis in the following JSON format:
{
  "severity": "Critical|High|Medium|Low",
  "rootCause": "Brief explanation of what went wrong",
  "suggestedFix": "Specific code change or configuration fix"
}

Rules:
- Severity levels: Critical (system down), High (major feature broken), Medium (degraded functionality), Low (minor issue)
- Root cause should be 1-2 sentences explaining the technical issue
- Suggested fix should be actionable and specific

Respond ONLY with valid JSON, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing software crashes and providing structured technical analysis. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Parse the JSON response
    let analysis;
    try {
      // Try to extract JSON if there's extra text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Validate the response structure
    if (!analysis.severity || !analysis.rootCause || !analysis.suggestedFix) {
      throw new Error('OpenAI response missing required fields');
    }

    // Validate severity level
    const validSeverities = ['Critical', 'High', 'Medium', 'Low'];
    if (!validSeverities.includes(analysis.severity)) {
      console.warn(`Invalid severity level: ${analysis.severity}, defaulting to Medium`);
      analysis.severity = 'Medium';
    }

    console.log(`OpenAI analysis complete: ${analysis.severity} severity`);
    
    return {
      severity: analysis.severity,
      rootCause: analysis.rootCause,
      suggestedFix: analysis.suggestedFix
    };
  } catch (error) {
    console.error('Error analyzing incident with OpenAI:', error);
    
    // Fallback to rule-based analysis if OpenAI fails
    console.log('Falling back to rule-based analysis');
    return fallbackAnalysis(incident);
  }
}

/**
 * Fallback analysis when OpenAI is unavailable
 * @param {Object} incident - The incident object
 * @returns {Object} Basic analysis result
 */
function fallbackAnalysis(incident) {
  let severity = 'Medium';
  let rootCause = 'Unable to perform AI analysis';
  let suggestedFix = 'Review error logs and stack trace manually';

  // Simple rule-based severity detection
  if (incident.statusCode >= 500) {
    severity = 'High';
    rootCause = 'Server error occurred';
    suggestedFix = 'Check server logs and error handling';
  } else if (incident.statusCode === 404) {
    severity = 'Low';
    rootCause = 'Resource not found';
    suggestedFix = 'Verify endpoint exists and routing is correct';
  } else if (incident.statusCode === 401 || incident.statusCode === 403) {
    severity = 'Medium';
    rootCause = 'Authentication or authorization failure';
    suggestedFix = 'Check authentication tokens and permissions';
  }

  // Check for common error patterns
  const errorLower = incident.errorMessage.toLowerCase();
  if (errorLower.includes('cannot read property') || errorLower.includes('undefined')) {
    severity = 'High';
    rootCause = 'Null pointer or undefined reference';
    suggestedFix = 'Add null checks before accessing properties';
  } else if (errorLower.includes('timeout')) {
    severity = 'High';
    rootCause = 'Request timeout';
    suggestedFix = 'Optimize query performance or increase timeout limits';
  } else if (errorLower.includes('database') || errorLower.includes('connection')) {
    severity = 'Critical';
    rootCause = 'Database connection issue';
    suggestedFix = 'Check database connectivity and connection pool settings';
  }

  return { severity, rootCause, suggestedFix };
}

/**
 * Analyze a pattern of similar incidents using OpenAI
 * @param {Array<Object>} incidents - Array of similar incidents
 * @returns {Promise<Object>} Pattern analysis with patternType, affectedEndpoints, and likelyRootCause
 */
async function analyzePattern(incidents) {
  try {
    // Create a summary of incidents for the prompt
    const incidentSummaries = incidents.map((inc, idx) => {
      return `Incident ${idx + 1}:
  Endpoint: ${inc.endpoint}
  Status: ${inc.statusCode}
  Error: ${inc.errorMessage}
  Time: ${inc.timestamp}`;
    }).join('\n\n');

    const prompt = `You are a pattern detection expert. Analyze these similar crashes that occurred within a short time window and identify the common pattern.

${incidentSummaries}

Provide your analysis in the following JSON format:
{
  "patternType": "Brief description of the common issue",
  "affectedEndpoints": ["list", "of", "affected", "endpoints"],
  "likelyRootCause": "Explanation of the systemic issue causing this pattern"
}

Rules:
- Pattern type should be a concise description (e.g., "Repeated null pointer in authentication")
- List all unique endpoints affected
- Root cause should explain the systemic issue, not just individual errors

Respond ONLY with valid JSON, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at detecting patterns in software crashes and identifying systemic issues. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Parse the JSON response
    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI pattern response:', responseText);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Validate the response structure
    if (!analysis.patternType || !analysis.affectedEndpoints || !analysis.likelyRootCause) {
      throw new Error('OpenAI pattern response missing required fields');
    }

    console.log(`OpenAI pattern analysis complete: ${analysis.patternType}`);
    
    return {
      patternType: analysis.patternType,
      affectedEndpoints: analysis.affectedEndpoints,
      likelyRootCause: analysis.likelyRootCause
    };
  } catch (error) {
    console.error('Error analyzing pattern with OpenAI:', error);
    
    // Fallback to simple pattern detection
    console.log('Falling back to rule-based pattern detection');
    return fallbackPatternAnalysis(incidents);
  }
}

/**
 * Fallback pattern analysis when OpenAI is unavailable
 * @param {Array<Object>} incidents - Array of incidents
 * @returns {Object} Basic pattern analysis
 */
function fallbackPatternAnalysis(incidents) {
  const endpoints = [...new Set(incidents.map(inc => inc.endpoint))];
  const errorMessages = incidents.map(inc => inc.errorMessage);
  
  // Find common error keywords
  const commonWords = errorMessages[0].toLowerCase().split(' ')
    .filter(word => word.length > 3)
    .slice(0, 3)
    .join(' ');
  
  return {
    patternType: `Repeated errors: ${commonWords}`,
    affectedEndpoints: endpoints,
    likelyRootCause: `Multiple similar errors detected across ${endpoints.length} endpoint(s). Manual investigation recommended.`
  };
}

/**
 * Generate a code fix for an incident using OpenAI
 * @param {Object} incident - The incident object with analysis
 * @returns {Promise<Object>} Code fix with codePatch, language, and explanation
 */
async function generateCodeFix(incident) {
  try {
    const prompt = `You are a code fix generator. Generate a specific code fix for this crash.

Endpoint: ${incident.endpoint}
Status Code: ${incident.statusCode}
Error Message: ${incident.errorMessage}
Root Cause: ${incident.rootCause || 'Not provided'}
Suggested Fix: ${incident.suggestedFix || 'Not provided'}
Stack Trace: ${incident.stackTrace || 'Not provided'}

Provide your fix in the following JSON format:
{
  "codePatch": "Actual code changes needed (include context and line numbers if possible)",
  "language": "Programming language (e.g., JavaScript, Python, Java)",
  "explanation": "Why this fix resolves the issue"
}

Rules:
- Provide actual, runnable code in the codePatch
- Include enough context to understand where the fix should be applied
- Be specific about what needs to change
- Explanation should be 2-3 sentences

Respond ONLY with valid JSON, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at generating code fixes for software crashes. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Parse the JSON response
    let fix;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        fix = JSON.parse(jsonMatch[0]);
      } else {
        fix = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI fix response:', responseText);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Validate the response structure
    if (!fix.codePatch || !fix.language || !fix.explanation) {
      throw new Error('OpenAI fix response missing required fields');
    }

    console.log(`OpenAI code fix generated for ${incident.incidentId}`);
    
    return {
      codePatch: fix.codePatch,
      language: fix.language,
      explanation: fix.explanation
    };
  } catch (error) {
    console.error('Error generating code fix with OpenAI:', error);
    
    // Fallback to generic fix suggestion
    console.log('Falling back to generic fix suggestion');
    return fallbackCodeFix(incident);
  }
}

/**
 * Fallback code fix when OpenAI is unavailable
 * @param {Object} incident - The incident object
 * @returns {Object} Basic code fix suggestion
 */
function fallbackCodeFix(incident) {
  let codePatch = '// Add appropriate error handling and null checks\n';
  let language = 'JavaScript';
  let explanation = 'Generic fix suggestion. Manual review required.';

  const errorLower = incident.errorMessage.toLowerCase();
  
  if (errorLower.includes('cannot read property') || errorLower.includes('undefined')) {
    codePatch = `// Add null check before accessing properties
if (object && object.property) {
  // Safe to access object.property
} else {
  // Handle null/undefined case
  throw new Error('Required object is null or undefined');
}`;
    explanation = 'Add null checks before accessing object properties to prevent undefined reference errors.';
  } else if (errorLower.includes('timeout')) {
    codePatch = `// Increase timeout or optimize query
const result = await operation({ timeout: 30000 }); // Increase timeout
// OR optimize the underlying operation`;
    explanation = 'Increase timeout limits or optimize the operation to complete faster.';
  } else if (errorLower.includes('database') || errorLower.includes('connection')) {
    codePatch = `// Add connection retry logic
const maxRetries = 3;
for (let i = 0; i < maxRetries; i++) {
  try {
    await database.connect();
    break;
  } catch (error) {
    if (i === maxRetries - 1) throw error;
    await sleep(1000 * (i + 1));
  }
}`;
    explanation = 'Add retry logic for database connections to handle transient connection failures.';
  }

  return { codePatch, language, explanation };
}

module.exports = {
  analyzeIncident,
  analyzePattern,
  generateCodeFix
};
