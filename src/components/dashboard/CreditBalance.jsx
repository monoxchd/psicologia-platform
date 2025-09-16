import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import {
  CreditCard,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Wallet,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import apiService from '@/services/api.js'
import { toast } from 'sonner'

export default function CreditBalance({ user }) {
  const navigate = useNavigate()
  const [credits, setCredits] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [creditPackages, setCreditPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchCreditData = async () => {
    try {
      const [creditsResponse, transactionsResponse, packagesResponse] = await Promise.all([
        apiService.get('/credits/balance'),
        apiService.get('/credits/transactions', { limit: 10 }),
        apiService.get('/credits/packages')
      ])

      setCredits(creditsResponse.credits)
      setTransactions(transactionsResponse.transactions || [])
      setCreditPackages(packagesResponse.packages || [])
    } catch (error) {
      console.error('Error fetching credit data:', error)
      toast.error('Erro ao carregar dados dos créditos')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchCreditData()
    setRefreshing(false)
    toast.success('Dados atualizados!')
  }

  useEffect(() => {
    fetchCreditData()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const handlePurchaseCredits = async (packageId) => {
    try {
      const response = await apiService.post('/credits/purchase', { package_id: packageId })
      toast.success(response.message || 'Créditos comprados com sucesso!')
      await fetchCreditData() // Refresh data
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error('Erro ao comprar créditos: ' + (error.message || 'Tente novamente'))
    }
  }

  const getDaysUntilExpiry = (dateString) => {
    if (!dateString) return null
    const today = new Date()
    const expiryDate = new Date(dateString)
    const diffTime = expiryDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getTransactionIcon = (type, status) => {
    if (type === 'purchase') return <Plus className="h-4 w-4 text-green-500" />
    if (type === 'usage') return <Clock className="h-4 w-4 text-blue-500" />
    if (type === 'refund') return <RefreshCw className="h-4 w-4 text-orange-500" />
    return <Wallet className="h-4 w-4 text-gray-500" />
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending': return <Clock className="h-4 w-4 text-orange-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }


  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const daysUntilExpiry = credits?.days_until_expiry || getDaysUntilExpiry(credits?.expires_at)
  const usagePercentage = credits?.usage_percentage || (credits ? ((credits.total_used / credits.total_purchased) * 100) : 0)

  return (
    <div className="space-y-6">
      {/* Credit Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {credits?.current_balance || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ~{credits?.sessions_remaining_estimate || Math.floor((credits?.current_balance || 0) / 50)} sessões restantes
            </p>
            {daysUntilExpiry !== null && (
              <div className="mt-2">
                {daysUntilExpiry <= 30 ? (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Expira em {daysUntilExpiry} dias
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Expira em {daysUntilExpiry} dias
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Adquirido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {credits?.total_purchased || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Última compra: {formatDate(credits?.last_purchase)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilizado</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {credits?.total_used || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {usagePercentage.toFixed(1)}% dos créditos adquiridos
            </p>
            <Progress
              value={usagePercentage}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Buy Credits */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Comprar Mais Créditos</CardTitle>
            <CardDescription>
              Escolha o pacote que melhor se adequa às suas necessidades
            </CardDescription>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {creditPackages.length > 0 ? (
              creditPackages.map((pkg, index) => (
                <Card key={pkg.id || index} className={`cursor-pointer transition-all hover:scale-105 ${pkg.popular ? 'ring-2 ring-blue-500' : ''}`}>
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                      Recomendado
                    </Badge>
                  )}
                  <CardHeader className="text-center relative">
                    <CardTitle className="text-xl">{pkg.credits} Créditos</CardTitle>
                    <CardDescription className="text-xs">{pkg.description}</CardDescription>
                    <div className="text-3xl font-bold text-blue-600">{pkg.formatted_price || `R$${pkg.price}`}</div>
                    <div className="text-xs text-gray-500">R${pkg.price_per_credit?.toFixed(2) || (pkg.price/pkg.credits).toFixed(2)} por crédito</div>
                    {pkg.sessions_estimate && (
                      <div className="text-xs text-gray-400">~{pkg.sessions_estimate} sessões</div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => handlePurchaseCredits(pkg.id)}
                      variant={pkg.popular ? "default" : "outline"}
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Comprar
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum pacote disponível no momento</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>
            Últimas movimentações da sua conta de créditos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div key={transaction.id || index} className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(transaction.type, transaction.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">
                          {formatDate(transaction.date)}
                        </p>
                        {getStatusIcon(transaction.status)}
                        <span className="text-xs text-gray-500 capitalize">
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.type === 'purchase' ? 'Compra' :
                       transaction.type === 'usage' ? 'Uso' : 'Reembolso'}
                    </p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="flex justify-center pt-4">
                <Button variant="outline" size="sm">
                  Ver Histórico Completo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Credit Warning */}
      {credits?.low_balance && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-orange-800">
                  Saldo baixo de créditos
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  Você tem apenas {credits.current_balance} créditos restantes.
                  Considere recarregar para não interromper suas sessões.
                </p>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    if (creditPackages.length > 0) {
                      const popularPackage = creditPackages.find(p => p.popular) || creditPackages[0]
                      handlePurchaseCredits(popularPackage.id)
                    } else {
                      navigate('/credits')
                    }
                  }}
                >
                  Comprar Créditos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}