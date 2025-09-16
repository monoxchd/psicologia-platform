import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import {
  User,
  CreditCard,
  Calendar,
  Settings,
  Clock,
  TrendingUp,
  Bell,
  LogOut,
  Edit,
  ChevronRight,
  Activity,
  BookOpen,
  Wallet
} from 'lucide-react'
import authService from '@/services/authService.js'
import urlAuthService from '@/services/urlAuthService.js'
import dashboardService from '@/services/dashboardService.js'
import apiService from '@/services/api.js'
import ProfileManagement from '@/components/dashboard/ProfileManagement.jsx'
import CreditBalance from '@/components/dashboard/CreditBalance.jsx'
import SessionHistory from '@/components/dashboard/SessionHistory.jsx'
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments.jsx'
import AccountSettings from '@/components/dashboard/AccountSettings.jsx'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState(null)
  const [recentSessions, setRecentSessions] = useState([])
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState(null)

  const loadDashboardData = async () => {
    setDataLoading(true)
    setDataError(null)
    try {
      const [stats, sessions, appointments] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentSessions(3),
        dashboardService.getUpcomingAppointments()
      ])

      setDashboardStats(dashboardService.formatStatsForUI(stats))
      setRecentSessions(dashboardService.formatSessionsForUI(sessions))
      setUpcomingAppointments(dashboardService.formatAppointmentsForUI(appointments))
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setDataError('Erro ao carregar dados do dashboard. Tente novamente.')
      // Set fallback data for better UX
      setDashboardStats({
        creditsRemaining: 0,
        totalSessions: 0,
        totalHours: 0,
        sessionsThisMonth: 0,
        averageSessionDuration: 0,
        estimatedSessionsRemaining: 0
      })
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user has UID authentication
      if (!urlAuthService.isAuthenticated()) {
        navigate('/access')
        return
      }

      // For UID-only access, try to get a JWT token first
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      } else {
        // Try to convert UID to JWT token
        const uid = urlAuthService.getValidatedUid()
        try {
          const response = await apiService.post('/auth/uid-to-jwt', { uid })
          if (response.token && response.user) {
            // Set the JWT token for future API calls
            apiService.setAuthToken(response.token)
            authService.user = response.user
            authService.isAuthenticated = true
            localStorage.setItem('user', JSON.stringify(response.user))
            setUser(response.user)
          } else {
            throw new Error('Failed to get JWT token')
          }
        } catch (error) {
          console.error('UID to JWT conversion failed:', error)
          // Fallback to basic user object (but API calls will still fail)
          setUser({
            id: `uid-${uid}`,
            name: 'UID User',
            email: 'uid@access.com',
            user_type: 'client'
          })
        }
      }
      setLoading(false)

      // Load dashboard data after user is set and we have proper auth
      if (currentUser || apiService.getAuthToken()) {
        loadDashboardData()
      }
    }

    checkAuth()
  }, [navigate])

  const handleLogout = () => {
    authService.logout()
    urlAuthService.clearAuth()
    navigate('/access')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null

  const tabs = [
    { value: 'overview', label: 'Visão Geral', icon: Activity },
    { value: 'profile', label: 'Perfil', icon: User },
    { value: 'credits', label: 'Créditos', icon: Wallet },
    { value: 'sessions', label: 'Histórico', icon: BookOpen },
    { value: 'appointments', label: 'Agendamentos', icon: Calendar },
    { value: 'settings', label: 'Configurações', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Bem-vindo ao seu painel de controle
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Error Banner */}
        {dataError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-red-600 text-sm font-medium">{dataError}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadDashboardData}
                disabled={dataLoading}
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation */}
          <TabsList className="grid w-full grid-cols-6 lg:w-fit lg:grid-cols-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Créditos Restantes
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {dataLoading ? '...' : dashboardStats?.creditsRemaining || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ~{dashboardStats?.estimatedSessionsRemaining || 0} sessões restantes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Próxima Sessão
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dataLoading ? '...' : upcomingAppointments[0]?.date || 'Nenhuma'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {upcomingAppointments[0]?.therapist ? `com ${upcomingAppointments[0].therapist}` : 'Agende uma sessão'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Sessões Realizadas
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dataLoading ? '...' : dashboardStats?.totalSessions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{dashboardStats?.sessionsThisMonth || 0} este mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tempo Total
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dataLoading ? '...' : `${dashboardStats?.totalHours || 0}h`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats?.averageSessionDuration || 0}min média por sessão
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesse rapidamente as principais funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="justify-between h-20" onClick={() => navigate('/scheduling')}>
                  <div className="text-left">
                    <div className="font-semibold">Agendar Sessão</div>
                    <div className="text-sm opacity-90">Nova consulta</div>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="justify-between h-20" onClick={() => navigate('/credits')}>
                  <div className="text-left">
                    <div className="font-semibold">Comprar Créditos</div>
                    <div className="text-sm opacity-90">Recarregar conta</div>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="justify-between h-20" onClick={() => setActiveTab('profile')}>
                  <div className="text-left">
                    <div className="font-semibold">Editar Perfil</div>
                    <div className="text-sm opacity-90">Atualizar dados</div>
                  </div>
                  <Edit className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sessões Recentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dataLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((_, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                          </div>
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentSessions.length > 0 ? (
                    recentSessions.map((session, index) => (
                      <div key={session.id || index} className="flex items-center justify-between py-2">
                        <div>
                          <div className="font-medium">{session.therapist}</div>
                          <div className="text-sm text-gray-500">{session.date} • {session.duration}</div>
                        </div>
                        <Badge variant="secondary">{session.status}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Nenhuma sessão realizada ainda
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximos Agendamentos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dataLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((_, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                          </div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                  ) : upcomingAppointments.length > 0 ? (
                    upcomingAppointments.slice(0, 3).map((appointment, index) => (
                      <div key={appointment.id || index} className="flex items-center justify-between py-2">
                        <div>
                          <div className="font-medium">{appointment.therapist}</div>
                          <div className="text-sm text-gray-500">{appointment.date}</div>
                        </div>
                        <Badge variant={appointment.startingSoon ? "default" : "outline"}>
                          {appointment.type}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Nenhum agendamento próximo
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ProfileManagement user={user} setUser={setUser} />
          </TabsContent>

          {/* Credits Tab */}
          <TabsContent value="credits">
            <CreditBalance user={user} />
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <SessionHistory user={user} />
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <UpcomingAppointments user={user} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <AccountSettings user={user} setUser={setUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}