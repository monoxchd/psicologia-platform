import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import {
  Clock,
  Calendar,
  User,
  Search,
  Filter,
  Star,
  MessageSquare,
  Download,
  Eye,
  ChevronDown,
  BarChart3,
  TrendingUp,
  Award,
  MapPin
} from 'lucide-react'
import apiService from '@/services/api.js'
import { toast } from 'sonner'

export default function SessionHistory({ user }) {
  const [sessions, setSessions] = useState([])
  const [filteredSessions, setFilteredSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [therapistFilter, setTherapistFilter] = useState('all')
  const [stats, setStats] = useState(null)

  const fetchSessionData = async () => {
    try {
      const [sessionsResponse, statsResponse] = await Promise.all([
        apiService.get('/sessions/history'),
        apiService.get('/sessions/stats')
      ])

      setSessions(sessionsResponse.sessions || [])
      setStats(statsResponse.stats)
    } catch (error) {
      console.error('Error fetching session data:', error)
      toast.error('Erro ao carregar histórico de sessões')

      // Fallback data for development
      const mockSessions = [
        {
          id: 1,
          date: '2024-01-15',
          time: '15:00',
          duration: 50,
          therapist: {
            name: 'Dra. Maria Silva',
            photo: null,
            specialization: 'Terapia Cognitivo-Comportamental',
            location: 'São Paulo, SP'
          },
          status: 'completed',
          rating: 5,
          notes: 'Sessão muito produtiva, trabalhamos ansiedade e estratégias de enfrentamento.',
          type: 'Terapia Individual',
          cost: 50,
          mode: 'online'
        },
        {
          id: 2,
          date: '2024-01-08',
          time: '14:00',
          duration: 45,
          therapist: {
            name: 'Dr. João Santos',
            photo: null,
            specialization: 'Psicanálise',
            location: 'Rio de Janeiro, RJ'
          },
          status: 'completed',
          rating: 4,
          notes: 'Primeira sessão, estabelecemos rapport e definimos objetivos.',
          type: 'Consulta Inicial',
          cost: 45,
          mode: 'presential'
        },
        {
          id: 3,
          date: '2024-01-01',
          time: '10:30',
          duration: 30,
          therapist: {
            name: 'Dra. Ana Costa',
            photo: null,
            specialization: 'Terapia Familiar',
            location: 'Belo Horizonte, MG'
          },
          status: 'completed',
          rating: 5,
          notes: 'Sessão de acompanhamento, progresso significativo.',
          type: 'Acompanhamento',
          cost: 30,
          mode: 'online'
        },
        {
          id: 4,
          date: '2024-01-22',
          time: '16:00',
          duration: 50,
          therapist: {
            name: 'Dra. Maria Silva',
            photo: null,
            specialization: 'Terapia Cognitivo-Comportamental',
            location: 'São Paulo, SP'
          },
          status: 'scheduled',
          rating: null,
          notes: null,
          type: 'Terapia Individual',
          cost: 50,
          mode: 'online'
        }
      ]

      setSessions(mockSessions)
      setStats({
        total_sessions: 8,
        total_hours: 12,
        average_rating: 4.7,
        favorite_therapist: 'Dra. Maria Silva',
        most_common_duration: 50,
        completion_rate: 95
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessionData()
  }, [])

  useEffect(() => {
    let filtered = sessions

    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter)
    }

    if (therapistFilter !== 'all') {
      filtered = filtered.filter(session => session.therapist.name === therapistFilter)
    }

    setFilteredSessions(filtered)
  }, [sessions, searchTerm, statusFilter, therapistFilter])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluída</Badge>
      case 'scheduled':
        return <Badge variant="secondary">Agendada</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>
      case 'no-show':
        return <Badge variant="outline" className="text-red-600">Não compareceu</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getModeBadge = (mode) => {
    return mode === 'online' ?
      <Badge variant="outline" className="text-blue-600">Online</Badge> :
      <Badge variant="outline" className="text-green-600">Presencial</Badge>
  }

  const renderStars = (rating) => {
    if (!rating) return null
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    )
  }

  const uniqueTherapists = [...new Set(sessions.map(s => s.therapist.name))]

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_sessions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completion_rate}% de conclusão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_hours}h</div>
              <p className="text-xs text-muted-foreground">
                {stats.most_common_duration} min por sessão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_rating}</div>
              <div className="flex items-center mt-1">
                {renderStars(Math.round(stats.average_rating))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terapeuta Favorito</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{stats.favorite_therapist}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Mais consultado
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sessões</CardTitle>
          <CardDescription>
            Visualize e gerencie suas sessões passadas e futuras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por terapeuta, tipo ou anotações..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="scheduled">Agendadas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={therapistFilter} onValueChange={setTherapistFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Terapeuta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {uniqueTherapists.map(therapist => (
                  <SelectItem key={therapist} value={therapist}>
                    {therapist}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>

          {/* Session List */}
          <div className="space-y-4">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma sessão encontrada</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={session.therapist.photo} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {session.therapist.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {session.therapist.name}
                            </h3>
                            {getStatusBadge(session.status)}
                            {getModeBadge(session.mode)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {formatDate(session.date)} às {session.time}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {session.duration} minutos
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {session.therapist.location}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {session.type}
                              </p>
                              <p className="text-sm text-gray-500">
                                {session.therapist.specialization}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">
                                {session.cost} créditos
                              </p>
                              {session.rating && renderStars(session.rating)}
                            </div>
                          </div>

                          {session.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <div className="flex items-start space-x-2">
                                <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                                <p className="text-sm text-gray-700">{session.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Detalhes
                        </Button>
                        {session.status === 'completed' && !session.rating && (
                          <Button size="sm">
                            <Star className="h-4 w-4 mr-2" />
                            Avaliar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {filteredSessions.length > 5 && (
            <div className="flex justify-center mt-6">
              <Button variant="outline">
                Carregar Mais
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}