import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import creditsService from '@/services/creditsService.js'

export default function SimpleCreditsPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(null)

  // Simple, hardcoded packages for now - we'll enhance later
  const creditPackages = [
    {
      id: 1,
      credits: 30,
      price: 60,
      name: "Pacote Inicial",
      description: "Ideal para experimentar",
      popular: false
    },
    {
      id: 2,
      credits: 60,
      price: 100,
      name: "Pacote Médio",
      description: "Mais popular - melhor valor",
      popular: true
    },
    {
      id: 3,
      credits: 120,
      price: 180,
      name: "Pacote Premium",
      description: "Para cuidado contínuo",
      popular: false
    }
  ]

  const handlePurchase = async (pkg) => {
    setPurchasing(pkg.id)

    try {
      console.log(`🔄 Purchasing ${pkg.credits} credits for R$${pkg.price}...`)

      // Call the REAL backend API
      const response = await creditsService.purchaseCredits(pkg.id)

      if (response.success) {
        console.log(`✅ Purchase successful! New balance: ${response.data.new_balance}`)

        // Redirect to dashboard with success message including real data
        navigate('/simple-dashboard', {
          state: {
            purchaseSuccess: true,
            creditsAdded: pkg.credits,
            newBalance: response.data.new_balance,
            packageName: pkg.name
          }
        })
      } else {
        console.error('Purchase failed:', response.error)
        alert(`Erro na compra: ${response.error}`)
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Erro na compra. Tente novamente.')
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-gray-900">Escolha seu Pacote de Créditos</CardTitle>
            <CardDescription className="text-lg">
              Comece com o pacote que faz mais sentido para você. Sempre pode comprar mais depois!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {creditPackages.map((pkg) => (
                <Card key={pkg.id} className={`relative cursor-pointer transition-all hover:scale-105 ${pkg.popular ? 'ring-2 ring-blue-500' : ''}`}>
                  {pkg.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                      Recomendado
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{pkg.credits} Créditos</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                    <div className="text-4xl font-bold text-blue-600">R${pkg.price}</div>
                    <div className="text-sm text-gray-500">R${(pkg.price / pkg.credits).toFixed(2)} por crédito</div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm mb-6">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {pkg.credits <= 30 ? '1-2 sessões' : pkg.credits <= 60 ? '2-4 sessões' : '4-8 sessões'}
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

                    <Button
                      className="w-full"
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
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Como funciona na prática:</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="text-blue-800">
                  <strong>Check-in rápido:</strong> 15 minutos = 15 créditos
                </div>
                <div className="text-blue-800">
                  <strong>Sessão padrão:</strong> 50 minutos = 50 créditos
                </div>
                <div className="text-blue-800">
                  <strong>Trabalho profundo:</strong> 90 minutos = 90 créditos
                </div>
                <div className="text-blue-800">
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