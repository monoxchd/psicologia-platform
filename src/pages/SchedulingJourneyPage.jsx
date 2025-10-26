import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ArrowRight, Calendar, Clock, Zap, Users, Settings } from 'lucide-react'
import TherapistCalendar from '@/components/TherapistCalendar.jsx'
import GoogleCalendarConnection from '@/components/GoogleCalendarConnection.jsx'

export default function SchedulingJourneyPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [calendarRefreshTrigger, setCalendarRefreshTrigger] = useState(0)

  const steps = [
    { id: 1, title: "Estado Atual", description: "Sistema básico de agendamento" },
    { id: 2, title: "Calendário Inteligente", description: "Interface com FullCalendar" },
    { id: 3, title: "Gestão de Disponibilidade", description: "Criar e editar slots" },
    { id: 4, title: "Sincronização Google", description: "Integração bidirecional" },
    { id: 5, title: "Recursos Inteligentes", description: "IA e gamificação" }
  ]

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Estado Atual do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Situação atual do sistema de agendamento:</p>
              <ul className="list-disc list-inside space-y-2 mb-6">
                <li><strong>Calendário básico:</strong> Sistema simples de seleção de data/hora</li>
                <li><strong>Dados mockados:</strong> Disponibilidade simulada (segunda a sexta, 9h-17h)</li>
                <li><strong>Sem persistência:</strong> Dados não salvos no backend</li>
                <li><strong>Interface limitada:</strong> UX básica sem recursos avançados</li>
              </ul>
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <p className="text-yellow-800">
                  <strong>Problemas identificados:</strong>
                </p>
                <ul className="text-sm mt-2 space-y-1 text-yellow-700">
                  <li>• Terapeutas não conseguem gerenciar disponibilidade facilmente</li>
                  <li>• Sem sincronização com calendários externos</li>
                  <li>• Falta de otimização inteligente de horários</li>
                  <li>• Ausência de recursos de gamificação</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">
                  <strong>Solução proposta:</strong> Sistema de agendamento em 3 camadas (Foundational, Smart, Gamified)
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <div className="max-w-6xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  Sistema Completo: Google Calendar + Agenda Inteligente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Conecte seu Google Calendar e veja a mágica acontecer:</p>
                <ul className="list-disc list-inside space-y-2 mb-6">
                  <li><strong>Conecte Google Calendar:</strong> Eventos são importados automaticamente</li>
                  <li><strong>Períodos bloqueados:</strong> Aparecem em vermelho no calendário</li>
                  <li><strong>Gestão unificada:</strong> Um calendário, todas as informações</li>
                  <li><strong>Tempo real:</strong> Mudanças sincronizam instantaneamente</li>
                </ul>
              </CardContent>
            </Card>

            {/* Google Calendar Connection */}
            <GoogleCalendarConnection
              therapistId={1}
              onConnectionChange={(connected, eventsCount) => {
                console.log(`Google Calendar ${connected ? 'connected' : 'disconnected'}. Events: ${eventsCount}`)
                // Refresh the calendar to show imported events
                setCalendarRefreshTrigger(prev => prev + 1)
              }}
            />

            {/* Therapist Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Calendário do Terapeuta</span>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      Dados reais
                    </Badge>
                    <button
                      onClick={() => setCalendarRefreshTrigger(prev => prev + 1)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      🔄 Atualizar
                    </button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TherapistCalendar
                  therapistId={1}
                  editable={true}
                  refreshTrigger={calendarRefreshTrigger}
                />
              </CardContent>
            </Card>
          </div>
        )

      case 3:
        return (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Gestão Avançada de Disponibilidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Funcionalidades para terapeutas:</p>
              <ul className="list-disc list-inside space-y-2 mb-6">
                <li><strong>Criação rápida:</strong> Clique e arraste para criar slots</li>
                <li><strong>Edição inline:</strong> Modificar horários diretamente no calendário</li>
                <li><strong>Padrões recorrentes:</strong> "Todas as segundas, 9h-17h"</li>
                <li><strong>Bloqueios:</strong> Marcar períodos indisponíveis</li>
                <li><strong>Templates:</strong> Salvar padrões de disponibilidade</li>
              </ul>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded text-center">
                  <div className="font-bold">⚡ Criação Rápida</div>
                  <div className="text-sm">Clique + arraste</div>
                </div>
                <div className="bg-green-50 p-3 rounded text-center">
                  <div className="font-bold">🔄 Recorrência</div>
                  <div className="text-sm">Padrões semanais</div>
                </div>
                <div className="bg-purple-50 p-3 rounded text-center">
                  <div className="font-bold">🎯 Templates</div>
                  <div className="text-sm">Reutilizar padrões</div>
                </div>
                <div className="bg-orange-50 p-3 rounded text-center">
                  <div className="font-bold">🚫 Bloqueios</div>
                  <div className="text-sm">Períodos off</div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">
                  <strong>Backend:</strong> Controller e endpoints para CRUD completo de availabilities
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6" />
                Sincronização Google Calendar - Implementada!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">✅ A integração Google Calendar está funcionando na Etapa 2!</p>

              <div className="space-y-4 mb-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">📥 Do Google para TerapiaConecta</h4>
                  <p className="text-sm text-gray-600">Eventos do Google Calendar bloqueiam automaticamente slots no sistema</p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold">📤 Do TerapiaConecta para Google</h4>
                  <p className="text-sm text-gray-600">Sessões agendadas aparecem automaticamente no Google Calendar</p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold">⚡ Tempo Real</h4>
                  <p className="text-sm text-gray-600">Mudanças sincronizam instantaneamente</p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-green-800">
                  <strong>✅ Implementado:</strong> Google Calendar API v3 + OAuth2 + Importação automática
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">
                  <strong>👈 Volte para a Etapa 2</strong> para testar a conexão e ver os eventos importados em tempo real!
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 5:
        return (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6" />
                Camadas Smart & Gamified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recursos Inteligentes
                  </h3>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>"Fill My Gaps":</strong> IA detecta intervalos de 60-90min e sugere disponibilização</li>
                    <li><strong>Matching inteligente:</strong> Conecta pacientes com terapeutas baseado em preferências</li>
                    <li><strong>Otimização automática:</strong> Sugere melhores horários para maximizar ocupação</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Gamificação
                  </h3>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Availability Score:</strong> Pontuação baseada em slots abertos e engajamento</li>
                    <li><strong>Credit Rush:</strong> Períodos de bônus de créditos</li>
                    <li><strong>Instant Session:</strong> Status "disponível agora" para sessões imediatas</li>
                    <li><strong>Notificações real-time:</strong> Alertas de oportunidades via WebSocket</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-bold">Score: 85</div>
                    <div className="text-sm">Availability Score</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded text-center">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="font-bold">2x Créditos</div>
                    <div className="text-sm">Credit Rush Ativo</div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-800">
                    <strong>Resultado:</strong> Sistema que transforma agendamento em experiência engajante e otimizada
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📅 TerapiaConecta: Sistema Avançado de Agendamento
          </h1>
          <p className="text-gray-600">
            Jornada de implementação do sistema de agendamento em 3 camadas para terapeutas
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-colors ${
                    currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : currentStep > step.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Info */}
        <div className="text-center mb-6">
          <Badge variant="outline" className="mb-2">
            Etapa {currentStep} de {steps.length}
          </Badge>
          <h2 className="text-xl font-semibold text-gray-800">
            {steps[currentStep - 1]?.title}
          </h2>
          <p className="text-gray-600">
            {steps[currentStep - 1]?.description}
          </p>
        </div>

        {/* Step Content */}
        <div className="flex justify-center mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            ← Anterior
          </Button>
          <Button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            disabled={currentStep === steps.length}
          >
            Próximo →
          </Button>
        </div>

        {/* Implementation Summary */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">📋 Status da Implementação:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-green-600">✅ Foundational Layer:</h4>
              <ul className="text-sm space-y-1">
                <li>• FullCalendar instalado</li>
                <li>• TherapistCalendar component</li>
                <li>• Interface básica funcional</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-600">🚧 Smart Layer:</h4>
              <ul className="text-sm space-y-1">
                <li>• AvailabilitiesController (pendente)</li>
                <li>• Fill My Gaps logic (pendente)</li>
                <li>• Google Calendar sync (pendente)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600">🔄 Gamified Layer:</h4>
              <ul className="text-sm space-y-1">
                <li>• Availability scoring (pendente)</li>
                <li>• Credit Rush system (pendente)</li>
                <li>• Real-time features (pendente)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}