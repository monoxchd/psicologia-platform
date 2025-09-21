import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import {
  LogOut,
  BookOpen,
  CreditCard,
  Calendar,
  Coins,
  Target,
  TrendingUp
} from 'lucide-react'
import authService from '@/services/authService.js'
import creditsService from '@/services/creditsService.js'
import gamificationService from '@/services/gamificationService.js'
import apiService from '@/services/api.js'

export default function SimpleDashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    credits: 0,
    articlesRead: 0,
    weeklyGoal: 50,
    weeklyProgress: 0,
    sessionsCount: 0,
    totalHours: 0
  })
  const [creditBalance, setCreditBalance] = useState(null)
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false)

  useEffect(() => {
    // Check for purchase success
    if (location.state?.purchaseSuccess) {
      setShowPurchaseSuccess(true)
      // Clear the state and auto-hide after 5 seconds
      setTimeout(() => {
        setShowPurchaseSuccess(false)
      }, 5000)
    }

    const loadUserData = async () => {
      if (!authService.isLoggedIn()) {
        navigate('/login')
        return
      }

      try {
        // Load user profile
        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)

          // Load credit balance
          const balanceResponse = await creditsService.getBalance()
          if (balanceResponse.success) {
            setCreditBalance(balanceResponse.data)

            // Get gamification stats
            const gamificationStats = gamificationService.getAllStats()

            // Update user stats with real data
            setUserStats(prev => ({
              ...prev,
              credits: balanceResponse.data.current_balance || 0,
              sessionsCount: currentUser.stats?.total_sessions || 0,
              totalHours: currentUser.stats?.total_hours || 0,
              articlesRead: gamificationStats.totalArticles,
              weeklyProgress: gamificationStats.weeklyProgress,
              weeklyGoal: gamificationStats.weeklyGoal
            }))
          }
        } else {
          navigate('/login')
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [navigate])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null

  const progressToGoal = (userStats.weeklyProgress / userStats.weeklyGoal) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profile_photo} />
              <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-600">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Olá, {user.first_name || 'Usuário'}!
              </h1>
              <p className="text-gray-600">
                Sua jornada de bem-estar
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Purchase Success Message */}
        {showPurchaseSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Coins className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-green-800">
                  🎉 Compra realizada com sucesso!
                </h3>
                <p className="text-green-700">
                  {location.state?.creditsAdded} créditos foram adicionados à sua conta.
                  {location.state?.newBalance && ` Novo saldo: ${location.state.newBalance} créditos.`}
                </p>
              </div>
              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPurchaseSuccess(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  ✕
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Credit Balance - Prominent Display */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Coins className="h-6 w-6" />
                  <span className="text-lg font-medium">Seus Créditos</span>
                </div>
                <div className="text-4xl font-bold">{userStats.credits}</div>
                <p className="text-blue-100 text-sm">
                  {userStats.credits >= 50
                    ? '🎉 Você pode agendar uma sessão!'
                    : `Faltam ${50 - userStats.credits} créditos para uma sessão`}
                </p>
                {creditBalance?.expires_at && (
                  <p className="text-blue-200 text-xs mt-1">
                    Expira em: {new Date(creditBalance.expires_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100 mb-1">Meta Semanal</div>
                <div className="text-2xl font-bold">{userStats.weeklyProgress}/{userStats.weeklyGoal}</div>
                <Progress value={progressToGoal} className="w-24 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Goal */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold">Próximo Objetivo</h3>
                <p className="text-gray-600">
                  {userStats.credits >= 50
                    ? '🎉 Você já pode agendar sua primeira sessão!'
                    : `Ganhe mais ${50 - userStats.credits} créditos para agendar sua primeira sessão`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Read Articles */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/blog')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Ler Artigos</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">+5 créditos</div>
              <p className="text-gray-600 text-sm mb-4">
                Por artigo lido completo
              </p>
              <div className="text-xs text-gray-500">
                {userStats.articlesRead} artigos lidos ao total
              </div>
            </CardContent>
          </Card>

          {/* Buy Credits */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/credits')}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Comprar Créditos</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">Pacotes</div>
              <p className="text-gray-600 text-sm mb-4">
                A partir de R$60
              </p>
              <div className="text-xs text-gray-500">
                30, 60 ou 120 créditos
              </div>
            </CardContent>
          </Card>

          {/* Book Session */}
          <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${userStats.credits >= 50 ? 'ring-2 ring-green-500' : 'opacity-75'}`} onClick={() => userStats.credits >= 50 && navigate('/matching')}>
            <CardHeader className="text-center">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${userStats.credits >= 50 ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Calendar className={`h-8 w-8 ${userStats.credits >= 50 ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <CardTitle>Agendar Sessão</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className={`text-2xl font-bold mb-2 ${userStats.credits >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                {userStats.credits >= 50 ? 'Disponível!' : '50 créditos'}
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {userStats.credits >= 50 ? 'Escolha seu terapeuta' : 'Mínimo necessário'}
              </p>
              <div className="text-xs text-gray-500">
                {userStats.credits >= 50 ? '✅ Pronto para agendar' : `Faltam ${50 - userStats.credits} créditos`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Progresso Semanal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Créditos Ganhos</span>
                  <span>{userStats.weeklyProgress}/{userStats.weeklyGoal}</span>
                </div>
                <Progress value={progressToGoal} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{userStats.sessionsCount}</div>
                  <div className="text-sm text-gray-500">Sessões Feitas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{userStats.totalHours || 0}h</div>
                  <div className="text-sm text-gray-500">Tempo Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{creditsService.estimateSessionsRemaining(userStats.credits)}</div>
                  <div className="text-sm text-gray-500">Sessões Restantes</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}