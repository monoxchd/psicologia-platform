import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.jsx'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart.jsx'
import {
  Users, UserCheck, AlertTriangle, Calendar,
  Shield, ShieldCheck, Download, TrendingUp, TrendingDown,
  Loader2, Activity, ArrowUpRight, ArrowDownRight,
  Moon, Repeat, GraduationCap, Lightbulb, Target, BarChart3
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell,
  AreaChart, Area,
  ScatterChart, Scatter, ZAxis, Legend
} from 'recharts'
import { toast } from 'sonner'
import companyService from '@/services/companyService'
import horizontalLogo from '../assets/horizontal-logo.png'

function riskColor(score) {
  if (score < 4) return '#22c55e'
  if (score < 6) return '#f59e0b'
  if (score < 8) return '#f97316'
  return '#ef4444'
}

function riskLabel(score) {
  if (score < 4) return 'Baixo'
  if (score < 6) return 'Moderado'
  if (score < 8) return 'Alto'
  return 'Crítico'
}

function trendPercentage(current, previous) {
  if (!previous || previous === 0) return null
  return (((current - previous) / previous) * 100).toFixed(0)
}

const FREQ_LABELS = { 1: 'Nunca', 2: 'Raramente', 3: 'Às vezes', 4: 'Frequentemente', 5: 'Sempre' }

const TRAINING_COLORS = {
  'Sem Treinamento': '#f59e0b',
  'Treinamento Recente': '#22c55e',
  'Treinamento Antigo': '#3b82f6'
}

export default function HrDashboardPage() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [insights, setInsights] = useState(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('operational')

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const result = await companyService.getHrDashboard(slug)
        setData(result)
      } catch (err) {
        setError('Dados não disponíveis para esta empresa.')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [slug])

  useEffect(() => {
    if (activeTab === 'insights' && !insights && !insightsLoading) {
      async function fetchInsights() {
        setInsightsLoading(true)
        try {
          const result = await companyService.getHrInsights(slug)
          setInsights(result)
        } catch (err) {
          console.error('Error loading insights:', err)
        } finally {
          setInsightsLoading(false)
        }
      }
      fetchInsights()
    }
  }, [activeTab, insights, insightsLoading, slug])

  const sessionTrend = useMemo(() => {
    if (!data) return null
    return trendPercentage(data.metrics.sessions_this_month, data.metrics.sessions_last_month)
  }, [data])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          <p className="text-sm text-gray-500">Carregando painel...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Painel não disponível</h1>
          <p className="text-gray-500 text-sm">{error || 'Verifique o link e tente novamente.'}</p>
        </div>
      </div>
    )
  }

  const { company, metrics, concerns_distribution, risk_distribution, department_breakdown, monthly_sessions, nr1_compliance } = data
  const primaryColor = company.primary_color || '#4f46e5'
  const secondaryColor = company.secondary_color || '#6366f1'

  const concernsConfig = Object.fromEntries(
    (concerns_distribution || []).map((item, i) => [
      item.concern,
      { label: item.concern, color: i === 0 ? primaryColor : `${primaryColor}${['cc', 'aa', '88', '66', '55', '44', '33'][i] || '55'}` }
    ])
  )

  const riskConfig = Object.fromEntries(
    (risk_distribution || []).map(item => [
      item.level,
      { label: item.level, color: item.color }
    ])
  )

  const sessionsConfig = {
    sessions: { label: 'Sessões', color: primaryColor }
  }

  const deptConfig = Object.fromEntries(
    (department_breakdown || []).map(item => [
      item.department,
      { label: item.department, color: riskColor(item.avg_risk) }
    ])
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ───────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: 'white', borderColor: `${primaryColor}20` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link to={`/empresa/${slug}`}>
                <img
                  src={company.logo_url || horizontalLogo}
                  alt={company.logo_url ? `${company.name} Logo` : 'Terapia Conecta'}
                  className="h-7 object-contain"
                />
              </Link>
              <div
                className="w-px h-6"
                style={{ backgroundColor: `${primaryColor}30` }}
              />
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" style={{ color: primaryColor }} />
                <span className="text-sm font-semibold text-gray-900">Painel RH</span>
              </div>
            </div>
            <span
              className="text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
            >
              {company.name}
            </span>
          </div>
        </div>
      </header>

      {/* ── Title Banner ─────────────────────────────────── */}
      <section
        className="px-4 sm:px-6 lg:px-8 py-8"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}06 0%, ${secondaryColor}10 50%, ${primaryColor}04 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Saúde Mental Corporativa
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Visão geral do programa de bem-estar — {company.name}
              </p>
            </div>
            <div
              className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
            >
              <div
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: primaryColor }}
              />
              Dados em tempo real
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="-mt-4">
          <TabsList className="mb-6">
            <TabsTrigger value="operational" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Painel Operacional
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" />
              Insights Analíticos
              {insights && (
                <span className="text-[10px] opacity-60 ml-1">{insights.period}</span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: Operational ───────────────────────── */}
          <TabsContent value="operational">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Card 1: Enrolled */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Colaboradores Cadastrados
                  </CardTitle>
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}12` }}
                  >
                    <Users className="h-4 w-4" style={{ color: primaryColor }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 tabular-nums">
                    {metrics.enrolled_employees}
                    <span className="text-base font-normal text-gray-400">/{metrics.employee_count}</span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Adesão</span>
                      <span className="font-semibold" style={{ color: primaryColor }}>{metrics.enrollment_rate}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(metrics.enrollment_rate, 100)}%`,
                          backgroundColor: primaryColor
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Active */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Colaboradores Ativos
                  </CardTitle>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-50">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 tabular-nums">
                    {metrics.active_employees}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Com sessão nos últimos 30 dias
                  </p>
                </CardContent>
              </Card>

              {/* Card 3: Avg Risk */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Score Médio de Risco
                  </CardTitle>
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${riskColor(metrics.average_risk_score)}15` }}
                  >
                    <AlertTriangle className="h-4 w-4" style={{ color: riskColor(metrics.average_risk_score) }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-3xl font-bold tabular-nums"
                      style={{ color: riskColor(metrics.average_risk_score) }}
                    >
                      {metrics.average_risk_score}
                    </span>
                    <span className="text-sm font-normal text-gray-400">/10</span>
                  </div>
                  <Badge
                    className="mt-2 text-[10px] px-2 py-0.5 border-0"
                    style={{
                      backgroundColor: `${riskColor(metrics.average_risk_score)}15`,
                      color: riskColor(metrics.average_risk_score)
                    }}
                  >
                    {riskLabel(metrics.average_risk_score)}
                  </Badge>
                </CardContent>
              </Card>

              {/* Card 4: Sessions This Month */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Sessões Este Mês
                  </CardTitle>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-violet-50">
                    <Calendar className="h-4 w-4 text-violet-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 tabular-nums">
                    {metrics.sessions_this_month}
                  </div>
                  {sessionTrend !== null && (
                    <div className="flex items-center gap-1 mt-1">
                      {Number(sessionTrend) >= 0 ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={`text-xs font-medium ${Number(sessionTrend) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {Math.abs(Number(sessionTrend))}% vs. mês anterior
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              {/* Concerns Distribution */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-gray-900">Principais Preocupações</CardTitle>
                  <CardDescription className="text-xs">Sintomas e áreas reportados pelos colaboradores</CardDescription>
                </CardHeader>
                <CardContent>
                  {concerns_distribution && concerns_distribution.length > 0 ? (
                    <ChartContainer config={concernsConfig} className="aspect-[4/3] w-full">
                      <BarChart
                        data={concerns_distribution}
                        layout="vertical"
                        margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
                      >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                        <YAxis
                          dataKey="concern"
                          type="category"
                          width={110}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <XAxis type="number" hide />
                        <ChartTooltip
                          content={<ChartTooltipContent hideLabel />}
                          cursor={{ fill: `${primaryColor}08` }}
                        />
                        <Bar
                          dataKey="count"
                          radius={[0, 6, 6, 0]}
                          fill={primaryColor}
                          maxBarSize={28}
                          name="Ocorrências"
                        />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                      Sem dados disponíveis
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-gray-900">Distribuição de Risco</CardTitle>
                  <CardDescription className="text-xs">Classificação dos colaboradores por nível de risco</CardDescription>
                </CardHeader>
                <CardContent>
                  {risk_distribution && risk_distribution.some(r => r.count > 0) ? (
                    <div className="flex items-center gap-6">
                      <ChartContainer config={riskConfig} className="aspect-square w-full max-w-[200px] mx-auto">
                        <PieChart>
                          <ChartTooltip content={<ChartTooltipContent nameKey="level" />} />
                          <Pie
                            data={risk_distribution.filter(r => r.count > 0)}
                            dataKey="count"
                            nameKey="level"
                            cx="50%"
                            cy="50%"
                            innerRadius="55%"
                            outerRadius="85%"
                            strokeWidth={2}
                            stroke="#fff"
                            paddingAngle={2}
                          >
                            {risk_distribution.filter(r => r.count > 0).map((entry) => (
                              <Cell key={entry.level} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                      <div className="flex flex-col gap-2.5 min-w-[120px]">
                        {risk_distribution.map((item) => (
                          <div key={item.level} className="flex items-center gap-2.5">
                            <div
                              className="h-3 w-3 rounded-sm shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <div className="flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="text-xs text-gray-600">{item.level}</span>
                                <span className="text-sm font-semibold text-gray-900 tabular-nums">{item.count}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                      Sem dados disponíveis
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Sessions */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-gray-900">Sessões por Mês</CardTitle>
                  <CardDescription className="text-xs">Evolução do uso do programa nos últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  {monthly_sessions && monthly_sessions.length > 0 ? (
                    <ChartContainer config={sessionsConfig} className="aspect-[2/1] w-full">
                      <AreaChart
                        data={monthly_sessions}
                        margin={{ left: 0, right: 8, top: 12, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={primaryColor} stopOpacity={0.25} />
                            <stop offset="100%" stopColor={primaryColor} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                          width={32}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="sessions"
                          stroke={primaryColor}
                          strokeWidth={2}
                          fill="url(#sessionGradient)"
                          name="sessions"
                          dot={{ r: 3, fill: primaryColor, stroke: '#fff', strokeWidth: 2 }}
                          activeDot={{ r: 5, fill: primaryColor, stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                      Sem dados disponíveis
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Department Breakdown */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-gray-900">Risco por Departamento</CardTitle>
                  <CardDescription className="text-xs">Score médio de risco e volume de sessões</CardDescription>
                </CardHeader>
                <CardContent>
                  {department_breakdown && department_breakdown.length > 0 ? (
                    <ChartContainer config={deptConfig} className="aspect-[4/3] w-full">
                      <BarChart
                        data={department_breakdown}
                        layout="vertical"
                        margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
                      >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                        <YAxis
                          dataKey="department"
                          type="category"
                          width={100}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <XAxis type="number" hide />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value, name, item) => (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-muted-foreground text-xs">Score: {item.payload.avg_risk}</span>
                                  <span className="text-muted-foreground text-xs">Sessões: {item.payload.sessions}</span>
                                  <span className="text-muted-foreground text-xs">Colab.: {item.payload.employees}</span>
                                </div>
                              )}
                            />
                          }
                          cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar
                          dataKey="avg_risk"
                          radius={[0, 6, 6, 0]}
                          maxBarSize={28}
                          name="Score Risco"
                        >
                          {department_breakdown.map((entry) => (
                            <Cell key={entry.department} fill={riskColor(entry.avg_risk)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                      Sem dados disponíveis
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* NR-1 Compliance Section */}
            <Card className="border-0 shadow-sm mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: nr1_compliance.status === 'em_conformidade' ? '#22c55e15' : '#f59e0b15'
                      }}
                    >
                      {nr1_compliance.status === 'em_conformidade' ? (
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Shield className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-900">
                        Conformidade NR-1
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Programa de Gerenciamento de Riscos Psicossociais
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    className="border-0 text-xs px-3 py-1"
                    style={{
                      backgroundColor: nr1_compliance.status === 'em_conformidade' ? '#22c55e15' : '#f59e0b15',
                      color: nr1_compliance.status === 'em_conformidade' ? '#16a34a' : '#d97706'
                    }}
                  >
                    {nr1_compliance.status === 'em_conformidade' ? 'Em Conformidade' : 'Ação Necessária'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Assessment rate + button */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm text-gray-600">Avaliações concluídas</span>
                        <span className="text-2xl font-bold text-gray-900 tabular-nums">
                          {nr1_compliance.assessment_rate}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(nr1_compliance.assessment_rate, 100)}%`,
                            backgroundColor: nr1_compliance.assessment_rate >= 80 ? '#22c55e' : '#f59e0b'
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Meta: 80% dos colaboradores com avaliação psicossocial concluída
                      </p>
                    </div>

                    <div
                      className="p-4 rounded-xl text-sm leading-relaxed"
                      style={{
                        backgroundColor: nr1_compliance.status === 'em_conformidade' ? '#f0fdf4' : '#fffbeb',
                        color: nr1_compliance.status === 'em_conformidade' ? '#166534' : '#92400e'
                      }}
                    >
                      {nr1_compliance.status === 'em_conformidade'
                        ? 'A empresa está em conformidade com as exigências da NR-1 para riscos psicossociais. Continue monitorando os indicadores.'
                        : 'É necessário ampliar a cobertura das avaliações psicossociais para atingir a conformidade. Recomendamos ações de engajamento.'
                      }
                    </div>

                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => toast.info('Relatório PGR em desenvolvimento')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Relatório PGR
                    </Button>
                  </div>

                  {/* Right: Risk factors */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">
                      Principais Fatores de Risco
                    </h4>
                    {nr1_compliance.top_risk_factors && nr1_compliance.top_risk_factors.length > 0 ? (
                      <div className="space-y-4">
                        {nr1_compliance.top_risk_factors.map((factor, i) => (
                          <div key={i}>
                            <div className="flex justify-between items-baseline mb-1.5">
                              <span className="text-sm text-gray-600">{factor.factor}</span>
                              <span className="text-sm font-semibold text-gray-900 tabular-nums">
                                {factor.percentage}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(factor.percentage, 100)}%`,
                                  backgroundColor: factor.percentage > 30 ? '#ef4444' : factor.percentage > 15 ? '#f59e0b' : '#22c55e'
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Nenhum fator de risco identificado</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 2: Insights Analíticos ────────────────── */}
          <TabsContent value="insights">
            {insightsLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500">Processando análise estatística...</p>
                </div>
              </div>
            ) : insights ? (
              <InsightsContent insights={insights} primaryColor={primaryColor} />
            ) : (
              <div className="flex items-center justify-center py-24">
                <div className="text-center">
                  <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Não foi possível carregar os insights.</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-gray-900 text-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-xs space-y-1">
          <p>TerapiaConecta — Programa de saúde mental corporativo</p>
          <p>&copy; 2026 TerapiaConecta. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

/* ── Insights Tab Component ──────────────────────────────── */

function InsightsContent({ insights, primaryColor }) {
  const { insights: data, total_respondents, period } = insights
  const { sleep_anxiety, work_frequency, training } = data

  // Derived values for recommendations
  const untrained = training.distribution.find(d => d.group === 'Sem Treinamento')
  const regularWorkers = work_frequency.groups.find(g => g.group === 'Regularmente')
  const occasionalWorkers = work_frequency.groups.find(g => g.group === 'Ocasionalmente')

  const confidenceDiff = regularWorkers?.avg_confidence && occasionalWorkers?.avg_confidence
    ? (((regularWorkers.avg_confidence - occasionalWorkers.avg_confidence) / occasionalWorkers.avg_confidence) * 100).toFixed(1)
    : null

  const anxietyDiff = regularWorkers?.avg_anxiety && occasionalWorkers?.avg_anxiety
    ? (((occasionalWorkers.avg_anxiety - regularWorkers.avg_anxiety) / regularWorkers.avg_anxiety) * 100).toFixed(1)
    : null

  const trainedGroup = training.distribution.find(d => d.group === 'Treinamento Recente')
  const confidenceGap = trainedGroup?.avg_confidence && untrained?.avg_confidence
    ? (((trainedGroup.avg_confidence - untrained.avg_confidence) / untrained.avg_confidence) * 100).toFixed(1)
    : null

  // Chart configs
  const scatterConfig = { respondentes: { label: 'Respondentes', color: primaryColor } }

  const freqConfig = {
    confidence: { label: 'Confiança', color: primaryColor },
    anxiety: { label: 'Ansiedade', color: '#f59e0b' }
  }

  const trainingConfig = Object.fromEntries(
    training.distribution.map(d => [
      d.group,
      { label: d.group, color: TRAINING_COLORS[d.group] || '#94a3b8' }
    ])
  )

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm" style={{ borderLeft: `4px solid ${primaryColor}` }}>
          <CardContent className="pt-5 pb-4 text-center">
            <div className="text-3xl font-bold" style={{ color: primaryColor }}>{total_respondents}</div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Respondentes</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm" style={{ borderLeft: '4px solid #3b82f6' }}>
          <CardContent className="pt-5 pb-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{sleep_anxiety.sample_size}</div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Análises Completas</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm" style={{ borderLeft: '4px solid #f59e0b' }}>
          <CardContent className="pt-5 pb-4 text-center">
            <div className="text-3xl font-bold text-amber-600">{sleep_anxiety.correlation}</div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Correlação Sono-Ansiedade</div>
          </CardContent>
        </Card>
      </div>

      {/* ── INSIGHT 1: Sleep × Anxiety ─────────────────── */}
      <Card className="border-0 shadow-sm overflow-hidden" style={{ borderLeft: `4px solid #3b82f6` }}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
              <Moon className="h-4.5 w-4.5 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Insight 01</p>
              <CardTitle className="text-lg font-bold text-gray-900">
                Dificuldade para Dormir & Ansiedade no Trabalho
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            A correlação entre dificuldade para dormir e ansiedade no trabalho em altura é{' '}
            <strong className="text-gray-900">significativa (r={sleep_anxiety.correlation})</strong>.
            Colaboradores que relatam problemas de sono também apresentam níveis mais elevados de ansiedade durante o trabalho.
          </p>

          {/* Scatter/Bubble Chart */}
          {sleep_anxiety.scatter_data && sleep_anxiety.scatter_data.length > 0 && (
            <ChartContainer config={scatterConfig} className="aspect-[16/9] w-full">
              <ScatterChart margin={{ left: 8, right: 24, top: 12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[0.5, 5.5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Dificuldade para Dormir (1-5)', position: 'insideBottom', offset: -2, style: { fontSize: 11, fill: '#94a3b8', fontWeight: 600 } }}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  domain={[0.5, 5.5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Ansiedade no Trabalho (1-5)', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: '#94a3b8', fontWeight: 600 } }}
                />
                <ZAxis dataKey="count" range={[60, 500]} />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-xs">
                        <p className="text-gray-500">Sono: <span className="font-semibold text-gray-900">{FREQ_LABELS[d.x]}</span></p>
                        <p className="text-gray-500">Ansiedade: <span className="font-semibold text-gray-900">{FREQ_LABELS[d.y]}</span></p>
                        <p className="font-semibold text-blue-600 mt-1">{d.count} respondentes</p>
                      </div>
                    )
                  }}
                />
                <Scatter
                  data={sleep_anxiety.scatter_data}
                  fill="#3b82f6"
                  fillOpacity={0.55}
                  stroke="#2563eb"
                  strokeWidth={1}
                />
              </ScatterChart>
            </ChartContainer>
          )}

          {/* Key Insight Callout */}
          <div className="rounded-xl p-5" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a40 100%)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Oportunidade de Ação</span>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">
              Implementar um <strong style={{ color: primaryColor }}>programa de higiene do sono</strong> pode ter impacto
              direto na redução de ansiedade. A correlação de <strong>{sleep_anxiety.correlation}</strong> indica que
              melhorias no sono estão associadas a menores níveis de ansiedade no trabalho.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── INSIGHT 2: Work Frequency ──────────────────── */}
      <Card className="border-0 shadow-sm overflow-hidden" style={{ borderLeft: '4px solid #f59e0b' }}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
              <Repeat className="h-4.5 w-4.5 text-amber-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Insight 02</p>
              <CardTitle className="text-lg font-bold text-gray-900">
                Frequência de Trabalho: Confiança vs Ansiedade
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            Existe uma diferença marcante entre trabalhadores que trabalham <strong className="text-gray-900">regularmente</strong> versus <strong className="text-gray-900">ocasionalmente</strong> em altura.
          </p>

          {/* Grouped Bar Chart */}
          {work_frequency.groups && work_frequency.groups.length > 0 && (
            <ChartContainer config={freqConfig} className="aspect-[2/1] w-full">
              <BarChart
                data={work_frequency.groups}
                margin={{ left: 0, right: 8, top: 12, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="group"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const entry = work_frequency.groups.find(g => g.group === label)
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-xs">
                        <p className="font-semibold text-gray-900 mb-1">{label}</p>
                        <p className="text-gray-500">Confiança: <span className="font-semibold" style={{ color: primaryColor }}>{entry?.avg_confidence}/5</span></p>
                        <p className="text-gray-500">Ansiedade: <span className="font-semibold text-amber-600">{entry?.avg_anxiety}/5</span></p>
                        <p className="text-gray-400 mt-1">{entry?.count} trabalhadores</p>
                      </div>
                    )
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-gray-600">{value === 'avg_confidence' ? 'Confiança' : 'Ansiedade'}</span>
                  )}
                />
                <Bar dataKey="avg_confidence" name="Confiança" fill={primaryColor} radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="avg_anxiety" name="Ansiedade" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ChartContainer>
          )}

          {/* Comparison stats */}
          {confidenceDiff && anxietyDiff && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Confiança</p>
                <p className="text-sm text-gray-700">
                  Regulares: <strong className="text-gray-900">{regularWorkers.avg_confidence}/5</strong> vs Ocasionais: <strong className="text-gray-900">{occasionalWorkers.avg_confidence}/5</strong>
                </p>
                <p className="text-xs font-semibold mt-1" style={{ color: primaryColor }}>+{confidenceDiff}% de diferença</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Ansiedade</p>
                <p className="text-sm text-gray-700">
                  Regulares: <strong className="text-gray-900">{regularWorkers.avg_anxiety}/5</strong> vs Ocasionais: <strong className="text-gray-900">{occasionalWorkers.avg_anxiety}/5</strong>
                </p>
                <p className="text-xs font-semibold text-amber-600 mt-1">-{anxietyDiff}% de diferença</p>
              </div>
            </div>
          )}

          {/* Key Insight Callout */}
          <div className="rounded-xl p-5" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a40 100%)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Oportunidade de Ação</span>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">
              Trabalhadores ocasionais são um grupo de <strong style={{ color: primaryColor }}>alto risco</strong>.
              Eles têm menos confiança e mais ansiedade. Programas de treinamento contínuo e mentorado entre
              trabalhadores regulares e ocasionais podem transformar esse perfil.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── INSIGHT 3: Training ────────────────────────── */}
      <Card className="border-0 shadow-sm overflow-hidden" style={{ borderLeft: `4px solid ${primaryColor}` }}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${primaryColor}12` }}>
              <GraduationCap className="h-4.5 w-4.5" style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Insight 03</p>
              <CardTitle className="text-lg font-bold text-gray-900">
                Treinamento: O Fator Crítico
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            A distribuição de treinamento revela uma <strong className="text-gray-900">lacuna crítica</strong> na capacitação dos trabalhadores.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Training Doughnut */}
            {training.distribution && training.distribution.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Distribuição de Treinamento</h4>
                <ChartContainer config={trainingConfig} className="aspect-square w-full max-w-[240px] mx-auto">
                  <PieChart>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const d = payload[0].payload
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-xs">
                            <p className="font-semibold text-gray-900">{d.group}</p>
                            <p className="text-gray-500">{d.count} trabalhadores ({d.percentage}%)</p>
                          </div>
                        )
                      }}
                    />
                    <Pie
                      data={training.distribution}
                      dataKey="count"
                      nameKey="group"
                      cx="50%"
                      cy="50%"
                      innerRadius="50%"
                      outerRadius="82%"
                      strokeWidth={2}
                      stroke="#fff"
                      paddingAngle={3}
                    >
                      {training.distribution.map((entry) => (
                        <Cell key={entry.group} fill={TRAINING_COLORS[entry.group] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={48}
                      formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                    />
                  </PieChart>
                </ChartContainer>
              </div>
            )}

            {/* Confidence by Training */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Confiança por Nível de Treinamento</h4>
              <div className="space-y-3">
                {training.distribution.map((group) => (
                  <div key={group.group} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: TRAINING_COLORS[group.group] }}
                        />
                        <span className="text-sm font-medium text-gray-700">{group.group}</span>
                      </div>
                      <span className="text-xs text-gray-500">{group.count} ({group.percentage}%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${((group.avg_confidence || 0) / 5) * 100}%`,
                            backgroundColor: TRAINING_COLORS[group.group]
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 tabular-nums w-12 text-right">
                        {group.avg_confidence || '—'}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {training.correlation !== undefined && (
                <p className="text-xs text-gray-500 mt-3">
                  Correlação treinamento-confiança: <strong className="text-gray-700">r={training.correlation}</strong> (n={training.sample_size})
                </p>
              )}
            </div>
          </div>

          {/* Stats highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {untrained && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-center">
                <div className="text-2xl font-bold text-amber-600">{untrained.percentage}%</div>
                <div className="text-xs text-amber-700 font-medium">Sem Treinamento</div>
              </div>
            )}
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-center">
              <div className="text-2xl font-bold text-blue-600">{training.correlation}</div>
              <div className="text-xs text-blue-700 font-medium">Correlação (r)</div>
            </div>
            {confidenceGap && (
              <div className="p-3 rounded-lg border text-center" style={{ backgroundColor: `${primaryColor}08`, borderColor: `${primaryColor}20` }}>
                <div className="text-2xl font-bold" style={{ color: primaryColor }}>+{confidenceGap}%</div>
                <div className="text-xs font-medium" style={{ color: primaryColor }}>Gap de Confiança</div>
              </div>
            )}
          </div>

          {/* Key Insight Callout */}
          <div className="rounded-xl p-5" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a40 100%)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Oportunidade de Ação</span>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">
              <strong style={{ color: primaryColor }}>Treinamento é o maior preditor de confiança e segurança.</strong>{' '}
              {untrained && <>Com <strong>{untrained.percentage}%</strong> dos trabalhadores sem treinamento e </>}
              uma correlação de <strong>r={training.correlation}</strong>, investir em programas de capacitação contínua
              é o caminho mais eficaz para melhorar a segurança.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Recommendations ────────────────────────────── */}
      <Card className="border-0 shadow-none overflow-hidden">
        <div
          className="p-6 sm:p-8 rounded-xl text-white"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 60%, #1e3a5f 100%)` }}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <Target className="h-5 w-5" />
            <h3 className="text-lg font-bold">Plano de Ação Recomendado</h3>
          </div>
          <div className="space-y-3.5">
            {sleep_anxiety.correlation > 0.15 && (
              <div className="flex items-start gap-3 text-sm opacity-95">
                <span className="text-amber-300 font-bold shrink-0">Fase 1</span>
                <p>Implementar programa de higiene do sono com foco em trabalhadores com ansiedade elevada (correlação r={sleep_anxiety.correlation}).</p>
              </div>
            )}
            {untrained && untrained.percentage > 10 && (
              <div className="flex items-start gap-3 text-sm opacity-95">
                <span className="text-amber-300 font-bold shrink-0">Fase 2</span>
                <p>Oferecer treinamento específico para os {untrained.percentage}% sem certificação — priorizar trabalhadores ocasionais.</p>
              </div>
            )}
            {confidenceDiff && (
              <div className="flex items-start gap-3 text-sm opacity-95">
                <span className="text-amber-300 font-bold shrink-0">Fase 3</span>
                <p>Criar programa de mentorado entre trabalhadores regulares (mais confiantes, +{confidenceDiff}%) e ocasionais.</p>
              </div>
            )}
            <div className="flex items-start gap-3 text-sm opacity-95">
              <span className="text-amber-300 font-bold shrink-0">Fase 4</span>
              <p>Monitorar indicadores de sono, ansiedade e confiança a cada trimestre.</p>
            </div>
            <div className="flex items-start gap-3 text-sm opacity-95">
              <span className="text-amber-300 font-bold shrink-0">Fase 5</span>
              <p>Revalidar treinamento anualmente — nenhum trabalhador com treinamento superior a 2 anos sem reciclagem.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Methodology Note ───────────────────────────── */}
      <div className="rounded-lg bg-gray-50 border border-gray-100 px-5 py-4">
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong className="text-gray-500">Metodologia:</strong> Análise de correlação de Pearson com {total_respondents} respondentes.
          Dados coletados via questionário psicossocial validado para trabalho em altura.
          Período: {period}.
        </p>
      </div>
    </div>
  )
}
