import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Coins, X, Sparkles } from 'lucide-react'

export default function CreditEarnedPopup({
  isOpen,
  onClose,
  creditsEarned = 5,
  activity = "lendo um artigo",
  totalCredits = 20
}) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleScheduleSession = () => {
    onClose()
    navigate('/matching')
  }

  const handleContinueReading = () => {
    onClose()
    navigate('/blog')
  }

  const handleBackToDashboard = () => {
    onClose()
    navigate('/simple-dashboard')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 relative overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-2 right-2 z-10"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="p-6 text-center">
          {/* Sparkle Animation */}
          <div className="relative mb-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Coins className="h-10 w-10 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute -bottom-2 -left-2 h-4 w-4 text-yellow-400 animate-pulse delay-150" />
          </div>

          {/* Success Message */}
          <h3 className="text-2xl font-bold text-green-700 mb-2">
            🎉 Parabéns!
          </h3>

          <p className="text-gray-600 mb-4">
            Você ganhou <span className="font-bold text-green-600">+{creditsEarned} créditos</span> por {activity}!
          </p>

          {/* Credit Balance */}
          <div className="bg-white rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-500 mb-1">Seus créditos agora:</div>
            <div className="text-3xl font-bold text-blue-600">{totalCredits}</div>
            <div className="text-xs text-gray-400">
              {totalCredits >= 50 ? '✅ Suficiente para uma sessão!' : `Faltam ${50 - totalCredits} para uma sessão`}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {totalCredits >= 50 ? (
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleScheduleSession}
              >
                🎯 Agendar Minha Sessão
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleContinueReading}
              >
                📖 Continuar Lendo
              </Button>
            )}

            <Button variant="outline" className="w-full" onClick={handleBackToDashboard}>
              📊 Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}