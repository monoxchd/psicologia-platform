import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ArrowRight, User, MapPin } from 'lucide-react'
import ArticleReader from '@/components/ArticleReader.jsx'

export default function DemoJourneyPage() {
  const [currentStep, setCurrentStep] = useState(1)

  const steps = [
    { id: 1, title: "Landing Page", description: "Usuário descobre a plataforma" },
    { id: 2, title: "Login", description: "Usuário faz login" },
    { id: 3, title: "Dashboard", description: "Vê atividades disponíveis" },
    { id: 4, title: "Ler Artigo", description: "Ganha créditos lendo" },
    { id: 5, title: "Agendar Sessão", description: "Usa créditos para terapia" }
  ]

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>🏠 Landing Page</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">O usuário chega na landing page e vê:</p>
              <ul className="list-disc list-inside space-y-2 mb-6">
                <li>Explicação do sistema de créditos</li>
                <li>Botão "Entrar" no header (✅ já implementado)</li>
                <li>Call-to-action para começar</li>
              </ul>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">
                  "Terapia flexível com créditos. Pague apenas pelo tempo que usar!"
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>🔐 Login</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Usuário clica em "Entrar" e:</p>
              <ul className="list-disc list-inside space-y-2 mb-6">
                <li>Acessa página de login existente</li>
                <li>Insere credenciais (cadastradas manualmente no backend)</li>
                <li>É redirecionado para o dashboard simplificado</li>
              </ul>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800">
                  ✅ Fluxo de login já funcional - redirecionamento para /simple-dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>📊 Dashboard Simplificado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Dashboard mostra claramente:</p>
              <ul className="list-disc list-inside space-y-2 mb-6">
                <li><strong>Saldo de créditos</strong> (destaque visual)</li>
                <li><strong>Próximo objetivo</strong> ("Ganhe X créditos para sua sessão")</li>
                <li><strong>Atividades</strong> para ganhar créditos</li>
                <li><strong>Progresso semanal</strong></li>
              </ul>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded text-center">
                  <div className="font-bold">📖 Ler Artigos</div>
                  <div className="text-sm">+5 créditos</div>
                </div>
                <div className="bg-green-50 p-3 rounded text-center">
                  <div className="font-bold">💰 Comprar</div>
                  <div className="text-sm">Pacotes</div>
                </div>
                <div className="bg-purple-50 p-3 rounded text-center">
                  <div className="font-bold">📅 Agendar</div>
                  <div className="text-sm">50 créditos</div>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-800">
                  ✅ Componente SimpleDashboardPage criado
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <div className="max-w-4xl">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>📖 Experiência de Leitura Gamificada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Quando usuário clica "Ler Artigos":</p>
                <ul className="list-disc list-inside space-y-2 mb-6">
                  <li>Vai para página do blog existente</li>
                  <li>Seleciona um artigo</li>
                  <li>Lê o conteúdo completo</li>
                  <li>Clica "Marcar como Lido"</li>
                  <li><strong>Popup aparece:</strong> "+5 créditos ganhos!"</li>
                </ul>
              </CardContent>
            </Card>
            <ArticleReader />
          </div>
        )

      case 5:
        return (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>🎯 Agendamento de Sessão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Com créditos suficientes (50+), usuário pode:</p>
              <ul className="list-disc list-inside space-y-2 mb-6">
                <li>Clicar em "Agendar Sessão" (habilitado)</li>
                <li>Escolher terapeuta</li>
                <li>Selecionar horário</li>
                <li>Confirmar sessão (créditos são debitados)</li>
              </ul>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-green-800">
                  ✅ Fluxo completo: Landing → Login → Atividades → Créditos → Terapia
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">
                  <strong>Próximos passos:</strong> Conectar ao backend para persistir créditos e progress
                </p>
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
            🎮 Demo: Jornada do Usuário Gamificada
          </h1>
          <p className="text-gray-600">
            Prova de conceito do fluxo completo: Landing → Login → Atividades → Créditos → Terapia
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

        {/* Summary */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">📋 Resumo dos Componentes Criados:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-600">✅ Implementado:</h4>
              <ul className="text-sm space-y-1">
                <li>• SimpleDashboardPage.jsx</li>
                <li>• CreditEarnedPopup.jsx</li>
                <li>• ArticleReader.jsx (demo)</li>
                <li>• Login button na landing page</li>
                <li>• Rotas atualizadas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600">🔄 Próximos Passos:</h4>
              <ul className="text-sm space-y-1">
                <li>• Conectar ao backend</li>
                <li>• Persistir créditos do usuário</li>
                <li>• Integrar com blog existente</li>
                <li>• Adicionar sistema de objetivos</li>
                <li>• Implementar analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}