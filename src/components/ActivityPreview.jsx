import { useEffect, useRef, useState } from 'react'
import { Lock, Sparkles } from 'lucide-react'
import activityService from '../services/activityService'
import WhatsAppButton from './WhatsAppButton.jsx'
import { track } from '../services/analytics'

const MAX_VISIBLE_QUESTIONS = 4

function FauxTextField({ question }) {
  const config = question.config || {}
  const isMultiline = config.multiline !== false
  const placeholder = config.placeholder || ''

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-gray-700">
        {question.text}
        {question.required && <span className="text-rose-300 ml-1">*</span>}
      </p>
      <div
        className={`w-full rounded-lg border border-dashed border-indigo-200 bg-indigo-50/30 px-3.5 ${
          isMultiline ? 'py-3 min-h-[64px]' : 'py-2.5'
        }`}
      >
        <span className="text-xs italic text-gray-400">
          {placeholder || 'Você poderá responder aqui'}
        </span>
      </div>
    </div>
  )
}

function FauxScaleField({ question }) {
  const config = question.config || {}
  const min = config.min ?? 1
  const max = config.max ?? 5
  const wide = (max - min) >= 6
  const anchors = config.anchors || {}

  const points = []
  for (let i = min; i <= max; i++) points.push(i)

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-gray-700">
        {question.text}
        {question.required && <span className="text-rose-300 ml-1">*</span>}
      </p>
      <div className={wide ? 'flex gap-1' : 'flex gap-2'}>
        {points.map(p => (
          <div
            key={p}
            className={`flex-1 flex items-center justify-center rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50/30 text-xs font-semibold text-gray-400 ${
              wide ? 'h-8' : 'h-12'
            }`}
          >
            {wide ? p : ''}
          </div>
        ))}
      </div>
      {wide && (anchors.min || anchors.max) && (
        <div className="flex justify-between text-[10px] text-gray-400 px-1">
          <span>{anchors.min || min}</span>
          <span>{anchors.max || max}</span>
        </div>
      )}
    </div>
  )
}

export default function ActivityPreview({
  activity_slug,
  whatsapp_message,
  source,
  articleSlug,
}) {
  const [activity, setActivity] = useState(null)
  const [error, setError] = useState(false)
  const containerRef = useRef(null)
  const impressionTrackedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    activityService.getActivity(activity_slug)
      .then(res => {
        if (cancelled) return
        const data = res?.activity
        if (data) setActivity(data)
        else setError(true)
      })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [activity_slug])

  // Fire one impression event when at least half of the preview enters the
  // viewport. Pairs with the WhatsAppButton's 'WhatsApp Click' event (same
  // `source` tag) so impressions vs. clicks form a clean funnel.
  useEffect(() => {
    if (!activity || !containerRef.current || impressionTrackedRef.current) return
    if (typeof IntersectionObserver === 'undefined') return

    const el = containerRef.current
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !impressionTrackedRef.current) {
          impressionTrackedRef.current = true
          track('Article Activity Preview View', {
            article_slug: articleSlug || null,
            activity_slug: activity.slug,
            source: source || null,
          })
          observer.disconnect()
        }
      })
    }, { threshold: 0.5 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [activity, articleSlug, source])

  if (error || !activity) return null

  const visibleQuestions = (activity.questions || [])
    .filter(q => q.type !== 'hidden')
    .slice(0, MAX_VISIBLE_QUESTIONS)
  const hiddenCount = (activity.questions || []).filter(q => q.type !== 'hidden').length - visibleQuestions.length

  // Show only the first paragraph of description as the tagline.
  const tagline = (activity.description || '').split('\n').find(line => line.trim().length > 0) || ''

  return (
    <div ref={containerRef} className="mt-10 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-amber-50/40 p-6 sm:p-7 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
          Pratique agora
        </span>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
        {activity.title}
      </h3>
      {tagline && (
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">{tagline}</p>
      )}

      <div className="space-y-4 mb-6">
        {visibleQuestions.map(q =>
          q.type === 'scale'
            ? <FauxScaleField key={q.id} question={q} />
            : <FauxTextField key={q.id} question={q} />
        )}
        {hiddenCount > 0 && (
          <p className="text-xs text-gray-400 italic pl-1">
            + {hiddenCount} {hiddenCount === 1 ? 'pergunta' : 'perguntas'} a mais
          </p>
        )}
      </div>

      <WhatsAppButton
        message={whatsapp_message}
        source={source}
        label="Quero experimentar"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 text-sm sm:text-base font-semibold"
      />

      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-3">
        <Lock className="h-3 w-3" />
        Vamos te ajudar a começar pelo WhatsApp — só você vê o que escreve.
      </p>
    </div>
  )
}
