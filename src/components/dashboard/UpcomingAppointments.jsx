import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog.jsx'
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  MessageSquare,
  Plus,
  Edit,
  X,
  AlertCircle,
  ExternalLink,
  User,
  Mail,
  Star,
  Navigation
} from 'lucide-react'
import apiService from '@/services/api.js'
import { toast } from 'sonner'

export default function UpcomingAppointments({ user }) {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)

  const fetchAppointments = async () => {
    try {
      const response = await apiService.get('/appointments/upcoming')
      setAppointments(response.appointments || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Erro ao carregar agendamentos')

      // Fallback data for development
      const mockAppointments = [
        {
          id: 1,
          date: '2024-01-20',
          time: '15:00',
          duration: 50,
          therapist: {
            id: 1,
            name: 'Dra. Maria Silva',
            photo: null,
            specialization: 'Terapia Cognitivo-Comportamental',
            rating: 4.9,
            location: 'São Paulo, SP',
            phone: '+55 11 99999-9999',
            email: 'maria.silva@email.com'
          },
          status: 'confirmed',
          type: 'Terapia Individual',
          mode: 'online',
          cost: 50,
          meeting_link: 'https://meet.example.com/session-123',
          notes: 'Continuação do trabalho sobre ansiedade social',
          can_cancel: true,
          reminder_sent: true
        },
        {
          id: 2,
          date: '2024-01-22',
          time: '10:00',
          duration: 45,
          therapist: {
            id: 2,
            name: 'Dr. João Santos',
            photo: null,
            specialization: 'Psicanálise',
            rating: 4.8,
            location: 'Rio de Janeiro, RJ',
            phone: '+55 21 88888-8888',
            email: 'joao.santos@email.com'
          },
          status: 'confirmed',
          type: 'Consulta de Acompanhamento',
          mode: 'presential',
          cost: 45,
          address: 'Rua das Flores, 123 - Ipanema, Rio de Janeiro',
          notes: 'Avaliação do progresso do tratamento',
          can_cancel: true,
          reminder_sent: false
        },
        {
          id: 3,
          date: '2024-01-25',
          time: '14:30',
          duration: 50,
          therapist: {
            id: 3,
            name: 'Dra. Ana Costa',
            photo: null,
            specialization: 'Terapia Familiar',
            rating: 4.7,
            location: 'Belo Horizonte, MG',
            phone: '+55 31 77777-7777',
            email: 'ana.costa@email.com'
          },
          status: 'pending_confirmation',
          type: 'Terapia de Casal',
          mode: 'online',
          cost: 50,
          meeting_link: 'https://meet.example.com/session-456',
          notes: 'Primeira sessão de terapia de casal',
          can_cancel: true,
          reminder_sent: false
        }
      ]

      setAppointments(mockAppointments)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === now.toDateString()) {
      return 'Hoje'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã'
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }
  }

  const formatTime = (timeString) => {
    return timeString.slice(0, 5)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Confirmada</Badge>
      case 'pending_confirmation':
        return <Badge variant="secondary">Pendente</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>
      case 'completed':
        return <Badge variant="outline">Concluída</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getModeBadge = (mode) => {
    return mode === 'online' ? (
      <Badge variant="outline" className="text-blue-600">
        <Video className="h-3 w-3 mr-1" />
        Online
      </Badge>
    ) : (
      <Badge variant="outline" className="text-green-600">
        <MapPin className="h-3 w-3 mr-1" />
        Presencial
      </Badge>
    )
  }

  const handleCancelAppointment = async (appointmentId) => {
    setCancellingId(appointmentId)
    try {
      await apiService.delete(`/appointments/${appointmentId}`)
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
      toast.success('Agendamento cancelado com sucesso!')
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error('Erro ao cancelar agendamento')
    } finally {
      setCancellingId(null)
    }
  }

  const handleReschedule = (appointmentId) => {
    navigate('/scheduling', { state: { rescheduleId: appointmentId } })
  }

  const handleJoinMeeting = (meetingLink) => {
    window.open(meetingLink, '_blank')
  }

  const isAppointmentSoon = (date, time) => {
    const appointmentDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    const diffMinutes = (appointmentDateTime - now) / (1000 * 60)
    return diffMinutes <= 60 && diffMinutes > 0
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        <Star className="h-3 w-3 text-yellow-400 fill-current" />
        <span className="text-xs text-gray-600">{rating}</span>
      </div>
    )
  }

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
      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Próximos Agendamentos</CardTitle>
              <CardDescription>
                Gerencie suas consultas futuras e mantenha-se organizado
              </CardDescription>
            </div>
            <Button onClick={() => navigate('/scheduling')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum agendamento encontrado
            </h3>
            <p className="text-gray-500 mb-6">
              Você não tem consultas agendadas. Que tal marcar uma?
            </p>
            <Button onClick={() => navigate('/scheduling')}>
              <Plus className="h-4 w-4 mr-2" />
              Agendar Consulta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={appointment.therapist.photo} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                        {appointment.therapist.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.therapist.name}
                        </h3>
                        {getStatusBadge(appointment.status)}
                        {getModeBadge(appointment.mode)}
                        {isAppointmentSoon(appointment.date, appointment.time) && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Em breve
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(appointment.date)} às {formatTime(appointment.time)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {appointment.duration} minutos
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {appointment.therapist.specialization}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.type}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center">
                              {renderStars(appointment.therapist.rating)}
                            </span>
                            <span>{appointment.therapist.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-blue-600">
                            {appointment.cost} créditos
                          </p>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="bg-gray-50 rounded-md p-3 mb-3">
                          <p className="text-sm text-gray-700">
                            <MessageSquare className="h-4 w-4 inline mr-2" />
                            {appointment.notes}
                          </p>
                        </div>
                      )}

                      {/* Location/Meeting Info */}
                      {appointment.mode === 'online' && appointment.meeting_link && (
                        <div className="bg-blue-50 rounded-md p-3 mb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-blue-700">
                              <Video className="h-4 w-4 mr-2" />
                              Link da videochamada disponível
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleJoinMeeting(appointment.meeting_link)}
                              disabled={!isAppointmentSoon(appointment.date, appointment.time)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Entrar
                            </Button>
                          </div>
                        </div>
                      )}

                      {appointment.mode === 'presential' && appointment.address && (
                        <div className="bg-green-50 rounded-md p-3 mb-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-green-700">
                              <MapPin className="h-4 w-4 inline mr-2" />
                              {appointment.address}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(appointment.address)}`, '_blank')}
                            >
                              <Navigation className="h-4 w-4 mr-2" />
                              Rotas
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {appointment.status === 'confirmed' && (
                      <>
                        {appointment.mode === 'online' && appointment.meeting_link &&
                         isAppointmentSoon(appointment.date, appointment.time) && (
                          <Button
                            size="sm"
                            onClick={() => handleJoinMeeting(appointment.meeting_link)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Entrar
                          </Button>
                        )}

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Contato
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Contato - {appointment.therapist.name}</DialogTitle>
                              <DialogDescription>
                                Informações de contato do seu terapeuta
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center space-x-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium">Email</p>
                                  <p className="text-sm text-gray-600">{appointment.therapist.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Phone className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium">Telefone</p>
                                  <p className="text-sm text-gray-600">{appointment.therapist.phone}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <MapPin className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium">Localização</p>
                                  <p className="text-sm text-gray-600">{appointment.therapist.location}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}

                    {appointment.can_cancel && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReschedule(appointment.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Reagendar
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja cancelar este agendamento com {appointment.therapist.name}?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Manter</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelAppointment(appointment.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={cancellingId === appointment.id}
                              >
                                {cancellingId === appointment.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Cancelando...
                                  </>
                                ) : (
                                  'Sim, cancelar'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                Dicas para suas consultas
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Teste sua conexão de internet antes de sessões online</li>
                <li>• Chegue 5 minutos antes para consultas presenciais</li>
                <li>• Cancele com pelo menos 24h de antecedência</li>
                <li>• Mantenha suas informações de contato atualizadas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}