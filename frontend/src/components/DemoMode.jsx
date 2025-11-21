import { useState } from 'react'
import './DemoMode.css'

const DEMO_INCIDENTS = [
  {
    endpoint: '/api/users/authenticate',
    statusCode: 500,
    errorMessage: "Cannot read property 'password' of undefined"
  },
  {
    endpoint: '/api/payments/process',
    statusCode: 504,
    errorMessage: 'Gateway timeout after 30 seconds'
  },
  {
    endpoint: '/api/database/query',
    statusCode: 500,
    errorMessage: 'Connection refused ECONNREFUSED 127.0.0.1:5432'
  },
  {
    endpoint: '/api/auth/verify-token',
    statusCode: 401,
    errorMessage: 'JWT token expired'
  },
  {
    endpoint: '/api/files/upload',
    statusCode: 413,
    errorMessage: 'Payload too large - maximum 10MB allowed'
  },
  {
    endpoint: '/api/external/weather',
    statusCode: 503,
    errorMessage: 'Service unavailable - upstream server down'
  }
]

function DemoMode({ onRefresh }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateIncident = async () => {
    const incident = DEMO_INCIDENTS[Math.floor(Math.random() * DEMO_INCIDENTS.length)]
    
    try {
      const response = await fetch('/api/report-crash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident)
      })
      
      if (response.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error('Failed to generate demo incident:', error)
    }
  }

  const startDemo = async () => {
    setIsGenerating(true)
    
    // Generate 3 incidents with delays
    for (let i = 0; i < 3; i++) {
      await generateIncident()
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    
    setIsGenerating(false)
  }

  return (
    <div className="demo-mode">
      <button 
        onClick={startDemo} 
        disabled={isGenerating}
        className="demo-btn"
      >
        {isGenerating ? '🎬 Generating...' : '🎬 Demo Mode'}
      </button>
      <span className="demo-hint">Generate sample incidents</span>
    </div>
  )
}

export default DemoMode
