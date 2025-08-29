import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Calendar, Clock, Plus, Trash2, Save, User } from 'lucide-react'

export default function TherapistAvailability({ therapistId = "ana-silva" }) {
  const [selectedDate, setSelectedDate] = useState('')
  const [newTimeSlot, setNewTimeSlot] = useState('')
  const [availability, setAvailability] = useState({
    "2025-06-29": ["09:00", "10:00", "14:00", "15:00", "16:00"],
    "2025-06-30": ["09:00", "11:00", "14:00", "15:00"],
    "2025-07-01": ["10:00", "11:00", "14:00", "16:00", "17:00"],
    "2025-07-02": ["09:00", "10:00", "15:00", "16:00"],
    "2025-07-03": ["14:00", "15:00", "16:00", "17:00"]
  })

  // Generate next 14 days for availability management
  const getDateOptions = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      dates.push({
        date: dateStr,
        display: date.toLocaleDateString('pt-BR', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        }),
        fullDisplay: date.toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        })
      })
    }
    return dates
  }

  const addTimeSlot = () => {
    if (!selectedDate || !newTimeSlot) return
    
    setAvailability(prev => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newTimeSlot].sort()
    }))
    setNewTimeSlot('')
  }

  const removeTimeSlot = (date, time) => {
    setAvailability(prev => ({
      ...prev,
      [date]: prev[date].filter(t => t !== time)
    }))
  }

  const addQuickSlots = (date, type) => {
    let slots = []
    if (type === 'morning') {
      slots = ['09:00', '10:00', '11:00']
    } else if (type === 'afternoon') {
      slots = ['14:00', '15:00', '16:00', '17:00']
    } else if (type === 'evening') {
      slots = ['18:00', '19:00', '20:00']
    }
    
    setAvailability(prev => ({
      ...prev,
      [date]: [...new Set([...(prev[date] || []), ...slots])].sort()
    }))
  }

  const dateOptions = getDateOptions()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Gerenciar Disponibilidade
          </CardTitle>
          <CardDescription>
            Configure seus horários disponíveis para os próximos dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Date Selection and Quick Actions */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Selecionar Data
              </Label>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {dateOptions.map((dateObj) => (
                  <Button
                    key={dateObj.date}
                    variant={selectedDate === dateObj.date ? "default" : "outline"}
                    className="justify-start h-auto p-3"
                    onClick={() => setSelectedDate(dateObj.date)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{dateObj.display}</div>
                      <div className="text-xs opacity-70">{dateObj.fullDisplay}</div>
                      {availability[dateObj.date] && (
                        <Badge variant="secondary" className="mt-1">
                          {availability[dateObj.date].length} horários
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Time Management */}
            <div>
              {selectedDate && (
                <>
                  <Label className="text-base font-semibold mb-3 block">
                    Horários para {dateOptions.find(d => d.date === selectedDate)?.display}
                  </Label>
                  
                  {/* Quick Add Buttons */}
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">Adicionar Períodos:</Label>
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addQuickSlots(selectedDate, 'morning')}
                      >
                        Manhã (9h-11h)
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addQuickSlots(selectedDate, 'afternoon')}
                      >
                        Tarde (14h-17h)
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addQuickSlots(selectedDate, 'evening')}
                      >
                        Noite (18h-20h)
                      </Button>
                    </div>
                  </div>

                  {/* Manual Time Add */}
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">Adicionar Horário Específico:</Label>
                    <div className="flex gap-2">
                      <Input
                        type="time"
                        value={newTimeSlot}
                        onChange={(e) => setNewTimeSlot(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={addTimeSlot} disabled={!newTimeSlot}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Current Time Slots */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Horários Configurados:</Label>
                    {availability[selectedDate]?.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availability[selectedDate].map((time) => (
                          <div 
                            key={time}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded"
                          >
                            <span className="font-medium">{time}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeTimeSlot(selectedDate, time)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Nenhum horário configurado para esta data</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resumo da Disponibilidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(availability)
              .filter(([date, times]) => times.length > 0)
              .map(([date, times]) => {
                const dateObj = new Date(date)
                const displayDate = dateObj.toLocaleDateString('pt-BR', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short' 
                })
                return (
                  <Card key={date} className="p-3">
                    <div className="font-medium mb-2">{displayDate}</div>
                    <div className="flex flex-wrap gap-1">
                      {times.map(time => (
                        <Badge key={time} variant="secondary" className="text-xs">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )
              })}
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total: {Object.values(availability).flat().length} horários disponíveis
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Salvar Disponibilidade
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas para Otimizar sua Agenda:</h4>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Configure horários em blocos para maximizar eficiência</li>
            <li>• Deixe 10-15 minutos entre sessões para anotações</li>
            <li>• Considere horários de almoço e final de tarde (maior demanda)</li>
            <li>• Atualize sua disponibilidade semanalmente</li>
            <li>• Bloqueie horários pessoais para evitar conflitos</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

