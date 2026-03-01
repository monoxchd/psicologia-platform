import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Star, Calendar, Loader2, Users } from 'lucide-react'
import companyService from '@/services/companyService'
import horizontalLogo from '../assets/horizontal-logo.png'

export default function CompanyMatchingPage() {
  const { slug } = useParams()
  const [company, setCompany] = useState(null)
  const [therapists, setTherapists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await companyService.getCompanyTherapists(slug)
        setCompany(data.company)
        setTherapists(data.therapists)
      } catch (err) {
        setError('Empresa não encontrada.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Empresa não encontrada</h1>
          <p className="text-gray-600">Verifique o link e tente novamente.</p>
        </div>
      </div>
    )
  }

  const primaryColor = company.primary_color || '#4f46e5'
  const secondaryColor = company.secondary_color || '#6366f1'

  const formatNextAvailable = (therapist) => {
    if (!therapist.next_available_date) return null
    const date = new Date(therapist.next_available_date + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let dateStr
    if (date.getTime() === today.getTime()) {
      dateStr = 'Hoje'
    } else if (date.getTime() === tomorrow.getTime()) {
      dateStr = 'Amanhã'
    } else {
      dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
    }
    return `${dateStr} às ${therapist.next_available_time}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to={`/empresa/${slug}`}>
              <img
                src={company.logo_url || horizontalLogo}
                alt={company.logo_url ? `${company.name} Logo` : 'Terapia Conecta Logo'}
                className="h-8 object-contain"
              />
            </Link>
            <span
              className="text-sm font-medium px-3 py-1 rounded-full"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              {company.name}
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="py-12 px-4"
        style={{ background: `linear-gradient(135deg, ${primaryColor}08, ${secondaryColor}12)` }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Nossos Psicólogos
          </h1>
          <p className="text-lg text-gray-600">
            Escolha um profissional e agende sua sessão
          </p>
        </div>
      </section>

      {/* Therapist Grid */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {therapists.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhum psicólogo disponível
              </h2>
              <p className="text-gray-500">
                No momento não há psicólogos vinculados a esta empresa.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {therapists.map((therapist) => {
                const nextAvailable = formatNextAvailable(therapist)
                return (
                  <Card key={therapist.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        {therapist.profile_photo_url ? (
                          <img
                            src={therapist.profile_photo_url}
                            alt={therapist.name}
                            className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                          />
                        ) : (
                          <div
                            className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {therapist.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">{therapist.name}</h3>
                        <p className="text-sm text-gray-500">{therapist.specialty}</p>
                      </div>

                      <div className="flex items-center justify-center gap-3 text-sm text-gray-600 mb-3">
                        {therapist.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {therapist.rating}
                          </span>
                        )}
                        <span className="text-gray-300">|</span>
                        <span>{therapist.experience_display}</span>
                      </div>

                      {therapist.bio && (
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                          {therapist.bio}
                        </p>
                      )}

                      {nextAvailable && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 justify-center">
                          <Calendar className="h-3.5 w-3.5" />
                          Próximo horário: {nextAvailable}
                        </div>
                      )}

                      <Link to={`/empresa/${slug}/agendar/${therapist.id}`}>
                        <Button
                          className="w-full text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Agendar Sessão
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm space-y-2">
          <p>TerapiaConecta — Programa de saúde mental corporativo</p>
          <p>&copy; 2026 TerapiaConecta. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
