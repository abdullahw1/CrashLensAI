import { useState, useEffect } from 'react'
import './PatternAlert.css'

function PatternAlert() {
  const [patterns, setPatterns] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPatterns = async () => {
    try {
      const response = await fetch('/api/patterns?limit=5')
      if (!response.ok) throw new Error('Failed to fetch patterns')
      const data = await response.json()
      setPatterns(data)
    } catch (error) {
      console.error('Error fetching patterns:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatterns()
    // Refresh patterns every 5 seconds
    const interval = setInterval(fetchPatterns, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading || patterns.length === 0) {
    return null
  }

  return (
    <div className="pattern-alerts">
      {patterns.map((pattern) => (
        <div key={pattern._id || pattern.patternId} className="pattern-alert">
          <div className="pattern-icon">📊</div>
          <div className="pattern-content">
            <div className="pattern-header">
              <span className="pattern-badge">Pattern Detected</span>
              <span className="pattern-frequency">
                {pattern.frequency} occurrences
              </span>
            </div>
            <div className="pattern-type">{pattern.patternType}</div>
            <div className="pattern-endpoints">
              <strong>Affected:</strong>{' '}
              {Array.isArray(pattern.affectedEndpoints) 
                ? pattern.affectedEndpoints.join(', ')
                : pattern.affectedEndpoints}
            </div>
            <div className="pattern-time">
              First seen: {formatTime(pattern.firstSeen)} • Last seen: {formatTime(pattern.lastSeen)}
            </div>
          </div>
          <button className="pattern-close" onClick={() => {
            setPatterns(prev => prev.filter(p => 
              (p._id || p.patternId) !== (pattern._id || pattern.patternId)
            ))
          }}>
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

export default PatternAlert
