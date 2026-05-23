import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ArrowLeft, Loader2, BookOpen, BrainCircuit, Heart, NotebookPen, ShieldCheck } from 'lucide-react'
import patientEntriesService from '../services/patientEntriesService'
import authService from '../services/authService'

const BR_TZ = 'America/Sao_Paulo'

const ACTIVITY_TYPE_LABEL = {
  journal: 'Diário',
  reflection: 'Reflexão',
  cognitive_record: 'Modelo Cognitivo',
  reading: 'Leitura',
}

const ACTIVITY_TYPE_ICON = {
  journal: NotebookPen,
  reflection: BookOpen,
  cognitive_record: BrainCircuit,
  reading: BookOpen,
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', timeZone: BR_TZ
  })
}

export default function PatientEntriesPage() {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [patient, setPatient] = useState(null)
  const [entries, setEntries] = useState([])

  useEffect(() => {
    if (!authService.isLoggedIn() || !authService.isTherapist()) {
      navigate('/login', { replace: true })
      return
    }
    let cancelled = false
    async function load() {
      try {
        const data = await patientEntriesService.getEntries(clientId)
        if (cancelled) return
        setPatient(data?.patient || null)
        setEntries(data?.entries || [])
      } catch (err) {
        if (cancelled) return
        setError(err.errors?.[0] || err.message || 'Não foi possível carregar os registros.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [clientId, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto max-w-3xl px-4">
          <Link to="/therapist/dashboard" className="text-sm text-gray-500 inline-flex items-center gap-1 mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao painel
          </Link>
          <Card>
            <CardContent className="p-6 text-center text-sm text-red-600">{error}</CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Agrupa entries por data pra leitura clínica
  const groups = entries.reduce((acc, e) => {
    const key = e.entry_date
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})
  const orderedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a))

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto max-w-3xl px-4 space-y-5">
        <Link to="/therapist/dashboard" className="text-sm text-gray-500 inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao painel
        </Link>

        <div className="flex items-center gap-3">
          <Heart className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Registros de {patient?.name}</h1>
            <p className="text-sm text-gray-500 inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Apenas atividades que o(a) paciente decidiu compartilhar.
            </p>
          </div>
        </div>

        {entries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-gray-500">
              Nenhum registro foi compartilhado ainda. O(a) paciente decide entrada por entrada se quer compartilhar.
            </CardContent>
          </Card>
        ) : (
          orderedDates.map(date => (
            <div key={date}>
              <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 capitalize">
                {formatDate(date)}
              </h3>
              <div className="space-y-2">
                {groups[date].map(entry => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function EntryCard({ entry }) {
  const Icon = ACTIVITY_TYPE_ICON[entry.activity_type] || NotebookPen
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-emerald-600" />
            <CardTitle className="text-base">{entry.activity_title}</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
            {ACTIVITY_TYPE_LABEL[entry.activity_type] || entry.activity_type}
          </Badge>
        </div>
        {entry.mood_score != null && (
          <CardDescription className="text-xs">Humor declarado: {entry.mood_score}/5</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <AnswersList answers={entry.answers} />
      </CardContent>
    </Card>
  )
}

function AnswersList({ answers }) {
  if (!answers || typeof answers !== 'object') return null
  const keys = Object.keys(answers)
  if (keys.length === 0) return <p className="text-xs text-gray-400">Sem conteúdo.</p>
  return (
    <dl className="text-sm space-y-2">
      {keys.map(key => {
        const value = answers[key]
        if (value == null || value === '') return null
        return (
          <div key={key}>
            <dt className="text-xs uppercase tracking-wide text-gray-500">{key.replace(/_/g, ' ')}</dt>
            <dd className="text-sm text-gray-800 whitespace-pre-wrap">{String(value)}</dd>
          </div>
        )
      })}
    </dl>
  )
}
