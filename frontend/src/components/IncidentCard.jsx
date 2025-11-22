import { useState, useEffect } from 'react'
import ResolutionPanel from './ResolutionPanel'
import './IncidentCard.css'

function IncidentCard({ incident, isLatest }) {
  const [resolution, setResolution] = useState(null)
  const [showResolution, setShowResolution] = useState(false)
  const [loadingResolution, setLoadingResolution] = useState(false)

  // Check if there's a resolution for this incident
  useEffect(() => {
    const fetchResolution = async () => {
      if (!incident.incidentId && !incident._id) return
      
      try {
        setLoadingResolution(true)
        const response = await fetch('/api/patterns')
        if (response.ok) {
          const patterns = await response.json()
          // Check if any resolution exists for this incident
          // This is a simplified check - in production you'd have a dedicated endpoint
          const hasResolution = patterns.some(p => 
            p.affectedEndpoints && 
            (Array.isArray(p.affectedEndpoints) 
              ? p.affectedEndpoints.includes(incident.endpoint)
              : p.affectedEndpoints === incident.endpoint)
          )
          
          if (hasResolution) {
            // Mock resolution for demo - in production, fetch from /api/resolutions/:incidentId
            setResolution({
              codePatch: `// Fix for ${incident.endpoint}\n\n// Add null check before accessing properties\nif (user && user.id) {\n  // Safe to access user.id\n  const userId = user.id;\n} else {\n  throw new Error('User object is null or undefined');\n}`,
              language: 'JavaScript',
              explanation: 'Added null check to prevent accessing properties on undefined objects',
              generatedBy: 'resolution-agent',
              timestamp: new Date().toISOString()
            })
          }
        }
      } catch (error) {
        console.error('Error fetching resolution:', error)
      } finally {
        setLoadingResolution(false)
      }
    }

    fetchResolution()
  }, [incident.incidentId, incident._id, incident.endpoint])
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getStatusColor = (code) => {
    if (code >= 500) return '#ef4444'
    if (code >= 400) return '#f59e0b'
    return '#10b981'
  }

  const getSeverity = () => {
    // Use AI-analyzed severity if available, otherwise fall back to status code
    if (incident.severity) {
      const severityMap = {
        'Critical': { level: 'Critical', color: '#ef4444', icon: '🔴' },
        'High': { level: 'High', color: '#f59e0b', icon: '🟡' },
        'Medium': { level: 'Medium', color: '#3b82f6', icon: '🔵' },
        'Low': { level: 'Low', color: '#10b981', icon: '🟢' }
      }
      return severityMap[incident.severity] || severityMap['Medium']
    }
    
    // Fallback based on status code
    if (incident.statusCode >= 500) return { level: 'Critical', color: '#ef4444', icon: '🔴' }
    if (incident.statusCode >= 400) return { level: 'High', color: '#f59e0b', icon: '🟡' }
    return { level: 'Medium', color: '#10b981', icon: '🟢' }
  }

  const severity = getSeverity()

  return (
    <div className={`incident-card ${isLatest ? 'latest' : ''}`}>
      {isLatest && <div className="latest-badge">🔥 Latest</div>}
      <div className="severity-badge" style={{ borderColor: severity.color }}>
        {severity.icon} {severity.level}
      </div>
      
      <div className="incident-header">
        <div className="endpoint">{incident.endpoint}</div>
        <div 
          className="status-code" 
          style={{ backgroundColor: getStatusColor(incident.statusCode) }}
        >
          {incident.statusCode}
        </div>
      </div>

      <div className="incident-error">
        <strong>Error:</strong> {incident.errorMessage}
      </div>

      {incident.rootCause && (
        <div className="incident-section">
          <div className="section-title">🔍 Root Cause</div>
          <div className="section-content">{incident.rootCause}</div>
        </div>
      )}

      {incident.explanation && !incident.rootCause && (
        <div className="incident-section">
          <div className="section-title">💡 Explanation</div>
          <div className="section-content">{incident.explanation}</div>
        </div>
      )}

      {incident.suggestedFix && (
        <div className="incident-section">
          <div className="section-title">🔧 Suggested Fix</div>
          <div className="section-content fix">{incident.suggestedFix}</div>
        </div>
      )}

      <div className="incident-footer">
        <span className="timestamp">⏰ {formatTime(incident.timestamp)}</span>
        <div className="footer-actions">
          {incident.analyzedBy && (
            <span className="analyzed-by">
              🤖 Analyzed by {incident.analyzedBy}
            </span>
          )}
          {resolution && (
            <button 
              className="fix-available-btn"
              onClick={() => setShowResolution(true)}
            >
              🔧 Fix Available
            </button>
          )}
          {loadingResolution && !resolution && (
            <span className="loading-resolution">Checking for fixes...</span>
          )}
        </div>
      </div>

      {showResolution && resolution && (
        <ResolutionPanel 
          resolution={resolution} 
          onClose={() => setShowResolution(false)} 
        />
      )}
    </div>
  )
}

export default IncidentCard
