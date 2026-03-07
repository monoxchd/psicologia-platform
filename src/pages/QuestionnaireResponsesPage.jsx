import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Loader2, ArrowLeft, AlertTriangle, CheckCircle2, Clock, ClipboardList, Users } from 'lucide-react'

import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.jsx'
import questionnaireService from '@/services/questionnaireService'

function flagCount(flags) {
  if (!flags || typeof flags !== 'object') return 0
  return Object.entries(flags).filter(([k, v]) =>
    v === true && !k.endsWith('_risk_level') && !k.endsWith('_risk_score') && k !== 'risk_classification'
  ).length
}

export default function QuestionnaireResponsesPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchResponses() {
      try {
        const result = await questionnaireService.getResponses(slug)
        setData(result)
      } catch (err) {
        setError(err.status === 403 ? 'Acesso negado.' : 'Erro ao carregar respostas.')
      } finally {
        setLoading(false)
      }
    }
    fetchResponses()
  }, [slug])

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

  const { questionnaire, responses, stats } = data

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/therapist/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{questionnaire.title}</h1>
            <p className="text-gray-600">{questionnaire.description}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{stats.flagged}</div>
            </CardContent>
          </Card>
        </div>

        {/* Responses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Respostas</CardTitle>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma resposta recebida ainda.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Classificação</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Alertas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => {
                    const flags = flagCount(response.flags)
                    return (
                      <TableRow
                        key={response.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/therapist/respostas/${response.id}`)}
                      >
                        <TableCell className="font-medium">{response.client_name}</TableCell>
                        <TableCell>{response.department || '—'}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              response.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {response.status === 'completed' ? 'Completo' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {response.flags?.risk_classification ? (
                            <Badge
                              className={
                                { baixo: 'bg-green-100 text-green-700',
                                  sem_risco: 'bg-green-100 text-green-700',
                                  moderado: 'bg-amber-100 text-amber-700',
                                  com_risco_identificado: 'bg-red-100 text-red-700',
                                  alto: 'bg-red-100 text-red-700',
                                  critico: 'bg-red-200 text-red-900'
                                }[response.flags.risk_classification] || 'bg-gray-100 text-gray-600'
                              }
                            >
                              {{ baixo: 'Baixo', sem_risco: 'Sem Risco', moderado: 'Moderado',
                                 com_risco_identificado: 'Com Risco', alto: 'Alto', critico: 'Critico'
                              }[response.flags.risk_classification] || response.flags.risk_classification}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {response.completed_at
                            ? new Date(response.completed_at).toLocaleDateString('pt-BR')
                            : new Date(response.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          {response.score != null ? Number(response.score).toFixed(1) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {flags > 0 ? (
                            <span className="inline-flex items-center gap-1 text-amber-600">
                              <AlertTriangle className="h-4 w-4" />
                              {flags}
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
