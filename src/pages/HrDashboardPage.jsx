import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Loader2, ShieldCheck, Share2, Users, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import companyService from '@/services/companyService'
import CompanyHeader from '@/components/CompanyHeader.jsx'

const LEVEL_COLOR = {
  baixo:    '#22c55e',
  moderado: '#f59e0b',
  alto:     '#f97316',
  critico:  '#ef4444'
}
const LEVEL_LABEL = {
  baixo: 'Baixo',
  moderado: 'Moderado',
  alto: 'Alto',
  critico: 'Crítico'
}
const DASS_SEVERITY_ORDER = ['normal', 'leve', 'moderado', 'severo', 'extremamente_severo']
const DASS_SEVERITY_LABEL = {
  normal: 'Normal',
  leve: 'Leve',
  moderado: 'Moderado',
  severo: 'Severo',
  extremamente_severo: 'Ext. severo'
}
const DASS_SEVERITY_COLOR = {
  normal: '#22c55e',
  leve: '#a3e635',
  moderado: '#f59e0b',
  severo: '#f97316',
  extremamente_severo: '#ef4444'
}
const DASS_TITLE = { depression: 'Depressão', anxiety: 'Ansiedade', stress: 'Estresse' }

export default function HrDashboardPage() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedRisk, setExpandedRisk] = useState(null)

  useEffect(() => {
    async function fetch() {
      try {
        const res = await companyService.getHrDashboard(slug)
        setData(res)
      } catch (_) {
        setError('Não foi possível carregar o painel.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [slug])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-600">{error}</p></div>
  }

  const { company, questionnaire, coverage, risks, dass21, departments } = data
  const primaryColor = company?.primary_color || '#4f46e5'
  const total = coverage?.total_respondents ?? 0
  const belowThreshold = coverage?.below_threshold

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyHeader company={company} slug={slug} />

      {/* Title banner */}
      <section
        className="px-4 sm:px-6 lg:px-8 py-8 border-b"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}06, ${primaryColor}12)`,
          borderColor: `${primaryColor}20`
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Diagnóstico de Riscos Psicossociais
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                {questionnaire ? questionnaire.title : 'Sem questionário ativo'}
                {questionnaire && ` · v${questionnaire.version}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <KpiChip icon={Users} label="Respostas" value={total} primaryColor={primaryColor} />
              <KpiChip
                icon={ShieldCheck}
                label="Última resposta"
                value={coverage?.last_response_at ? new Date(coverage.last_response_at).toLocaleDateString('pt-BR') : '—'}
                primaryColor={primaryColor}
              />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {belowThreshold ? (
          <EmptyState primaryColor={primaryColor} questionnaireSlug={questionnaire?.slug} companySlug={slug} />
        ) : (
          <>
            <RisksPanel risks={risks} expandedRisk={expandedRisk} setExpandedRisk={setExpandedRisk} primaryColor={primaryColor} />
            <Dass21Panel dass21={dass21} primaryColor={primaryColor} />
            <DepartmentHeatmap departments={departments} risks={risks} primaryColor={primaryColor} />
          </>
        )}
      </main>
    </div>
  )
}

function KpiChip({ icon: Icon, label, value, primaryColor }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="text-gray-500">{label}:</span>
      <span>{value}</span>
    </div>
  )
}

function LevelPill({ level, status }) {
  if (status === 'gap') {
    return <Badge variant="outline" className="text-gray-500 border-gray-300">Não medido</Badge>
  }
  if (!level) return <Badge variant="outline" className="text-gray-400">—</Badge>
  const color = LEVEL_COLOR[level]
  return (
    <Badge
      className="border-0 text-white"
      style={{ backgroundColor: color }}
    >
      {LEVEL_LABEL[level]}
    </Badge>
  )
}

function RisksPanel({ risks, expandedRisk, setExpandedRisk, primaryColor }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">13 Riscos Psicossociais</CardTitle>
        <CardDescription>
          Riscos estabelecidos pela NR-1 (Portaria MTE nº 1.419/2024), derivados das respostas anônimas
          via COPSOQ e instrumentos complementares. Clique em cada linha para ver as fontes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {risks.map((risk) => {
            const expanded = expandedRisk === risk.id
            const score = risk.score_0_100 ?? 0
            const color = risk.status === 'gap'
              ? '#d1d5db'
              : (LEVEL_COLOR[risk.level] || '#d1d5db')
            const attenuated = risk.status === 'partial'
            return (
              <div key={risk.id} className="py-3">
                <button
                  type="button"
                  onClick={() => setExpandedRisk(expanded ? null : risk.id)}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <span className="text-xs font-semibold text-gray-400 w-6 shrink-0">{String(risk.number).padStart(2, '0')}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-gray-900 truncate">{risk.label}</span>
                    <span className="block mt-1.5 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <span
                        className="block h-full"
                        style={{
                          width: `${Math.min(score, 100)}%`,
                          backgroundColor: color,
                          opacity: attenuated ? 0.55 : 1
                        }}
                      />
                    </span>
                  </span>
                  <span className="shrink-0 flex items-center gap-3">
                    {risk.status !== 'gap' && risk.respondents_affected_pct != null && (
                      <span className="text-xs text-gray-500 w-20 text-right hidden sm:inline">
                        {risk.respondents_affected_pct}% afetados
                      </span>
                    )}
                    <LevelPill level={risk.level} status={risk.status} />
                    {expanded
                      ? <ChevronDown className="h-4 w-4 text-gray-400" />
                      : <ChevronRight className="h-4 w-4 text-gray-400" />}
                  </span>
                </button>
                {expanded && (
                  <div className="mt-3 ml-9 pl-3 border-l-2 text-sm text-gray-600 space-y-1" style={{ borderColor: `${primaryColor}30` }}>
                    <p className="font-medium text-gray-700">Fontes de medição</p>
                    {risk.source_summary.map((s, i) => (
                      <p key={i} className="text-xs">• {s}</p>
                    ))}
                    {risk.status === 'gap' && (
                      <p className="text-xs text-amber-700 mt-2">
                        Nenhum item do questionário atual alimenta este risco. Considere adicionar perguntas específicas.
                      </p>
                    )}
                    {risk.status === 'partial' && (
                      <p className="text-xs text-gray-500 mt-2">
                        Apenas algumas fontes têm dados — resultado parcial.
                      </p>
                    )}
                    {risk.status !== 'gap' && (
                      <p className="text-xs text-gray-500 mt-2">
                        Score {risk.score_0_100}/100 · {risk.respondents_with_data} respondentes com dados
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function Dass21Panel({ dass21 }) {
  const anySeverePct = dass21?.any_severe_pct ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Saúde Mental (DASS-21)</CardTitle>
        <CardDescription>
          Indicadores de consequência — depressão, ansiedade e estresse. Instrumento clínico validado
          (cutoffs da DASS-21 em faixas de gravidade).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['depression', 'anxiety', 'stress'].map((subscale) => (
            <Dass21Card key={subscale} subscale={subscale} data={dass21?.[subscale]} />
          ))}
        </div>
        {anySeverePct > 0 && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
            <AlertTriangle className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-900">
              <strong>{anySeverePct}%</strong> dos respondentes apresentam ao menos um indicador em nível severo ou extremamente severo.
              Recomenda-se encaminhamento psicológico prioritário.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Dass21Card({ subscale, data }) {
  if (!data || data.total_with_data === 0) {
    return (
      <div className="border rounded-lg p-4 text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">{DASS_TITLE[subscale]}</p>
        <p className="text-xs text-gray-400">Sem dados</p>
      </div>
    )
  }
  const chartData = DASS_SEVERITY_ORDER.map((sev) => ({
    severity: DASS_SEVERITY_LABEL[sev],
    value: data.distribution[sev] ?? 0,
    color: DASS_SEVERITY_COLOR[sev]
  })).filter((d) => d.value > 0)

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">{DASS_TITLE[subscale]}</p>
        <span className="text-xs text-gray-400">{data.total_with_data} resp.</span>
      </div>
      <div className="h-32">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="severity"
              cx="50%" cy="50%"
              innerRadius="55%" outerRadius="85%"
              paddingAngle={2}
            >
              {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [`${v}%`, n]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-center mt-2" style={{ color: data.severo_or_worse_pct > 0 ? '#b45309' : '#6b7280' }}>
        {data.severo_or_worse_pct > 0
          ? `${data.severo_or_worse_pct}% em nível severo+`
          : 'Nenhum caso severo'}
      </p>
    </div>
  )
}

function DepartmentHeatmap({ departments, risks, primaryColor }) {
  if (!departments || departments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Por Departamento</CardTitle>
          <CardDescription>
            Comparação entre áreas da empresa. Áreas com menos de 5 respostas ficam ocultas para preservar o anonimato.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Nenhuma área atingiu o mínimo de 5 respostas ainda. Continue divulgando o questionário para a equipe.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Por Departamento</CardTitle>
        <CardDescription>
          Nível de risco por área. Áreas com menos de 5 respostas não aparecem (anonimato preservado).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-3 font-medium text-gray-500">Área</th>
                <th className="text-center py-2 px-1 font-medium text-gray-500 w-16">Resp.</th>
                {risks.map((r) => (
                  <th
                    key={r.id}
                    title={r.label}
                    className="text-center py-2 px-1 font-medium text-gray-500"
                  >
                    {String(r.number).padStart(2, '0')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.name} className="border-b">
                  <td className="py-2 pr-3 font-medium text-gray-800">{dept.name}</td>
                  <td className="py-2 px-1 text-center text-gray-500">{dept.respondents}</td>
                  {dept.risks.map((r) => {
                    const bg = r.status === 'gap' ? '#f3f4f6' : (LEVEL_COLOR[r.level] || '#f3f4f6')
                    const attenuated = r.status === 'partial'
                    return (
                      <td key={r.id} className="p-0">
                        <div
                          className="h-8 mx-0.5 rounded flex items-center justify-center"
                          title={`${r.score ?? '—'}/100 · ${LEVEL_LABEL[r.level] || 'Não medido'}`}
                          style={{ backgroundColor: bg, opacity: attenuated ? 0.55 : 1 }}
                        >
                          {r.status !== 'gap' && r.score != null && (
                            <span className="text-[10px] font-semibold text-white drop-shadow">
                              {Math.round(r.score)}
                            </span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-3 mt-4 text-xs text-gray-500 flex-wrap">
          <span>Legenda:</span>
          {['baixo', 'moderado', 'alto', 'critico'].map((l) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: LEVEL_COLOR[l] }} />
              {LEVEL_LABEL[l]}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
            Não medido
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ primaryColor, questionnaireSlug, companySlug }) {
  const url = questionnaireSlug
    ? `${window.location.origin}/empresa/${companySlug}/questionario/${questionnaireSlug}`
    : null

  return (
    <Card>
      <CardContent className="py-12 text-center space-y-4">
        <div
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Share2 className="h-8 w-8" style={{ color: primaryColor }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Aguardando respostas</h3>
          <p className="text-sm text-gray-600 mt-1 max-w-md mx-auto">
            O painel é liberado após a primeira resposta. Compartilhe o link do questionário com a equipe
            — a participação é 100% anônima.
          </p>
        </div>
        {url && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-xs font-mono text-gray-700 max-w-full overflow-x-auto">
            {url}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
