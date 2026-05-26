import { useLocation } from 'react-router-dom'
import authService from '../services/authService'
import ClientBottomNav from '../components/ClientBottomNav'
import TherapistFinder from '../components/therapist-finder/TherapistFinder.jsx'

export default function MatchingPage() {
  const location = useLocation()
  const { formData, priorityTherapistId, initialFilters } = location.state || {}
  const isLoggedIn = authService.isLoggedIn()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 pb-24">
      <section className="py-4 bg-white">
        <TherapistFinder
          showPrompt={false}
          priorityTherapistId={priorityTherapistId}
          initialFilters={initialFilters}
          heading={formData ? 'Psicólogos Recomendados para Você' : 'Nossos Psicólogos'}
          subheading={formData
            ? 'Baseado no seu perfil, encontramos estes profissionais.'
            : 'Filtre por demanda para encontrar quem combina com você.'}
          pageSize={6}
        />
      </section>

      {isLoggedIn && <ClientBottomNav />}
    </div>
  )
}
