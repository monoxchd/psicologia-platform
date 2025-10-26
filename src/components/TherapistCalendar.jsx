import { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import {
  Plus,
  Edit3,
  Trash2,
  Copy,
  Calendar,
  Clock,
  Users,
  Settings
} from 'lucide-react'
import apiService from '../services/api.js'

export default function TherapistCalendar({ therapistId = 1, editable = true, refreshTrigger = 0 }) {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const calendarRef = useRef(null)

  // Load real availability data from backend
  useEffect(() => {
    loadAvailabilities()
  }, [therapistId, refreshTrigger])

  const loadAvailabilities = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch real availabilities from backend
      const availabilities = await apiService.get(`/therapists/${therapistId}/availabilities`)

      // Convert backend availabilities to FullCalendar events
      const calendarEvents = availabilities.map(availability => {
        const eventDate = availability.date
        const startDateTime = `${eventDate}T${availability.start_time}`
        const endDateTime = `${eventDate}T${availability.end_time}`

        if (availability.available) {
          // Available slot (green)
          return {
            id: `availability-${availability.id}`,
            title: 'Disponível',
            start: startDateTime,
            end: endDateTime,
            backgroundColor: '#10b981',
            borderColor: '#059669',
            extendedProps: {
              type: 'available',
              status: 'open',
              backendId: availability.id,
              notes: availability.notes
            }
          }
        } else {
          // Blocked slot from Google Calendar (red)
          const title = availability.notes || 'Período Bloqueado'
          return {
            id: `blocked-${availability.id}`,
            title: title,
            start: startDateTime,
            end: endDateTime,
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            extendedProps: {
              type: 'blocked',
              reason: availability.notes,
              backendId: availability.id
            }
          }
        }
      })

      // Add some sample booked sessions for demo
      const sampleBookedSessions = [
        {
          id: 'booked-demo-1',
          title: 'Sessão Agendada - Demo',
          start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T10:00:00',
          end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T11:00:00',
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          extendedProps: {
            type: 'booked',
            patientName: 'Paciente Demo',
            status: 'confirmed'
          }
        }
      ]

      setEvents([...calendarEvents, ...sampleBookedSessions])

    } catch (error) {
      console.error('Failed to load availabilities:', error)
      setError('Erro ao carregar disponibilidades')

      // Fallback to empty array if API fails
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (selectInfo) => {
    if (!editable) return

    const title = prompt('Título do período de disponibilidade:')
    const calendarApi = selectInfo.view.calendar

    calendarApi.unselect() // clear date selection

    if (title) {
      const newEvent = {
        id: Date.now().toString(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        backgroundColor: '#10b981',
        borderColor: '#059669',
        extendedProps: {
          type: 'available',
          status: 'open'
        }
      }

      setEvents(prevEvents => [...prevEvents, newEvent])

      // In production, make API call to save
      console.log('🆕 Nova disponibilidade criada:', newEvent)
    }
  }

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event)

    if (!editable) return

    if (clickInfo.event.extendedProps.type === 'booked') {
      alert(`Sessão agendada com: ${clickInfo.event.extendedProps.patientName}`)
      return
    }

    if (confirm(`Deseja remover: '${clickInfo.event.title}'?`)) {
      const eventId = clickInfo.event.id
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
      clickInfo.event.remove()

      // In production, make API call to delete
      console.log('🗑️ Disponibilidade removida:', eventId)
    }
  }

  const handleEventDrop = (dropInfo) => {
    if (!editable) return

    const eventId = dropInfo.event.id
    const updatedEvent = {
      id: eventId,
      title: dropInfo.event.title,
      start: dropInfo.event.start.toISOString(),
      end: dropInfo.event.end?.toISOString(),
      backgroundColor: dropInfo.event.backgroundColor,
      borderColor: dropInfo.event.borderColor,
      extendedProps: dropInfo.event.extendedProps
    }

    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId ? updatedEvent : event
      )
    )

    // In production, make API call to update
    console.log('📝 Disponibilidade atualizada:', updatedEvent)
  }

  const addQuickAvailability = (pattern) => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    let newEvents = []

    if (pattern === 'weekdays') {
      // Add availability for next 5 weekdays, 9am-5pm
      for (let i = 1; i <= 5; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)

        if (date.getDay() >= 1 && date.getDay() <= 5) { // Monday to Friday
          const dateStr = date.toISOString().split('T')[0]
          newEvents.push({
            id: `quick-${Date.now()}-${i}`,
            title: 'Disponível',
            start: `${dateStr}T09:00:00`,
            end: `${dateStr}T17:00:00`,
            backgroundColor: '#10b981',
            borderColor: '#059669',
            extendedProps: {
              type: 'available',
              status: 'open'
            }
          })
        }
      }
    } else if (pattern === 'mornings') {
      // Add morning slots for next 7 days
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]

        newEvents.push({
          id: `quick-morning-${Date.now()}-${i}`,
          title: 'Disponível (Manhã)',
          start: `${dateStr}T08:00:00`,
          end: `${dateStr}T12:00:00`,
          backgroundColor: '#10b981',
          borderColor: '#059669',
          extendedProps: {
            type: 'available',
            status: 'open'
          }
        })
      }
    }

    setEvents(prevEvents => [...prevEvents, ...newEvents])
    console.log(`🚀 Padrão rápido aplicado: ${pattern}`, newEvents)
  }

  const getEventStats = () => {
    const available = events.filter(e => e.extendedProps?.type === 'available').length
    const booked = events.filter(e => e.extendedProps?.type === 'booked').length
    const blocked = events.filter(e => e.extendedProps?.type === 'blocked').length

    return { available, booked, blocked }
  }

  const stats = getEventStats()

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando disponibilidades...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadAvailabilities}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Disponível</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Agendado</p>
                <p className="text-2xl font-bold text-blue-600">{stats.booked}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Bloqueado</p>
                <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Taxa Ocupação</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.available + stats.booked > 0
                    ? Math.round((stats.booked / (stats.available + stats.booked)) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {editable && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuickAvailability('weekdays')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Semana Completa (9h-17h)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuickAvailability('mornings')}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Manhãs (8h-12h)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEvents([])
                  console.log('🧹 Calendário limpo')
                }}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Limpar Tudo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendário de Disponibilidade
            </span>
            {editable && (
              <Badge variant="outline" className="text-xs">
                Clique e arraste para criar slots
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="calendar-wrapper">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              initialView='timeGridWeek'
              editable={editable}
              selectable={editable}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={events}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventDrop}
              height="auto"
              slotMinTime="07:00:00"
              slotMaxTime="20:00:00"
              slotDuration="01:00:00"
              snapDuration="00:30:00"
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
                startTime: '08:00',
                endTime: '18:00',
              }}
              locale="pt-br"
              buttonText={{
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia'
              }}
              allDaySlot={false}
              eventDisplay="block"
            />
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Legenda:</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Disponível para agendamento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Sessão agendada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Período bloqueado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {editable && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Como usar:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Criar:</strong> Clique e arraste no calendário para criar um novo período</li>
              <li>• <strong>Editar:</strong> Arraste as bordas para redimensionar ou mova o evento</li>
              <li>• <strong>Remover:</strong> Clique no evento e confirme a remoção</li>
              <li>• <strong>Visualizar:</strong> Use os botões do cabeçalho para alternar entre mês/semana/dia</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}