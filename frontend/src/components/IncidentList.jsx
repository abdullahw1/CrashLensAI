import IncidentCard from './IncidentCard'
import './IncidentList.css'

function IncidentList({ incidents }) {
  return (
    <div className="incident-list">
      <div className="incident-count">
        Total Incidents: <span>{incidents.length}</span>
      </div>
      <div className="incidents-grid">
        {incidents.map((incident, index) => (
          <IncidentCard 
            key={incident._id} 
            incident={incident} 
            isLatest={index === 0}
          />
        ))}
      </div>
    </div>
  )
}

export default IncidentList
