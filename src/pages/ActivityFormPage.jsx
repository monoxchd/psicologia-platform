import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import {
  ArrowLeft, Loader2, CheckCircle2, BookOpen, Lightbulb, BookMarked
} from 'lucide-react'
import activityService from '../services/activityService'
import authService from '../services/authService'

const MOOD_EMOJIS = ['', '😞', '😕', '😐', '🙂', '😄']
const MOOD_LABELS = ['', 'Muito mal', 'Mal', 'Neutro', 'Bem', 'Muito bem']

function getActivityIcon(type) {
  switch (type) {
    case 'journal': return BookOpen
    case 'reflection': return Lightbulb
    case 'reading': return BookMarked
    default: return BookOpen
  }
}

function ScaleInput({ question, value, onChange }) {
  const config = question.config || {}
  const min = config.min || 1
  const max = config.max || 5
  const labels = config.labels || []
  const emojis = config.emojis || MOOD_EMOJIS.slice(min, max + 1)

  const options = []
  for (let i = min; i <= max; i++) {
    options.push(i)
  }

  return (
    <div className="space-y-3">
      <label className="block text-base font-semibold text-gray-800">
        {question.text}
        {question.required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      <div className="flex justify-between gap-2">
        {options.map((opt, idx) => {
          const selected = value === opt
          const emoji = emojis[idx] || ''
          const label = labels[idx] || ''

          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border-2 transition-all ${
                selected
                  ? 'border-indigo-400 bg-indigo-50 shadow-sm scale-105'
                  : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
              }`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className={`text-[10px] sm:text-xs leading-tight text-center ${
                selected ? 'text-indigo-800 font-semibold' : 'text-gray-400'
              }`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TextInput({ question, value, onChange }) {
  const config = question.config || {}
  const isMultiline = config.multiline !== false

  return (
    <div className="space-y-2">
      <label className="block text-base font-semibold text-gray-800">
        {question.text}
        {question.required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      {isMultiline ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={config.placeholder || ''}
          rows={4}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 focus:border-indigo-400 focus:ring-0 focus:outline-none resize-none transition-colors"
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={config.placeholder || ''}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 focus:border-indigo-400 focus:ring-0 focus:outline-none transition-colors"
        />
      )}
    </div>
  )
}

export default function ActivityFormPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [answers, setAnswers] = useState({})
  const [existingEntry, setExistingEntry] = useState(null)

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      navigate('/login')
      return
    }

    async function load() {
      try {
        const [activityRes, entriesRes] = await Promise.allSettled([
          activityService.getActivity(slug),
          activityService.getEntries({
            activity_slug: slug,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            limit: 1
          })
        ])

        if (activityRes.status === 'fulfilled') {
          setActivity(activityRes.value?.activity)
        }

        if (entriesRes.status === 'fulfilled') {
          const entries = entriesRes.value?.entries || []
          if (entries.length > 0) {
            setExistingEntry(entries[0])
            setAnswers(entries[0].answers || {})
          }
        }
      } catch (error) {
        console.error('Error loading activity:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [slug, navigate])

  const setAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const visibleQuestions = (activity.questions || []).filter(q => q.type !== 'hidden')
    const requiredMissing = visibleQuestions
      .filter(q => q.required)
      .some(q => !answers[q.id] && answers[q.id] !== 0)

    if (requiredMissing) return

    setSubmitting(true)
    try {
      await activityService.createEntry({
        activity_slug: slug,
        answers,
        entry_date: new Date().toISOString().split('T')[0]
      })
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting entry:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50/80 via-slate-50/40 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600/70" />
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50/80 to-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Atividade não encontrada</p>
          <Link to="/dashboard" className="text-indigo-700 hover:text-indigo-800 font-medium">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const Icon = getActivityIcon(activity.activity_type)
  const visibleQuestions = (activity.questions || []).filter(q => q.type !== 'hidden')
  const moodAnswer = answers['mood']

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/80 via-emerald-50/20 to-gray-50">
        <div className="max-w-lg mx-auto px-4 sm:px-6 pt-20 pb-16">
          <div className="text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            {moodAnswer && (
              <div className="text-5xl">{MOOD_EMOJIS[moodAnswer]}</div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Registrado!</h1>
              <p className="text-gray-500 mt-1">
                Sua atividade foi salva com sucesso
              </p>
            </div>
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 py-3 mt-4"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Already completed today - read-only view
  if (existingEntry) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50/80 via-slate-50/40 to-white">
        <div className="max-w-lg mx-auto px-4 sm:px-6 pt-8 pb-16">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{activity.title}</h1>
              <p className="text-xs text-emerald-600 font-medium">Concluído hoje</p>
            </div>
          </div>

          <Card className="border-0 shadow-md bg-white/90">
            <CardContent className="p-5 space-y-5">
              {visibleQuestions.map(question => {
                const answer = existingEntry.answers?.[question.id]
                if (!answer && answer !== 0) return null

                return (
                  <div key={question.id}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      {question.text}
                    </p>
                    {question.type === 'scale' ? (
                      <p className="text-2xl">
                        {MOOD_EMOJIS[answer]} <span className="text-sm text-gray-600">{MOOD_LABELS[answer]}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{answer}</p>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Form view
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/80 via-slate-50/40 to-white">
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-8 pb-16">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Icon className="h-5 w-5 text-indigo-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{activity.title}</h1>
            {activity.description && (
              <p className="text-xs text-gray-400 mt-0.5">{activity.description}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-md bg-white/90 mb-6">
            <CardContent className="p-5 space-y-6">
              {visibleQuestions.map(question => {
                if (question.type === 'scale') {
                  return (
                    <ScaleInput
                      key={question.id}
                      question={question}
                      value={answers[question.id]}
                      onChange={val => setAnswer(question.id, val)}
                    />
                  )
                }

                return (
                  <TextInput
                    key={question.id}
                    question={question}
                    value={answers[question.id]}
                    onChange={val => setAnswer(question.id, val)}
                  />
                )
              })}
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-indigo-700 text-white rounded-xl py-3 text-base font-semibold shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              'Registrar'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
