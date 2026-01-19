import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Star, CheckCircle, Calendar, MessageCircle, ExternalLink } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import therapistService from '../services/therapistService'

export default function MatchingPage() {
  const location = useLocation()
  const { formData } = location.state || {}

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
    } finally {
      setLoadingTherapists(false)
    }
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
                        <span className="font-medium">Valor:</span>{' '}
                        <span className="text-green-600 font-bold">R$ {therapist.creditsPerMinute}/consulta</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Disponível:</span>{' '}
                        <span className="text-green-600 font-semibold">{therapist.available}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          const message = encodeURIComponent(`Olá! Gostaria de agendar uma sessão com ${therapist.name}. Vi o perfil na TerapiaConecta.`)
                          window.open(`https://wa.me/5511914214449?text=${message}`, '_blank')
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Agendar via WhatsApp
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
                  <Calendar className="h-4 w-4 text-green-600 mr-2" />
                  Próximo: Escolher psicólogo e agendar via WhatsApp
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}