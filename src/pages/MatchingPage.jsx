import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Star, CheckCircle, Calendar } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import therapistService from '../services/therapistService'

export default function MatchingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { formData, selectedCredits } = location.state || {}
  
  const [therapists, setTherapists] = useState([])
  const [loadingTherapists, setLoadingTherapists] = useState(false)
  const [therapistError, setTherapistError] = useState(null)

  useEffect(() => {
    fetchTherapists()
  }, [])

  const fetchTherapists = async () => {
    setLoadingTherapists(true)
    setTherapistError(null)
    try {
      const data = await therapistService.getAllTherapists()
      const formattedTherapists = therapistService.formatTherapistsForUI(data)
      setTherapists(formattedTherapists)
    } catch (error) {
      console.error('Failed to load therapists:', error)
      setTherapistError('Não foi possível carregar os terapeutas. Por favor, tente novamente.')
      setTherapists([
        {
          id: "ana-silva",
          name: "Dra. Ana Silva",
          specialty: "Ansiedade e Depressão",
          experience: "8 anos",
          rating: 4.9,
          creditsPerMinute: 2.0,
          available: "Hoje às 14h",
          image: "👩‍⚕️"
        },
        {
          id: "carlos-santos",
          name: "Dr. Carlos Santos",
          specialty: "Terapia Cognitiva",
          experience: "12 anos", 
          rating: 4.8,
          creditsPerMinute: 2.5,
          available: "Amanhã às 10h",
          image: "👨‍⚕️"
        },
        {
          id: "maria-costa",
          name: "Dra. Maria Costa",
          specialty: "Relacionamentos",
          experience: "6 anos",
          rating: 4.9,
          creditsPerMinute: 1.8,
          available: "Hoje às 16h",
          image: "👩‍⚕️"
        }
      ])
    } finally {
      setLoadingTherapists(false)
    }
  }

  const handleTherapistSelection = (therapistId) => {
    navigate('/scheduling', { 
      state: { 
        formData, 
        selectedCredits, 
        selectedTherapist: therapistId 
      } 
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-gray-900">Psicólogos Recomendados para Você</CardTitle>
            <CardDescription className="text-lg">
              Baseado no seu perfil, encontramos estes profissionais ideais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {therapistError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{therapistError}</p>
              </div>
            )}
            
            {loadingTherapists ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Carregando terapeutas disponíveis...</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {therapists.map((therapist) => (
                <Card key={therapist.id} className="relative">
                  <CardHeader className="text-center">
                    <div className="text-6xl mb-4">{therapist.image}</div>
                    <CardTitle className="text-xl">{therapist.name}</CardTitle>
                    <CardDescription>{therapist.specialty}</CardDescription>
                    <div className="flex items-center justify-center space-x-1 mt-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{therapist.rating}</span>
                      <span className="text-gray-500">({therapist.experience})</span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="space-y-2 mb-6">
                      <div className="text-sm">
                        <span className="font-medium">Custo por minuto:</span>{' '}
                        <span className="text-blue-600 font-bold">{therapist.creditsPerMinute} créditos</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Disponível:</span>{' '}
                        <span className="text-green-600 font-semibold">{therapist.available}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        className="w-full"
                        onClick={() => handleTherapistSelection(therapist.id)}
                      >
                        Agendar Sessão
                      </Button>
                      <Button variant="outline" className="w-full">
                        ❤️ Favoritar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}

            <div className="mt-12 bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-4">🎉 Parabéns! Você está quase lá:</h3>
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
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Sistema de créditos explicado
                </div>
                <div className="flex items-center text-green-800">
                  <Calendar className="h-4 w-4 text-green-600 mr-2" />
                  Próximo: Escolher psicólogo e agendar primeira sessão
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}