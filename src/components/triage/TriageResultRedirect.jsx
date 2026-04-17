import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { MessageCircleHeart, Users } from 'lucide-react'
import WhatsAppButton from '../WhatsAppButton.jsx'

export default function TriageResultRedirect() {
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mb-5">
        <MessageCircleHeart className="h-7 w-7 text-emerald-700" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
        Às vezes, conversar é o melhor começo
      </h2>
      <p className="text-lg text-gray-600 mb-8 leading-relaxed">
        Pelo que você compartilhou, acho que vale a pena trocarmos uma ideia antes.
        Vou te conectar com alguém da nossa equipe pra te ouvir com calma.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <WhatsAppButton
          source="triagem_redirect"
          label="Falar no WhatsApp"
          message="Oi! Fiz a triagem no site e preferi conversar antes de escolher um psicólogo."
          size="lg"
          className="px-8 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
        />
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/#terapeutas')}
          className="px-8"
        >
          <Users className="h-4 w-4 mr-2" />
          Prefiro ver a lista mesmo assim
        </Button>
      </div>
    </div>
  )
}
