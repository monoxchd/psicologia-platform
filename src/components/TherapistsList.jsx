import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Star, User, ExternalLink, Brain, Clock, LogIn } from 'lucide-react'
import therapistService from '../services/therapistService'
import authService from '../services/authService'

function TherapistsList() {
  const navigate = useNavigate()
  const [therapists, setTherapists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTherapists()
  }, [])

  const fetchTherapists = async () => {
    try {
      setLoading(true)
      setError(null)
      const therapistsData = await therapistService.getAllTherapists()
      const formattedTherapists = therapistService.formatTherapistsForUI(therapistsData)
      setTherapists(formattedTherapists)
    } catch (err) {
      console.error('Failed to fetch therapists:', err)
      setError('Não foi possível carregar os terapeutas.')
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleClick = (therapist) => {
    if (authService.isLoggedIn()) {
      navigate('/scheduling', { state: { therapistId: therapist.id } })
    } else {
      navigate('/form')
    }
  }

  const getLowestPrice = (therapist) => {
    if (therapist.services && therapist.services.length > 0) {
      const prices = therapist.services.map(s => parseFloat(s.price))
      return Math.min(...prices)
    }
    return null
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando terapeutas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Nossos Terapeutas</h2>
        <p className="text-gray-600">Conheça nossa equipe de profissionais</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {therapists.map((therapist) => {
          const lowestPrice = getLowestPrice(therapist)

          return (
            <Card key={therapist.id} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {therapist.image && therapist.image !== '👨‍⚕️' ? (
                      <img
                        src={therapist.image}
                        alt={therapist.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Brain className="h-7 w-7 text-purple-600" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{therapist.name}</CardTitle>
                      <CardDescription>{therapist.specialty}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {therapist.rating}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-1" />
                    <span>{therapist.experience}</span>
                  </div>
                  {lowestPrice && (
                    <div className="flex items-center text-green-600 font-medium">
                      <span>a partir de R$ {lowestPrice.toFixed(0)}</span>
                    </div>
                  )}
                </div>

                {therapist.bio && (
                  <p className="text-sm text-gray-600 line-clamp-4 cursor-pointer" onClick={(e) => e.currentTarget.classList.toggle('line-clamp-4')}>{therapist.bio}</p>
                )}

                {therapist.crpNumber && (
                  <div className="text-xs text-gray-500 text-center py-2 border-t">
                    CRP: {therapist.crpNumber}
                  </div>
                )}

                <div className="space-y-2 pt-2 mt-auto">
                  <Button
                    className="w-full"
                    onClick={() => handleScheduleClick(therapist)}
                  >
                    {authService.isLoggedIn() ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Agendar Sessão
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Agendar Sessão
                      </>
                    )}
                  </Button>
                  {therapist.personalSiteUrl && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(therapist.personalSiteUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Site
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default TherapistsList
