import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  FileText,
  PlusCircle,
  User,
  Star,
  Eye,
  Calendar,
  TrendingUp,
  Edit,
  LogOut
} from 'lucide-react'
import authService from '../services/authService'
import { blogService } from '../services/blogService'

const TherapistDashboardPage = () => {
  const [user, setUser] = useState(null)
  const [articles, setArticles] = useState([])
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Get current user
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)

      // Get therapist's articles
      const token = localStorage.getItem('auth_token')
      const articlesResponse = await blogService.getMyArticles(token)

      if (articlesResponse.articles) {
        const userArticles = articlesResponse.articles

        // Calculate stats
        const published = userArticles.filter(a => a.status === 'published')
        const drafts = userArticles.filter(a => a.status === 'draft')
        const totalViews = published.reduce((sum, article) => sum + (article.views_count || 0), 0)

        setStats({
          totalArticles: userArticles.length,
          publishedArticles: published.length,
          draftArticles: drafts.length,
          totalViews: totalViews
        })

        // Get recent articles (last 3)
        setArticles(userArticles.slice(0, 3))
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    window.location.href = '/login'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bem-vindo, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie seu perfil e artigos
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Artigos
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalArticles}</div>
              <p className="text-xs text-gray-600 mt-1">
                {stats.publishedArticles} publicados, {stats.draftArticles} rascunhos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Visualizações
              </CardTitle>
              <Eye className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-gray-600 mt-1">
                Em {stats.publishedArticles} artigos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avaliação
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.rating || 4.0} <span className="text-sm font-normal text-gray-600">/5.0</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Avaliação profissional
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Valor da Sessão
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {user?.credits_per_minute || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {user?.experience_years || 0} anos de experiência
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Gerencie seu conteúdo e perfil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/blog-admin/new">
                    <Button className="w-full" size="lg">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Novo Artigo
                    </Button>
                  </Link>
                  <Link to="/blog-admin">
                    <Button variant="outline" className="w-full" size="lg">
                      <FileText className="h-4 w-4 mr-2" />
                      Meus Artigos
                    </Button>
                  </Link>
                  <Link to="/therapist/profile/edit">
                    <Button variant="outline" className="w-full" size="lg">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Articles */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Artigos Recentes</CardTitle>
                    <CardDescription>
                      Seus últimos artigos criados
                    </CardDescription>
                  </div>
                  <Link to="/blog-admin">
                    <Button variant="ghost" size="sm">
                      Ver Todos →
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {articles.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Você ainda não criou nenhum artigo
                    </p>
                    <Link to="/blog-admin/new">
                      <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Criar Primeiro Artigo
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {article.title}
                            </h3>
                            <Badge
                              className={
                                article.status === 'published'
                                  ? 'bg-green-100 text-green-800'
                                  : article.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {article.status === 'published'
                                ? 'Publicado'
                                : article.status === 'draft'
                                ? 'Rascunho'
                                : 'Arquivado'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(article.updated_at)}
                            </span>
                            {article.status === 'published' && (
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {article.views_count} visualizações
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Link to={`/blog-admin/${article.slug}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {article.status === 'published' && (
                            <Link to={`/blog/${article.slug}`} target="_blank">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Seu Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg">{user?.name}</h3>
                  <p className="text-sm text-gray-600">{user?.specialty}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    CRP: {user?.crp_number || 'Não informado'}
                  </p>
                </div>
                {user?.bio && (
                  <p className="text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded">
                    {user.bio}
                  </p>
                )}
                <Link to="/therapist/profile/edit">
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Precisa de Ajuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-800 mb-4">
                  Confira nosso guia para terapeutas e aprenda a criar artigos impactantes.
                </p>
                <Link to="/blog">
                  <Button variant="outline" className="w-full">
                    Ver Blog
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TherapistDashboardPage
