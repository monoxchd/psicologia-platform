import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from '../components/ui/dialog'
import {
  FileText,
  PlusCircle,
  User,
  Eye,
  Calendar,
  CalendarDays,
  Edit,
  LogOut,
  ClipboardList,
  Clock,
  Loader2,
  Phone,
  Mail,
  Sun,
  Wallet,
  Video
} from 'lucide-react'
import { getMeetingProvider } from '../utils/meetingProvider'
import AvailabilityGrid from '../components/AvailabilityGrid'
import authService from '../services/authService'
import appointmentService from '../services/appointmentService'
import { blogService } from '../services/blogService'
import horizontalLogo from '../assets/horizontal-logo.png'

const APPOINTMENT_STATUS_LABEL = {
  pending_payment:      'Aguardando pagamento',
  pending_confirmation: 'Pendente',
  confirmed:            'Confirmado',
  completed:            'Realizado',
  cancelled:            'Cancelado',
  no_show:              'Não compareceu',
  expired:              'Expirado',
}

const APPOINTMENT_STATUS_BADGE = {
  pending_payment:      'bg-orange-100 text-orange-800 border-orange-200',
  pending_confirmation: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed:            'bg-emerald-100 text-emerald-800 border-emerald-200',
  completed:            'bg-blue-100 text-blue-800 border-blue-200',
  cancelled:            'bg-gray-100 text-gray-600 border-gray-200',
  no_show:              'bg-rose-100 text-rose-800 border-rose-200',
  expired:              'bg-gray-100 text-gray-500 border-gray-200',
}

const BR_TZ = 'America/Sao_Paulo'

function formatUpcomingDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', timeZone: BR_TZ })
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: BR_TZ })
}

const TherapistDashboardPage = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [articles, setArticles] = useState([])
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0
  })
  const [todayAppointments, setTodayAppointments] = useState([])
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authService.isLoggedIn() || !authService.isTherapist()) {
      navigate('/login', { replace: true })
      return
    }
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Get current user
      const currentUser = await authService.getCurrentUser()
      if (!currentUser) {
        navigate('/login', { replace: true })
        return
      }
      setUser(currentUser)

      // Fetch appointments (fire-and-forget — don't block dashboard if it fails)
      appointmentService.getTherapistAppointments()
        .then(res => {
          setTodayAppointments(res?.today || [])
          setUpcomingAppointments(res?.upcoming || [])
        })
        .catch(err => console.error('Error loading appointments:', err))

      // Get therapist's articles
      const token = localStorage.getItem('auth_token')
      const articlesResponse = await blogService.getMyArticles(token)

      if (articlesResponse.articles) {
        const userArticles = articlesResponse.articles

        // Calculate stats
        const published = userArticles.filter(a => a.status === 'published')
        const drafts = userArticles.filter(a => a.status === 'draft')
        const totalViews = published.reduce((sum, article) => sum + (article.views_count || 0), 0)

        setStats({
          totalArticles: userArticles.length,
          publishedArticles: published.length,
          draftArticles: drafts.length,
          totalViews: totalViews
        })

        // Get recent articles (last 3)
        setArticles(userArticles.slice(0, 3))
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500 font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <img
              src={horizontalLogo}
              alt="Terapia Conecta"
              className="h-8 object-contain"
            />
          </div>
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bem-vindo, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie seu perfil e artigos
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <DashboardStats
          stats={stats}
          todayAppointments={todayAppointments}
          upcomingAppointments={upcomingAppointments}
        />

        {/* Appointments — Today highlighted + upcoming */}
        <AppointmentsSection
          todayAppointments={todayAppointments}
          upcomingAppointments={upcomingAppointments}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Gerencie seu conteúdo e perfil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/blog-admin/new">
                    <Button className="w-full" size="lg">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Novo Artigo
                    </Button>
                  </Link>
                  <Link to="/blog-admin">
                    <Button variant="outline" className="w-full" size="lg">
                      <FileText className="h-4 w-4 mr-2" />
                      Meus Artigos
                    </Button>
                  </Link>
                  <Link to="/therapist/profile/edit">
                    <Button variant="outline" className="w-full" size="lg">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Articles */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Artigos Recentes</CardTitle>
                    <CardDescription>
                      Seus últimos artigos criados
                    </CardDescription>
                  </div>
                  <Link to="/blog-admin">
                    <Button variant="ghost" size="sm">
                      Ver Todos →
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {articles.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Você ainda não criou nenhum artigo
                    </p>
                    <Link to="/blog-admin/new">
                      <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Criar Primeiro Artigo
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {article.title}
                            </h3>
                            <Badge
                              className={
                                article.status === 'published'
                                  ? 'bg-green-100 text-green-800'
                                  : article.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {article.status === 'published'
                                ? 'Publicado'
                                : article.status === 'draft'
                                ? 'Rascunho'
                                : 'Arquivado'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(article.updated_at)}
                            </span>
                            {article.status === 'published' && (
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {article.views_count} visualizações
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Link to={`/blog-admin/${article.slug}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {article.status === 'published' && (
                            <Link to={`/blog/${article.slug}`} target="_blank">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Seu Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{user?.name}</h3>
                  <p className="text-sm text-gray-600">{user?.specialty}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    CRP: {user?.crp_number || 'Não informado'}
                  </p>
                </div>
                {user?.bio && (
                  <p className="text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded">
                    {user.bio}
                  </p>
                )}
                <Link to="/therapist/profile/edit">
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Triagem Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Triagem
                </CardTitle>
                <CardDescription>
                  Respostas dos questionários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/therapist/questionarios/questionario-de-acolhimento/respostas">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Respostas Acolhimento
                  </Button>
                </Link>
                <Link to="/therapist/questionarios/questionario-psicossocial-trabalho-altura/respostas">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Respostas Trabalho em Altura
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Disponibilidade — Full Width */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Disponibilidade
            </CardTitle>
            <CardDescription>
              Configure seus horários de atendimento — clique ou arraste para selecionar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvailabilityGrid appointments={[...todayAppointments, ...upcomingAppointments]} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardStats({ stats, todayAppointments, upcomingAppointments }) {
  const allUpcoming = [...todayAppointments, ...upcomingAppointments]
  const upcomingCount = allUpcoming.length
  // Receita prevista: agendamentos pagos (cost > 0) ainda não cancelados.
  // Exclui B2B (cost = 0) e ignora bookings em pending_payment que ainda
  // podem expirar não contar nenhum valor garantido — só confirmed entram.
  const expectedRevenue = allUpcoming
    .filter(a => a.status === 'confirmed' && parseFloat(a.cost) > 0)
    .reduce((sum, a) => sum + parseFloat(a.cost || 0), 0)
  const pendingPaymentCount = allUpcoming.filter(a => a.status === 'pending_payment').length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Próximos Atendimentos</CardTitle>
          <CalendarDays className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingCount}</div>
          <p className="text-xs text-gray-600 mt-1">
            {todayAppointments.length > 0
              ? `${todayAppointments.length} hoje · ${upcomingAppointments.length} adiante`
              : 'sessões agendadas'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Prevista</CardTitle>
          <Wallet className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {expectedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {pendingPaymentCount > 0
              ? `+ ${pendingPaymentCount} aguardando pagamento`
              : 'sessões confirmadas'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Artigos</CardTitle>
          <FileText className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalArticles}</div>
          <p className="text-xs text-gray-600 mt-1">
            {stats.publishedArticles} publicados, {stats.draftArticles} rascunhos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
          <Eye className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalViews}</div>
          <p className="text-xs text-gray-600 mt-1">
            Em {stats.publishedArticles} artigos
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function JoinMeetingButton({ appointment }) {
  const url = appointment?.meeting_link
  if (!url) return null
  const provider = getMeetingProvider(url)
  const isStartingSoon = !!appointment?.starting_soon
  const label = provider?.id && provider.id !== 'generic'
    ? `Entrar pelo ${provider.name}`
    : 'Entrar na sala'
  return (
    <div className="mt-3">
      <Button
        size="sm"
        onClick={() => window.open(url, '_blank', 'noopener')}
        className={isStartingSoon
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}
      >
        <Video className="h-4 w-4 mr-2" />
        {label}
        {isStartingSoon && <span className="ml-2 text-xs opacity-90">· começando agora</span>}
      </Button>
    </div>
  )
}

function AppointmentRow({ appointment, showDate = true }) {
  const c = appointment.client
  return (
    <div className="flex items-center justify-between gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-900 truncate">{c?.name || 'Cliente'}</p>
          <Badge
            variant="outline"
            className={`text-xs ${APPOINTMENT_STATUS_BADGE[appointment.status] || ''}`}
          >
            {APPOINTMENT_STATUS_LABEL[appointment.status] || appointment.status}
          </Badge>
        </div>
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1 capitalize">
            <Clock className="h-3 w-3" />
            {showDate ? `${formatUpcomingDate(appointment.scheduled_at)} · ` : ''}{formatTime(appointment.scheduled_at)}
            {appointment.duration ? ` · ${appointment.duration}min` : ''}
          </span>
          {appointment.service?.name && (
            <span className="truncate">{appointment.service.name}</span>
          )}
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-end text-xs text-gray-500 gap-0.5">
        {c?.phone && (
          <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>
        )}
        {c?.email && (
          <span className="inline-flex items-center gap-1 truncate max-w-[200px]" title={c.email}>
            <Mail className="h-3 w-3" />{c.email}
          </span>
        )}
      </div>
    </div>
  )
}

function AppointmentsSection({ todayAppointments, upcomingAppointments }) {
  const totalCount = todayAppointments.length + upcomingAppointments.length
  const isEmpty = totalCount === 0
  // Próximo no tempo: prioriza o primeiro de hoje (já ordenado pelo backend),
  // depois o primeiro de upcoming.
  const nextAppointment = todayAppointments[0] || upcomingAppointments[0] || null
  const nextIsToday = !!todayAppointments[0]

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Próximo Agendamento
            </CardTitle>
            <CardDescription>
              {nextIsToday ? 'Sua próxima sessão é hoje' : 'Sua próxima sessão agendada'}
            </CardDescription>
          </div>
          {totalCount > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  Ver todos ({totalCount})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Todos os agendamentos</DialogTitle>
                  <DialogDescription>
                    Suas sessões confirmadas e pendentes de confirmação
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {todayAppointments.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2 flex items-center gap-1.5">
                        <Sun className="h-3.5 w-3.5" />
                        Hoje
                      </h4>
                      <div className="space-y-2">
                        {todayAppointments.map(a => (
                          <AppointmentRow key={a.id} appointment={a} showDate={false} />
                        ))}
                      </div>
                    </div>
                  )}
                  {upcomingAppointments.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                        Próximos
                      </h4>
                      <div className="space-y-2">
                        {upcomingAppointments.map(a => (
                          <AppointmentRow key={a.id} appointment={a} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="text-center py-8 text-sm text-gray-500">
            <CalendarDays className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            Você não tem agendamentos no momento.
          </div>
        ) : (
          <div className={nextIsToday ? 'rounded-lg border-2 border-amber-200 bg-amber-50/40 p-4' : ''}>
            {nextIsToday && (
              <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-3 flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5" />
                Hoje
              </h4>
            )}
            <AppointmentRow appointment={nextAppointment} showDate={!nextIsToday} />
            <JoinMeetingButton appointment={nextAppointment} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TherapistDashboardPage
