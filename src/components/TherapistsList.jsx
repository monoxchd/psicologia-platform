import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Star, Clock, Calendar, User } from 'lucide-react'
import therapistService from '../services/therapistService'

function TherapistsList() {
  const [therapists, setTherapists] = useState([])
  const [availabilities, setAvailabilities] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTherapistsAndAvailability()
  }, [])

  const fetchTherapistsAndAvailability = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all therapists
      const therapistsData = await therapistService.getAllTherapists()
      const formattedTherapists = therapistService.formatTherapistsForUI(therapistsData)
      setTherapists(formattedTherapists)
      
      // Fetch availability for each therapist
      const availabilityPromises = therapistsData.map(therapist => 
        therapistService.getTherapistAvailability(therapist.id)
          .then(data => ({ id: therapist.id, availability: data.availability }))
          .catch(() => ({ id: therapist.id, availability: {} }))
      )
      
      const availabilityResults = await Promise.all(availabilityPromises)
      const availabilityMap = {}
      availabilityResults.forEach(result => {
        availabilityMap[result.id] = result.availability
      })
      setAvailabilities(availabilityMap)
      
    } catch (err) {
      console.error('Failed to fetch therapists:', err)
      setError('Não foi possível carregar os terapeutas.')
    } finally {
      setLoading(false)
    }
  }

  const formatAvailabilityDates = (availability) => {
    if (!availability || Object.keys(availability).length === 0) {
      return 'Sem horários disponíveis esta semana'
    }
    
    const dates = Object.keys(availability).slice(0, 3) // Show first 3 days
    return dates.map(date => {
      const [year, month, day] = date.split('-')
      const slots = availability[date]
      return `${day}/${month}: ${slots.slice(0, 3).join(', ')}${slots.length > 3 ? '...' : ''}`
    }).join(' | ')
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
        <p className="text-gray-600">Conheça nossa equipe de profissionais e suas disponibilidades</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {therapists.map((therapist) => (
          <Card key={therapist.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-4xl">{therapist.image}</div>
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
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-1" />
                  <span>{therapist.experience}</span>
                </div>
                <div className="flex items-center text-blue-600 font-medium">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{therapist.creditsPerMinute} créditos/min</span>
                </div>
              </div>

              {therapist.bio && (
                <p className="text-sm text-gray-600 line-clamp-2">{therapist.bio}</p>
              )}

              <div className="border-t pt-3">
                <div className="flex items-start space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-700 mb-1">Próximos horários:</p>
                    <p className="text-xs text-gray-600">
                      {formatAvailabilityDates(availabilities[therapist.id])}
                    </p>
                  </div>
                </div>
              </div>

              {therapist.crpNumber && (
                <div className="text-xs text-gray-500 text-center pt-2 border-t">
                  CRP: {therapist.crpNumber}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default TherapistsList