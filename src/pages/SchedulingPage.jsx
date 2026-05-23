import SchedulingSystem from '../components/SchedulingSystem.jsx'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'

export default function SchedulingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  // Prefer the query param so links from campaigns / refresh / share survive.
  // Falls back to router state for callers that haven't been updated.
  const queryTherapistId = searchParams.get('therapistId')
  const stateTherapistId = location.state?.therapistId
  const therapistId = queryTherapistId
    ? parseInt(queryTherapistId, 10)
    : stateTherapistId

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 notranslate" translate="no">
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