import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import creditsService from '@/services/creditsService.js'

export default function CreditsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const formData = location.state?.formData || {}

  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null) // Track which package is being purchased
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = async () => {
    try {
      setLoading(true)
      const response = await creditsService.getPackages()
      if (response.success) {
        setPackages(response.data)
      } else {
        setError('Erro ao carregar pacotes')
      }
    } catch (error) {
      console.error('Error loading packages:', error)
      setError('Erro ao carregar pacotes')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (packageData) => {
    setPurchasing(packageData.id)
    setError(null)

    try {
      const response = await creditsService.purchaseCredits(packageData.id)

      if (response.success) {
        // Show success and redirect to dashboard
        navigate('/dashboard', {
          state: {
            purchaseSuccess: true,
            creditsAdded: packageData.credits,
            newBalance: response.new_balance
          }
        })
      } else {
        setError(response.error || 'Erro ao processar compra')
      }
    } catch (error) {
      console.error('Error purchasing credits:', error)
      setError('Erro ao processar compra. Tente novamente.')
    } finally {
      setPurchasing(null)
    }
  }

  // Legacy function for the original flow (form → credits → matching)
  const handleCreditSelection = (credits) => {
    navigate('/matching', { state: { formData, selectedCredits: credits } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-gray-900">Escolha seu Pacote de Créditos</CardTitle>
            <CardDescription className="text-lg">
              Comece com o pacote que faz mais sentido para você. Sempre pode comprar mais depois!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
                <Button variant="outline" onClick={loadPackages} className="mt-2">
                  Tentar Novamente
                </Button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-gray-600">Carregando pacotes...</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                <Card key={pkg.id} className={`relative cursor-pointer transition-all hover:scale-105 ${pkg.popular ? 'ring-2 ring-indigo-500' : ''}`}>
                  {pkg.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                      Recomendado
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{pkg.credits || 0} Créditos</CardTitle>
                    <CardDescription>{pkg.description || 'Pacote de créditos'}</CardDescription>
                    <div className="text-4xl font-bold text-primary">R${pkg.price || 0}</div>
                    <div className="text-sm text-gray-500">R${(pkg.price_per_credit || (pkg.price/pkg.credits) || 0).toFixed(2)} por crédito</div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm mb-6">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {pkg.sessions_estimate || `${Math.floor(pkg.credits / 50)} a ${Math.floor(pkg.credits / 30)} sessões`}
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Flexibilidade total de tempo
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Válido por 6 meses
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Acesso a todos psicólogos
                      </li>
                    </ul>

                    {/* Purchase Button - NEW FLOW */}
                    <Button
                      className="w-full mb-2"
                      onClick={() => handlePurchase(pkg)}
                      variant={pkg.popular ? "default" : "outline"}
                      disabled={purchasing === pkg.id}
                    >
                      {purchasing === pkg.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Comprar Este Pacote
                        </>
                      )}
                    </Button>

                    {/* Legacy Button - for original form flow */}
                    {formData && Object.keys(formData).length > 0 && (
                      <Button
                        className="w-full"
                        onClick={() => handleCreditSelection(pkg.credits)}
                        variant="outline"
                        size="sm"
                      >
                        Continuar com Avaliação
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
              </div>
            )}

            <div className="mt-12 bg-indigo-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-900 mb-4">💡 Como funciona na prática:</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="text-indigo-800">
                  <strong>Check-in rápido:</strong> 15 minutos = 15 créditos
                </div>
                <div className="text-indigo-800">
                  <strong>Sessão padrão:</strong> 50 minutos = 50 créditos
                </div>
                <div className="text-indigo-800">
                  <strong>Trabalho profundo:</strong> 90 minutos = 90 créditos
                </div>
                <div className="text-indigo-800">
                  <strong>Emergência:</strong> 10 minutos = 10 créditos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}