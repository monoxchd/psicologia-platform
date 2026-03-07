import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import {
  LogOut, Calendar, Clock, Video, MapPin, ArrowRight,
  BookOpen, Lightbulb, BookMarked, CheckCircle2, Flame,
  Loader2, Sparkles, ChevronRight, Sun, X, MessageCircle
} from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog.jsx'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import authService from '../services/authService'
import appointmentService from '../services/appointmentService'
import activityService from '../services/activityService'
import { blogService } from '../services/blogService'
import horizontalLogo from '../assets/horizontal-logo.png'
import ClientBottomNav from '../components/ClientBottomNav'

const MOOD_EMOJIS = ['', '😞', '😕', '😐', '🙂', '😄']
const MOOD_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981']

function getActivityIcon(type) {
  switch (type) {
    case 'journal': return BookOpen
    case 'reflection': return Lightbulb
    case 'reading': return BookMarked
    default: return BookOpen
  }
}

function formatRelativeDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const diffDays = Math.round((today - date) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `${diffDays} dias atrás`
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-indigo-200/60 bg-white/95 backdrop-blur-sm px-3.5 py-2.5 shadow-lg">
      <p className="text-[11px] font-medium text-gray-400 mb-0.5">
        {new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
      </p>
      <p className="text-lg leading-none">
        {MOOD_EMOJIS[Math.round(d.mood_score)]} <span className="text-sm font-semibold text-gray-700">{d.mood_score.toFixed(1)}</span>
      </p>
    </div>
  )
}

export default function ClientDashboardPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [nextAppointment, setNextAppointment] = useState(null)
  const [stats, setStats] = useState(null)
  const [recentEntries, setRecentEntries] = useState([])
  const [activities, setActivities] = useState([])
  const [articles, setArticles] = useState([])
  const [todayEntries, setTodayEntries] = useState([])

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      navigate('/login')
      return
    }

    async function loadDashboard() {
      try {
        const [currentUser, appointmentsRes, statsRes, entriesRes, activitiesRes, articlesRes] =
          await Promise.allSettled([
            authService.getCurrentUser(),
            appointmentService.getUpcoming(),
            activityService.getStats(),
            activityService.getEntries({ limit: 5 }),
            activityService.getActivities(),
            blogService.getArticles({ limit: 3 })
          ])

        if (currentUser.status === 'fulfilled' && currentUser.value) {
          setUser(currentUser.value)
        } else {
          navigate('/login')
          return
        }

        if (appointmentsRes.status === 'fulfilled') {
          const appts = appointmentsRes.value?.data?.appointments ||
                        appointmentsRes.value?.appointments || []
          if (appts.length > 0) setNextAppointment(appts[0])
        }

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value)
        }

        if (entriesRes.status === 'fulfilled') {
          const entries = entriesRes.value?.entries || []
          setRecentEntries(entries)
          const today = new Date().toISOString().split('T')[0]
          setTodayEntries(entries.filter(e => e.entry_date === today))
        }

        if (activitiesRes.status === 'fulfilled') {
          setActivities(activitiesRes.value?.activities || [])
        }

        if (articlesRes.status === 'fulfilled') {
          setArticles(articlesRes.value?.articles || [])
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [navigate])

  const [cancelling, setCancelling] = useState(false)

  const handleCancel = async () => {
    if (!nextAppointment?.id) return
    setCancelling(true)
    try {
      await appointmentService.cancel(nextAppointment.id)
      setNextAppointment(null)
    } catch (err) {
      console.error('Error cancelling:', err)
    } finally {
      setCancelling(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50/80 via-slate-50/40 to-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600/70" />
          <p className="text-sm text-gray-400 font-medium tracking-wide">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const firstName = user.first_name || user.name?.split(' ')[0] || 'Você'
  const initials = user.first_name && user.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`
    : user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'

  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  const streak = stats?.current_streak || 0
  const moodTrend = stats?.mood_trend || []
  const dailyActivities = activities.filter(a => a.frequency === 'daily')

  const isActivityDoneToday = (slug) =>
    todayEntries.some(e => e.activity_slug === slug)

  const getTodayMoodEntry = () =>
    todayEntries.find(e => e.activity_slug === 'diario-de-humor')

  const getGreetingTime = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/80 via-slate-50/40 to-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/90 via-indigo-50/50 to-slate-100/60" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-indigo-200/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-200/30 to-transparent rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-10">
          <div className="mb-4">
            <img
              src={horizontalLogo}
              alt="Terapia Conecta"
              className="h-6 object-contain opacity-80"
            />
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 ring-2 ring-white/80 shadow-md">
                <AvatarImage src={user.profile_photo} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-indigo-800/70">{getGreetingTime()}</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
                  {firstName}
                </h1>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 hover:bg-white/50 mt-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5">Sair</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-2 pb-24 space-y-6">
        {/* Next Appointment */}
        {nextAppointment ? (
          <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Próxima sessão</span>
                {nextAppointment.starting_soon && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] py-0 px-1.5">
                    Em breve
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={nextAppointment.therapist?.photo} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-bold">
                    {nextAppointment.therapist?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">
                    {nextAppointment.therapist?.name}
                  </p>
                  <p className="text-xs text-gray-400">{nextAppointment.therapist?.specialization}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {nextAppointment.formatted_date || new Date(nextAppointment.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'short', day: 'numeric', month: 'short'
                  })}{' '}
                  {nextAppointment.formatted_time || nextAppointment.time}
                </span>
                <span className="flex items-center gap-1">
                  {nextAppointment.mode === 'online'
                    ? <><Video className="h-3.5 w-3.5" /> Online</>
                    : <><MapPin className="h-3.5 w-3.5" /> Presencial</>
                  }
                </span>
                {nextAppointment.duration && (
                  <span>{nextAppointment.duration} min</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {nextAppointment.meeting_link && nextAppointment.starting_soon && (
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                    onClick={() => window.open(nextAppointment.meeting_link, '_blank')}
                  >
                    <Video className="h-3.5 w-3.5 mr-1" />
                    Entrar na Sessão
                  </Button>
                )}

                {nextAppointment.can_cancel && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg text-gray-500 hover:text-indigo-700 border-gray-200"
                      onClick={() => {
                        const message = encodeURIComponent(
                          `Olá! Gostaria de reagendar minha sessão do dia ${nextAppointment.formatted_date || nextAppointment.date} às ${nextAppointment.formatted_time || nextAppointment.time}. Meu nome é ${firstName}.`
                        )
                        window.open(`https://wa.me/5511914214449?text=${message}`, '_blank')
                      }}
                    >
                      <MessageCircle className="h-3.5 w-3.5 mr-1" />
                      Reagendar
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancelar sessão?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sua sessão com {nextAppointment.therapist?.name} em{' '}
                            {nextAppointment.formatted_date || nextAppointment.date} às{' '}
                            {nextAppointment.formatted_time || nextAppointment.time} será cancelada.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Voltar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {cancelling ? 'Cancelando...' : 'Cancelar sessão'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}

                {!nextAppointment.can_cancel && (
                  <p className="text-xs text-gray-400">
                    Cancelamento indisponível (menos de 24h)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-md bg-gradient-to-r from-indigo-50 to-slate-50/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-700">Nenhuma sessão agendada</p>
                  <p className="text-sm text-gray-500 mt-0.5">Encontre o terapeuta ideal para você</p>
                </div>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-indigo-700 text-white rounded-lg"
                  onClick={() => navigate('/matching')}
                >
                  Agendar Sessão
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Activities */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Sun className="h-5 w-5 text-indigo-500" />
                Hoje
              </h2>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{todayFormatted}</p>
            </div>
            {streak > 0 && (
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200/80 hover:bg-indigo-100 gap-1 py-1 px-2.5 text-xs font-semibold">
                <Flame className="h-3.5 w-3.5" />
                {streak} {streak === 1 ? 'dia' : 'dias'} seguidos
              </Badge>
            )}
          </div>

          <div className="grid gap-3">
            {dailyActivities.map(activity => {
              const done = isActivityDoneToday(activity.slug)
              const Icon = getActivityIcon(activity.activity_type)
              const moodEntry = activity.slug === 'diario-de-humor' ? getTodayMoodEntry() : null

              return (
                <Card
                  key={activity.slug}
                  className={`border-0 shadow-sm transition-all cursor-pointer ${
                    done
                      ? 'bg-emerald-50/80 ring-1 ring-emerald-200/60'
                      : 'bg-white/90 hover:shadow-md hover:ring-1 hover:ring-indigo-200/60 active:scale-[0.99]'
                  }`}
                  onClick={() => !done && navigate(`/atividades/${activity.slug}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        done
                          ? 'bg-emerald-200/60'
                          : 'bg-indigo-100/80'
                      }`}>
                        {done
                          ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          : <Icon className="h-5 w-5 text-indigo-700" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${done ? 'text-emerald-800' : 'text-gray-800'}`}>
                          {activity.title}
                        </p>
                        {done && moodEntry?.mood_score ? (
                          <p className="text-xs text-emerald-600 mt-0.5">
                            Humor: {MOOD_EMOJIS[moodEntry.mood_score]} {['', 'Muito mal', 'Mal', 'Neutro', 'Bem', 'Muito bem'][moodEntry.mood_score]}
                          </p>
                        ) : !done ? (
                          <p className="text-xs text-gray-400 mt-0.5">{activity.description}</p>
                        ) : (
                          <p className="text-xs text-emerald-600 mt-0.5">Concluído</p>
                        )}
                      </div>
                      {!done && (
                        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {dailyActivities.length === 0 && (
              <Card className="border-0 shadow-sm bg-white/90">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-8 w-8 text-indigo-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Atividades diárias aparecerão aqui</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Mood Chart */}
        <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-gray-800">Seu Humor</CardTitle>
          </CardHeader>
          <CardContent>
            {moodTrend.length >= 3 ? (
              <div className="h-48 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moodTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                        <stop offset="50%" stopColor="#818cf8" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#a5b4fc" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={v => {
                        const d = new Date(v + 'T12:00:00')
                        return `${d.getDate()}/${d.getMonth() + 1}`
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[1, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={v => MOOD_EMOJIS[v] || v}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="mood_score"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      fill="url(#moodGradient)"
                      dot={{ r: 3.5, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 5, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="text-3xl mb-2">📊</div>
                <p className="text-sm text-gray-400">
                  Continue registrando seu humor para ver tendências
                </p>
                <p className="text-xs text-gray-300 mt-1">Mínimo de 3 registros</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Readings */}
        {articles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-lg font-bold text-gray-800">Leituras Recomendadas</h2>
              <Link to="/blog" className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-0.5">
                Ver Mais <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-3">
              {articles.slice(0, 3).map(article => (
                <Link
                  key={article.id || article.slug}
                  to={`/blog/${article.slug}`}
                  className="block"
                >
                  <Card className="border-0 shadow-sm bg-white/90 hover:shadow-md transition-all active:scale-[0.99] overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex gap-0">
                        {article.featured_image_url && (
                          <div className="w-24 sm:w-32 shrink-0">
                            <img
                              src={article.featured_image_url}
                              alt=""
                              className="w-full h-full object-cover min-h-[80px]"
                            />
                          </div>
                        )}
                        <div className="p-3.5 flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{article.excerpt}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Feed */}
        {recentEntries.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3 px-1">Atividades Recentes</h2>
            <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
              <CardContent className="p-2">
                <div className="divide-y divide-gray-100">
                  {recentEntries.map(entry => {
                    const Icon = getActivityIcon(entry.activity_type)
                    const isMood = entry.activity_type === 'journal' && entry.mood_score

                    return (
                      <div key={entry.id} className="flex items-center gap-3 px-3 py-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {entry.activity_title}
                          </p>
                          <p className="text-xs text-gray-400">{formatRelativeDate(entry.entry_date)}</p>
                        </div>
                        {isMood && (
                          <span className="text-lg shrink-0">{MOOD_EMOJIS[entry.mood_score]}</span>
                        )}
                        {!isMood && entry.answers && (
                          <p className="text-xs text-gray-400 max-w-[120px] truncate shrink-0">
                            {typeof entry.answers === 'object'
                              ? Object.values(entry.answers).find(v => typeof v === 'string' && v.length > 0) || ''
                              : ''
                            }
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ClientBottomNav />
    </div>
  )
}
