import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { ChevronLeft } from 'lucide-react'
import TriageProgress from './TriageProgress.jsx'

export default function TriageQuestion({ question, onAnswer, onBack, onSkip, canGoBack }) {
  const headingRef = useRef(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [question.key])

  return (
    <div className="max-w-3xl mx-auto">
      <TriageProgress current={question.number} total={3} />

      <div className="flex items-center justify-between mb-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={!canGoBack}
          className="text-gray-500 hover:text-gray-900 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        {/* Spec: "opção pular em toda tela". On P1/P2 the skip routes to WhatsApp
            (handled upstream in TriageFlow's reducer); on P3 it proceeds to
            matching without the abordagem modifier. Label stays consistent. */}
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4"
        >
          Pular essa pergunta
        </button>
      </div>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 outline-none"
      >
        {question.text}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map(opt => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onAnswer(opt.id)}
            className="text-left p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-500 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            <span className="text-base text-gray-900">{opt.label}</span>
          </button>
        ))}
      </div>

    </div>
  )
}
