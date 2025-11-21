import { useEffect } from 'react'
import './Toast.css'

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="toast">
      <div className="toast-icon">🔴</div>
      <div className="toast-content">
        <div className="toast-title">New Incident Detected!</div>
        <div className="toast-message">{message}</div>
      </div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  )
}

export default Toast
