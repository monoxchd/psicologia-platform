import { useLocation } from 'react-router-dom'
import { CheckCircle, Calendar } from 'lucide-react'
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

      {isLoggedIn && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-4">Parabéns! Você está quase lá:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Perfil criado e analisado
              </div>
              <div className="flex items-center text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Psicólogos compatíveis encontrados
              </div>
              <div className="flex items-center text-green-800">
                <Calendar className="h-4 w-4 text-green-600 mr-2" />
                Próximo: Escolher psicólogo e agendar
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoggedIn && <ClientBottomNav />}
    </div>
  )
}
