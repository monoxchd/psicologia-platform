import { useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { CheckCircle, Calendar } from 'lucide-react'
import authService from '../services/authService'
import ClientBottomNav from '../components/ClientBottomNav'
import TherapistFinder from '../components/therapist-finder/TherapistFinder.jsx'

export default function MatchingPage() {
  const location = useLocation()
  const { formData, priorityTherapistId } = location.state || {}
  const isLoggedIn = authService.isLoggedIn()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-gray-900">
              {formData ? 'Psicólogos Recomendados para Você' : 'Nossos Psicólogos'}
            </CardTitle>
            <CardDescription className="text-lg">
              {formData
                ? 'Baseado no seu perfil, encontramos estes profissionais.'
                : 'Filtre por demanda para encontrar quem combina com você.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TherapistFinder
              showPrompt={false}
              priorityTherapistId={priorityTherapistId}
              heading=""
              subheading=""
              pageSize={6}
            />

            {isLoggedIn && (
              <div className="mt-12 bg-green-50 p-6 rounded-lg">
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
            )}
          </CardContent>
        </Card>
      </div>

      {isLoggedIn && <ClientBottomNav />}
    </div>
  )
}
