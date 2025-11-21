import { useState, useEffect, useRef } from 'react'
import IncidentList from './components/IncidentList'
import StatsPanel from './components/StatsPanel'
import DemoMode from './components/DemoMode'
import Toast from './components/Toast'
import './App.css'

function App() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const prevCountRef = useRef(0)

  const fetchIncidents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/incidents')
      if (!response.ok) throw new Error('Failed to fetch incidents')
      const data = await response.json()
      
      // Check for new incidents
      if (prevCountRef.current > 0 && data.length > prevCountRef.current) {
        const newIncident = data[0]
        setToast(`${newIncident.endpoint} - ${newIncident.errorMessage.substring(0, 50)}...`)
      }
      
      prevCountRef.current = data.length
      setIncidents(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncidents()
    // Auto-refresh every 3 seconds
    const interval = setInterval(fetchIncidents, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <header className="header">
        <div className="header-content">
          <div>
            <h1>🔴 CrashLensAI Dashboard</h1>
            <p>Real-time crash monitoring and analysis</p>
          </div>
          <div className="header-actions">
            <DemoMode onRefresh={fetchIncidents} />
            <button onClick={fetchIncidents} className="refresh-btn">
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        {loading && incidents.length === 0 ? (
          <div className="loading">Loading incidents...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : incidents.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📊</div>
            <h2>No incidents reported yet</h2>
            <p>Use the Demo Mode button to generate sample incidents</p>
          </div>
        ) : (
          <>
            <StatsPanel incidents={incidents} />
            <IncidentList incidents={incidents} />
          </>
        )}
      </main>
    </div>
  )
}

export default App
