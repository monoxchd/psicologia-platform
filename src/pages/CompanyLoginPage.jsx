import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import LoginForm from '@/components/auth/LoginForm'
import authService from '@/services/authService'
import companyService from '@/services/companyService'
import horizontalLogo from '../assets/horizontal-logo.png'

export default function CompanyLoginPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLogging, setIsLogging] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchCompany() {
      try {
        const data = await companyService.getCompanyBySlug(slug)
        setCompany(data.company)
      } catch {
        setCompany(null)
      } finally {
        setLoading(false)
      }
    }
    fetchCompany()
  }, [slug])

  // If already logged in, redirect
  useEffect(() => {
    if (authService.isLoggedIn()) {
      const redirect = searchParams.get('redirect') || `/empresa/${slug}/psicologos`
      navigate(redirect, { replace: true })
    }
  }, [slug, navigate, searchParams])

  const handleLogin = async (values) => {
    setIsLogging(true)
    setError('')

    try {
      const response = await authService.login(values.email, values.password)

      if (response.success) {
        const redirect = searchParams.get('redirect') || `/empresa/${slug}/psicologos`
        navigate(decodeURIComponent(redirect), { replace: true })
      } else {
        setError(response.error || 'Falha no login. Por favor, tente novamente.')
      }
    } catch {
      setError('Falha no login. Por favor, tente novamente.')
    } finally {
      setIsLogging(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const primaryColor = company?.primary_color || '#4f46e5'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to={`/empresa/${slug}`}>
              <img
                src={company?.logo_url || horizontalLogo}
                alt={company?.logo_url ? `${company.name} Logo` : 'Terapia Conecta Logo'}
                className="h-8 object-contain"
              />
            </Link>
            {company?.name && (
              <span
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                {company.name}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Login */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <LoginForm onSubmit={handleLogin} isLoading={isLogging} />

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Ainda não tem conta?{' '}
              <Link
                to={`/empresa/${slug}/cadastro`}
                className="font-medium hover:underline"
                style={{ color: primaryColor }}
              >
                Cadastre-se
              </Link>
            </p>
            <Link to={`/empresa/${slug}`} className="block text-sm text-gray-500 hover:text-gray-700">
              &larr; Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
