import { useMemo } from 'react'
import './StatsPanel.css'

function StatsPanel({ incidents }) {
  const stats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const todayIncidents = incidents.filter(inc => 
      new Date(inc.timestamp) >= today
    )
    
    const errorTypes = {}
    incidents.forEach(inc => {
      const type = inc.statusCode >= 500 ? '5xx Server' : 
                   inc.statusCode >= 400 ? '4xx Client' : 'Other'
      errorTypes[type] = (errorTypes[type] || 0) + 1
    })
    
    const mostCommon = Object.entries(errorTypes)
      .sort((a, b) => b[1] - a[1])[0]
    
    const last24h = incidents.filter(inc => 
      new Date(inc.timestamp) > new Date(now - 24 * 60 * 60 * 1000)
    )
    
    const prev24h = incidents.filter(inc => {
      const time = new Date(inc.timestamp)
      return time > new Date(now - 48 * 60 * 60 * 1000) && 
             time <= new Date(now - 24 * 60 * 60 * 1000)
    })
    
    const trend = last24h.length > prev24h.length ? 'up' : 
                  last24h.length < prev24h.length ? 'down' : 'stable'
    
    return {
      total: incidents.length,
      today: todayIncidents.length,
      mostCommon: mostCommon ? mostCommon[0] : 'N/A',
      trend,
      last24h: last24h.length
    }
  }, [incidents])

  return (
    <div className="stats-panel">
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Incidents</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">🔥</div>
        <div className="stat-content">
          <div className="stat-value">{stats.today}</div>
          <div className="stat-label">Today</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">⚠️</div>
        <div className="stat-content">
          <div className="stat-value">{stats.mostCommon}</div>
          <div className="stat-label">Most Common</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          {stats.trend === 'up' ? '📈' : stats.trend === 'down' ? '📉' : '➡️'}
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.last24h}</div>
          <div className="stat-label">
            Last 24h {stats.trend === 'up' ? '↑' : stats.trend === 'down' ? '↓' : '→'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsPanel
