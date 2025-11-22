import { useState, useEffect, useRef } from 'react'
import './AgentActivity.css'

function AgentActivity() {
  const [activities, setActivities] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef(null)
  const activitiesEndRef = useRef(null)

  useEffect(() => {
    // Connect to SSE endpoint
    const eventSource = new EventSource('/api/agent-activity')
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('SSE connection opened')
      setIsConnected(true)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setActivities(prev => [data, ...prev].slice(0, 50)) // Keep last 50 activities
      } catch (error) {
        console.error('Error parsing SSE message:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      setIsConnected(false)
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          console.log('Attempting to reconnect...')
          eventSource.close()
          // The component will reconnect on next render
        }
      }, 5000)
    }

    // Cleanup on unmount
    return () => {
      eventSource.close()
    }
  }, [])

  // Auto-scroll to show latest activity
  useEffect(() => {
    activitiesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activities])

  const getAgentColor = (agentName) => {
    const colors = {
      'triage-agent': '#3b82f6',
      'pattern-agent': '#8b5cf6',
      'resolution-agent': '#10b981',
      'system': '#6b7280'
    }
    return colors[agentName] || '#6b7280'
  }

  const getAgentIcon = (agentName) => {
    const icons = {
      'triage-agent': '🔍',
      'pattern-agent': '📊',
      'resolution-agent': '🔧',
      'system': '⚙️'
    }
    return icons[agentName] || '🤖'
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="agent-activity">
      <div className="activity-header">
        <h3>🤖 Live Agent Activity</h3>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {isConnected ? 'Connected' : 'Reconnecting...'}
        </div>
      </div>

      <div className="activity-feed">
        {activities.length === 0 ? (
          <div className="activity-empty">
            <p>Waiting for agent activity...</p>
            <p className="activity-hint">Agents will appear here when they process incidents</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div 
              key={`${activity.timestamp}-${index}`} 
              className="activity-item"
              style={{ borderLeftColor: getAgentColor(activity.agent) }}
            >
              <div className="activity-icon" style={{ backgroundColor: getAgentColor(activity.agent) }}>
                {getAgentIcon(activity.agent)}
              </div>
              <div className="activity-content">
                <div className="activity-agent" style={{ color: getAgentColor(activity.agent) }}>
                  {activity.agent}
                </div>
                <div className="activity-action">{activity.action}</div>
                <div className="activity-time">{formatTime(activity.timestamp)}</div>
              </div>
            </div>
          ))
        )}
        <div ref={activitiesEndRef} />
      </div>
    </div>
  )
}

export default AgentActivity
