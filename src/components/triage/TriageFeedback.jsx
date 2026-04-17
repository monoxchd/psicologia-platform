import { useState } from 'react'
import { track } from '../../services/analytics'
import { submitTriageFeedback } from '../../services/triageFeedbackService.js'

const OPTIONS = [
  { id: 'sim',            emoji: '👍', label: 'Sim' },
  { id: 'mais_ou_menos',  emoji: '🤔', label: 'Mais ou menos' },
  { id: 'nao',            emoji: '👎', label: 'Não' },
]

export default function TriageFeedback({ tema }) {
  const [submitted, setSubmitted] = useState(null)
  const [error, setError] = useState(false)

  const handleClick = async (resposta) => {
    if (submitted) return
    setSubmitted(resposta)
    track('Triage Feedback', { tema, resposta })
    try {
      await submitTriageFeedback({ tema, resposta })
    } catch (err) {
      // Privacy contract: don't retry automatically, don't persist. The
      // aggregated counter just misses one tick.
      setError(true)
    }
  }

  return (
    <div className="mt-10 pt-6 border-t border-gray-100 text-center">
      <p className="text-sm text-gray-600 mb-3">Essa indicação fez sentido pra você?</p>
      <div className="flex items-center justify-center gap-2">
        {OPTIONS.map(opt => {
          const isSelected = submitted === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              disabled={!!submitted}
              onClick={() => handleClick(opt.id)}
              className={
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ' +
                (isSelected
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : submitted
                    ? 'bg-white border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400')
              }
            >
              <span>{opt.emoji}</span>
              {opt.label}
            </button>
          )
        })}
      </div>
      {submitted && !error && (
        <p className="text-xs text-gray-500 mt-3">Obrigado pela resposta.</p>
      )}
      {error && (
        <p className="text-xs text-amber-700 mt-3">Não conseguimos registrar sua resposta — tudo bem, nada foi salvo.</p>
      )}
    </div>
  )
}
