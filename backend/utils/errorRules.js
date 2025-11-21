const errorRules = [
  {
    keywords: ['undefined', 'cannot read property'],
    explanation: (msg, endpoint) => `The ${endpoint} endpoint crashed because a variable was undefined when trying to access a property.`,
    fix: 'Add null-checks before accessing object properties.'
  },
  {
    keywords: ['null', 'is not an object'],
    explanation: (msg, endpoint) => `The ${endpoint} endpoint crashed because an expected object was null.`,
    fix: 'Verify the object exists before using it.'
  },
  {
    keywords: ['timeout', 'timed out'],
    explanation: (msg, endpoint) => `The ${endpoint} endpoint crashed due to a timeout waiting for a response.`,
    fix: 'Increase timeout duration or optimize the slow operation.'
  },
  {
    keywords: ['connection refused', 'econnrefused'],
    explanation: (msg, endpoint) => `The ${endpoint} endpoint crashed because it could not connect to a required service.`,
    fix: 'Verify the external service is running and accessible.'
  },
  {
    keywords: ['syntax error', 'unexpected token'],
    explanation: (msg, endpoint) => `The ${endpoint} endpoint crashed due to a syntax error in the code.`,
    fix: 'Review and fix the syntax error in the code.'
  }
];

module.exports = errorRules;
