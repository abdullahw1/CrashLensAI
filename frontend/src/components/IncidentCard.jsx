import './IncidentCard.css'

function IncidentCard({ incident, isLatest }) {
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

  const getSeverity = (code) => {
    if (code >= 500) return { level: 'Critical', color: '#ef4444', icon: '🔴' }
    if (code >= 400) return { level: 'High', color: '#f59e0b', icon: '🟡' }
    return { level: 'Medium', color: '#10b981', icon: '🟢' }
  }

  const severity = getSeverity(incident.statusCode)

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

      <div className="incident-section">
        <div className="section-title">💡 Explanation</div>
        <div className="section-content">{incident.explanation}</div>
      </div>

      <div className="incident-section">
        <div className="section-title">🔧 Suggested Fix</div>
        <div className="section-content fix">{incident.suggestedFix}</div>
      </div>

      <div className="incident-footer">
        <span className="timestamp">⏰ {formatTime(incident.timestamp)}</span>
      </div>
    </div>
  )
}

export default IncidentCard
