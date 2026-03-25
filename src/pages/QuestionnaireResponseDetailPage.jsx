import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, ArrowLeft, AlertTriangle, User, Mail, Building2, Briefcase } from 'lucide-react'

import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import questionnaireService from '@/services/questionnaireService'

function ScaleDisplay({ value, config }) {
  const min = config?.min ?? 1
  const max = config?.max ?? 5
  const labels = config?.labels || {}
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {numbers.map((n) => (
          <div
            key={n}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
              ${value === n
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-400'
              }`}
          >
            {n}
          </div>
        ))}
      </div>
      {labels[String(value)] && (
        <p className="text-sm text-gray-600">{labels[String(value)]}</p>
      )}
    </div>
  )
}

function AnswerDisplay({ question, answer }) {
  if (answer == null || answer === '') {
    return <p className="text-gray-400 italic">Não respondida</p>
  }

  switch (question.type) {
    case 'single_select':
      return (
        <div className="space-y-1">
          {question.options.map((option) => (
            <div
              key={option}
              className={`px-3 py-2 rounded text-sm ${
                answer === option
                  ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                  : 'text-gray-400'
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      )

    case 'multi_select':
      return (
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(answer) ? answer : []).map((item) => (
            <Badge key={item} variant="secondary" className="text-sm">
              {item}
            </Badge>
          ))}
        </div>
      )

    case 'text':
      return (
        <blockquote className="border-l-4 border-gray-200 pl-4 py-2 text-gray-700 bg-gray-50 rounded-r">
          {answer}
        </blockquote>
      )

    case 'scale':
      return <ScaleDisplay value={answer} config={question.config} />

    case 'symptom_matrix':
      if (!answer || typeof answer !== 'object') {
        return <p className="text-gray-400 italic">Não respondida</p>
      }
      return (
        <div className="space-y-2">
          {Object.entries(answer).map(([symptom, frequency]) => {
            const isHigh = frequency === 'Frequentemente' || frequency === 'Sempre'
            return (
              <div
                key={symptom}
                className={`flex justify-between items-center px-3 py-2 rounded text-sm ${
                  isHigh ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'
                }`}
              >
                <span className="text-gray-700">{symptom}</span>
                <Badge variant={isHigh ? 'destructive' : 'secondary'} className="text-xs">
                  {frequency}
                </Badge>
              </div>
            )
          })}
        </div>
      )

    default:
      return <p className="text-gray-700">{String(answer)}</p>
  }
}

export default function QuestionnaireResponseDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDetail() {
      try {
        const result = await questionnaireService.getResponseDetail(id)
        setData(result)
      } catch (err) {
        setError(err.status === 403 ? 'Acesso negado.' : 'Erro ao carregar resposta.')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  const sections = useMemo(() => {
    if (!data?.questionnaire?.questions) return []
    const sectionMap = new Map()
    for (const q of data.questionnaire.questions) {
      const section = q.section || 'Geral'
      if (!sectionMap.has(section)) {
        sectionMap.set(section, [])
      }
      sectionMap.get(section).push(q)
    }
    return Array.from(sectionMap.entries()).map(([name, questions]) => ({ name, questions }))
  }, [data])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/therapist/dashboard">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { response, client, questionnaire } = data
  const flags = response.flags || {}
  const riskClassification = flags.risk_classification

  // DASS-21 results
  const dass21 = ['depression', 'anxiety', 'stress']
    .filter(s => flags[`dass21_${s}_severity`])
    .map(s => ({
      subscale: s,
      rawScore: flags[`dass21_${s}_raw`],
      severity: flags[`dass21_${s}_severity`]
    }))

  // COPSOQ dimensions
  const copsoqDimensions = Object.entries(flags)
    .filter(([k]) => k.startsWith('copsoq_') && k.endsWith('_risk'))
    .map(([k, v]) => {
      const dimension = k.replace('copsoq_', '').replace('_risk', '')
      return { dimension, risk: v, score: flags[`copsoq_${dimension}`] }
    })

  // Generic domain risks (for non-clinical questionnaires)
  const domainRisks = Object.entries(flags)
    .filter(([k]) => k.endsWith('_risk_level') && !k.startsWith('copsoq_') && !k.startsWith('dass21_'))
    .map(([k, v]) => ({
      domain: k.replace('_risk_level', ''),
      level: v,
      score: flags[k.replace('_risk_level', '_risk_score')]
    }))

  const hasClinical = dass21.length > 0 || copsoqDimensions.length > 0

  const flagCount = Object.keys(flags).filter(k =>
    (flags[k] === true) &&
    !k.endsWith('_risk_level') && !k.endsWith('_risk_score') && !k.endsWith('_risk') &&
    k !== 'risk_classification' && !k.startsWith('dass21_') && !k.startsWith('copsoq_')
  ).length

  const domainLabels = {
    sobrecarga: 'Sobrecarga de Trabalho',
    falta_autonomia: 'Falta de Autonomia',
    conflitos: 'Conflitos Interpessoais',
    assedio: 'Assédio e Violência',
    inseguranca: 'Insegurança no Emprego',
    desequilibrio: 'Desequilíbrio Esforço-Recompensa',
    saude_geral: 'Saúde e Bem-Estar',
    contexto_operacional: 'Contexto Operacional'
  }

  const copsoqLabels = {
    demandas_quantitativas: 'Demandas Quantitativas',
    ritmo_trabalho: 'Ritmo de Trabalho',
    significado: 'Significado do Trabalho',
    comprometimento: 'Comprometimento',
    previsibilidade: 'Previsibilidade',
    recompensas: 'Recompensas',
    conflitos_papel: 'Conflitos de Papel',
    lideranca: 'Qualidade da Liderança'
  }

  const dass21Labels = {
    depression: 'Depressão',
    anxiety: 'Ansiedade',
    stress: 'Estresse'
  }

  const severityLabels = {
    normal: 'Normal',
    leve: 'Leve',
    moderado: 'Moderado',
    severo: 'Severo',
    extremamente_severo: 'Extremamente Severo'
  }

  const levelColors = {
    baixo: 'bg-green-100 text-green-700',
    moderado: 'bg-amber-100 text-amber-700',
    alto: 'bg-red-100 text-red-700'
  }

  const severityColors = {
    normal: 'bg-green-100 text-green-700',
    leve: 'bg-blue-100 text-blue-700',
    moderado: 'bg-amber-100 text-amber-700',
    severo: 'bg-red-100 text-red-700',
    extremamente_severo: 'bg-red-200 text-red-900'
  }

  const classificationLabels = {
    baixo: 'Baixo',
    moderado: 'Moderado',
    alto: 'Alto',
    critico: 'Critico',
    sem_risco: 'Sem Risco',
    com_risco_identificado: 'Com Risco Identificado'
  }

  const classificationColors = {
    baixo: 'bg-green-100 text-green-700',
    sem_risco: 'bg-green-100 text-green-700',
    moderado: 'bg-amber-100 text-amber-700',
    com_risco_identificado: 'bg-red-100 text-red-700',
    alto: 'bg-red-100 text-red-700',
    critico: 'bg-red-200 text-red-900'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/therapist/questionarios/${questionnaire.slug}/respostas`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{questionnaire.title}</h1>
            <p className="text-gray-600">Resposta de {response.anonymous ? 'Anônimo' : client?.name || 'Colaborador'}</p>
          </div>
        </div>

        {/* Risk Classification */}
        {riskClassification && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Classificação de Risco — NR-1</CardTitle>
              <CardDescription>Diagnóstico de riscos psicossociais conforme Portaria 1.419/2024</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-6">
                <Badge className={`text-sm px-3 py-1 ${classificationColors[riskClassification] || 'bg-gray-100 text-gray-600'}`}>
                  {classificationLabels[riskClassification] || riskClassification}
                </Badge>
                {response.score != null && (
                  <span className="text-sm text-gray-500">
                    Score geral: {Number(response.score).toFixed(1)} / 5.0
                  </span>
                )}
              </div>

              {/* DASS-21 Results */}
              {dass21.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">DASS-21 — Triagem de Saúde Mental</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {dass21.map(({ subscale, rawScore, severity }) => (
                      <div key={subscale} className="p-3 rounded-lg bg-gray-50 text-center">
                        <p className="text-xs text-gray-500 mb-1">{dass21Labels[subscale]}</p>
                        <p className="text-lg font-bold text-gray-900 mb-1">{rawScore}</p>
                        <Badge className={`text-xs ${severityColors[severity] || 'bg-gray-100 text-gray-600'}`}>
                          {severityLabels[severity] || severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COPSOQ Results */}
              {copsoqDimensions.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">COPSOQ — Fatores Psicossociais no Trabalho</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {copsoqDimensions.map(({ dimension, risk, score }) => (
                      <div key={dimension} className="flex justify-between items-center px-3 py-2 rounded bg-gray-50">
                        <span className="text-sm text-gray-700">{copsoqLabels[dimension] || dimension}</span>
                        <div className="flex items-center gap-2">
                          {score != null && <span className="text-xs text-gray-400">{Number(score).toFixed(0)}</span>}
                          <Badge className={`text-xs ${levelColors[risk] || 'bg-gray-100 text-gray-600'}`}>
                            {risk === 'baixo' ? 'Baixo' : risk === 'moderado' ? 'Moderado' : 'Alto'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generic Domain Risks (non-clinical) */}
              {!hasClinical && domainRisks.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {domainRisks.map(({ domain, level, score }) => (
                    <div key={domain} className="flex justify-between items-center px-3 py-2 rounded bg-gray-50">
                      <span className="text-sm text-gray-700">{domainLabels[domain] || domain}</span>
                      <div className="flex items-center gap-2">
                        {score && <span className="text-xs text-gray-400">{score}</span>}
                        <Badge className={`text-xs ${levelColors[level] || 'bg-gray-100 text-gray-600'}`}>
                          {level === 'baixo' ? 'Baixo' : level === 'moderado' ? 'Moderado' : 'Alto'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Client Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Informações do Colaborador</CardTitle>
          </CardHeader>
          <CardContent>
            {response.anonymous || !client ? (
              <div className="flex items-center gap-3 text-gray-500">
                <User className="h-4 w-4" />
                <p className="text-sm">Resposta anônima — sem dados de identificação</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="font-medium">{client.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
                {client.department && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Departamento</p>
                      <p className="font-medium">{client.department}</p>
                    </div>
                  </div>
                )}
                {client.company_name && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Empresa</p>
                      <p className="font-medium">{client.company_name}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score + Flags Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Score</p>
              <p className="text-2xl font-bold">
                {response.score != null ? Number(response.score).toFixed(1) : '—'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Alertas</p>
              <p className={`text-2xl font-bold ${flagCount > 0 ? 'text-amber-500' : 'text-gray-400'}`}>
                {flagCount > 0 && <AlertTriangle className="inline h-5 w-5 mr-1" />}
                {flagCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Respondido em</p>
              <p className="text-lg font-semibold">
                {response.completed_at
                  ? new Date(response.completed_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Questions + Answers by Section */}
        {sections.map((section) => (
          <Card key={section.name} className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{section.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {section.questions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <p className="font-medium text-gray-900">{question.text}</p>
                  <AnswerDisplay
                    question={question}
                    answer={response.answers?.[question.id]}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
