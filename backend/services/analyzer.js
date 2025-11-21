const errorRules = require('../utils/errorRules');

function analyzeError(errorMessage, endpoint) {
  const lowerMsg = errorMessage.toLowerCase();
  
  // Find matching rule
  for (const rule of errorRules) {
    const hasMatch = rule.keywords.some(keyword => lowerMsg.includes(keyword.toLowerCase()));
    if (hasMatch) {
      return {
        explanation: rule.explanation(errorMessage, endpoint),
        suggestedFix: rule.fix
      };
    }
  }
  
  // Fallback if no rule matches
  return {
    explanation: `The ${endpoint} endpoint crashed with an unexpected error.`,
    suggestedFix: 'Review the error message and stack trace to identify the root cause.'
  };
}

module.exports = { analyzeError };
