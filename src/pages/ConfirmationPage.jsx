import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { CheckCircle, Clock, Calendar, CreditCard } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function ConfirmationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { formData, selectedCredits, scheduledAppointment } = location.state || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <CardTitle className="text-3xl text-green-600">Sessão Agendada com Sucesso!</CardTitle>
            <CardDescription className="text-lg">
              Sua sessão foi confirmada e você receberá todas as informações por email
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scheduledAppointment && (
              <div className="space-y-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-4">Detalhes da Sessão:</h3>
                  <div className="space-y-2 text-green-800">
                    <p><strong>Psicólogo:</strong> {scheduledAppointment.therapist}</p>
                    <p><strong>Especialidade:</strong> {scheduledAppointment.specialty}</p>
                    <p><strong>Data:</strong> {new Date(scheduledAppointment.date).toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}</p>
                    <p><strong>Horário:</strong> {scheduledAppointment.time}</p>
                    <p><strong>Duração:</strong> {scheduledAppointment.duration} minutos</p>
                    <p><strong>Custo:</strong> {scheduledAppointment.cost} créditos</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">Próximos Passos:</h4>
                  <ul className="text-blue-800 space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                      Email de confirmação enviado para {formData?.email}
                    </li>
                    <li className="flex items-center">
                      <Clock className="h-4 w-4 text-blue-600 mr-2" />
                      Link da videochamada será enviado 15 minutos antes
                    </li>
                    <li className="flex items-center">
                      <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                      Adicione ao seu calendário para não esquecer
                    </li>
                    <li className="flex items-center">
                      <CreditCard className="h-4 w-4 text-blue-600 mr-2" />
                      Créditos serão debitados apenas após a sessão
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/matching', { state: { formData, selectedCredits } })}
                    className="flex-1"
                  >
                    Agendar Outra Sessão
                  </Button>
                  <Button 
                    onClick={() => navigate('/')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Voltar ao Início
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}