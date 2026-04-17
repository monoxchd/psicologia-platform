import { Button } from '@/components/ui/button.jsx'
import { Lock, ArrowRight, Users } from 'lucide-react'

export default function TriageIntro({ onStart, onSkip }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
        Vamos te ajudar a encontrar o caminho
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Três perguntas rápidas. Sem certo ou errado.
      </p>

      <div className="inline-flex items-start gap-3 text-left bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-8">
        <Lock className="h-5 w-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-900 leading-relaxed">
          <span className="font-semibold">Suas respostas individuais não saem do seu navegador</span> —
          somem quando você fecha a página. Se você escolher nos dar feedback no final, enviamos apenas
          a indicação geral (sem identificação) pra melhorar a ferramenta.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" onClick={onStart} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          Começar
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
        <Button size="lg" variant="outline" onClick={onSkip} className="px-8">
          <Users className="h-4 w-4 mr-2" />
          Prefiro ver todos os psicólogos
        </Button>
      </div>
    </div>
  )
}
