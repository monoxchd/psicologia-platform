import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { ClipboardList, UserCheck, HeartHandshake, ArrowRight, Star, Loader2 } from 'lucide-react'
import companyService from '@/services/companyService'
import CompanyHeader from '@/components/CompanyHeader.jsx'

export default function CompanyLandingPage() {
  const { slug } = useParams()
  const [company, setCompany] = useState(null)
  const [therapists, setTherapists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCompany() {
      try {
        const data = await companyService.getCompanyBySlug(slug)
        setCompany(data.company)
        setTherapists(data.therapists)
      } catch (err) {
        setError('Empresa não encontrada.')
      } finally {
        setLoading(false)
      }
    }
    fetchCompany()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Empresa não encontrada</h1>
          <p className="text-gray-600">Verifique o link e tente novamente.</p>
        </div>
      </div>
    )
  }

  const primaryColor = company.primary_color || '#4f46e5'
  const secondaryColor = company.secondary_color || '#6366f1'

  return (
    <div className="min-h-screen bg-white">
      <CompanyHeader company={company} slug={slug} />

      {/* Hero */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${primaryColor}08, ${secondaryColor}12)` }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Programa de Saúde Mental{' '}
            <span style={{ color: primaryColor }}>{company.name}</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
            {company.description || `Sua empresa investe no seu bem-estar. Acesse atendimento psicológico de qualidade, de forma prática e confidencial.`}
          </p>
          <Link to={`/empresa/${slug}/cadastro`}>
            <Button
              className="py-6 px-8 text-lg font-semibold rounded-lg inline-flex items-center gap-2 text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Quero me cadastrar
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Como funciona?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-sm">
              <CardHeader>
                <div
                  className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <ClipboardList className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <CardTitle className="text-lg">1. Cadastre-se</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Crie sua conta usando o email corporativo. O processo é rápido e seguro.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-sm">
              <CardHeader>
                <div
                  className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <UserCheck className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <CardTitle className="text-lg">2. Preencha o questionário</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Responda algumas perguntas para que possamos entender melhor suas necessidades.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-sm">
              <CardHeader>
                <div
                  className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <HeartHandshake className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <CardTitle className="text-lg">3. Receba acolhimento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Nossa equipe de psicólogos analisará suas respostas e entrará em contato.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Nossos Psicólogos */}
      {therapists.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Nossos Psicólogos
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {therapists.map((therapist) => (
                <Card key={therapist.id} className="border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    {therapist.profile_photo_url ? (
                      <img
                        src={therapist.profile_photo_url}
                        alt={therapist.name}
                        className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                      />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {therapist.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">{therapist.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{therapist.specialty}</p>
                    {therapist.rating && (
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-3">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {therapist.rating}
                        <span className="text-gray-400 ml-1">
                          · {therapist.experience_years} anos
                        </span>
                      </div>
                    )}
                    {therapist.bio && (
                      <p className="text-sm text-gray-600 line-clamp-3">{therapist.bio}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${primaryColor}08, ${secondaryColor}12)` }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pronto para cuidar da sua saúde mental?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            O cadastro é rápido, gratuito e 100% confidencial. Sua empresa não tem acesso às suas informações pessoais.
          </p>
          <Link to={`/empresa/${slug}/cadastro`}>
            <Button
              className="py-6 px-8 text-lg font-semibold rounded-lg inline-flex items-center gap-2 text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Criar minha conta
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm space-y-2">
          <p>TerapiaConecta — Programa de saúde mental corporativo</p>
          <p>&copy; 2026 TerapiaConecta. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
