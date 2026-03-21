import SchedulingSystem from '../components/SchedulingSystem.jsx'
import { useNavigate, useLocation } from 'react-router-dom'

export default function SchedulingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { therapistId } = location.state || {}

  const handleScheduleComplete = (appointment) => {
    navigate('/confirmation', {
      state: {
        scheduledAppointment: appointment
      }
    })
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SchedulingSystem
          selectedTherapistId={therapistId}
          onBack={handleBack}
          onScheduleComplete={handleScheduleComplete}
        />
      </div>
    </div>
  )
}