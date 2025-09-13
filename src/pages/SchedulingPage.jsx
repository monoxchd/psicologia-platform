import SchedulingSystem from '../components/SchedulingSystem.jsx'
import { useNavigate, useLocation } from 'react-router-dom'

export default function SchedulingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { formData, selectedCredits, selectedTherapist } = location.state || {}

  const handleScheduleComplete = (appointment) => {
    navigate('/confirmation', { 
      state: { 
        formData, 
        selectedCredits, 
        selectedTherapist,
        scheduledAppointment: appointment 
      } 
    })
  }

  const handleBack = () => {
    navigate('/matching', { state: { formData, selectedCredits } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SchedulingSystem
          selectedTherapist={selectedTherapist}
          userCredits={selectedCredits}
          onBack={handleBack}
          onScheduleComplete={handleScheduleComplete}
        />
      </div>
    </div>
  )
}