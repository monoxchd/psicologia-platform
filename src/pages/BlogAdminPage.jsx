import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Edit, Trash2, Plus, Eye } from 'lucide-react'
import { blogService } from '../services/blogService'

const BlogAdminPage = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMyArticles()
  }, [])

  const loadMyArticles = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.error('No auth token found')
        return
      }
      const response = await blogService.getMyArticles(token)
      setArticles(response.articles)
    } catch (error) {
      console.error('Error loading articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (slug) => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return

    try {
      const token = localStorage.getItem('authToken')
      await blogService.deleteArticle(slug, token)
      setArticles(articles.filter(article => article.slug !== slug))
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Falha ao excluir artigo')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return 'Publicado'
      case 'draft': return 'Rascunho'
      case 'archived': return 'Arquivado'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meus Artigos</h1>
        <Link to="/blog-admin/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Artigo
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center gap-4 mb-2">
                    <Badge className={getStatusColor(article.status)}>
                      {getStatusText(article.status)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {article.views_count} visualizações
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(article.updated_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {article.categories.map((category) => (
                      <Badge
                        key={category.id}
                        variant="outline"
                        style={{ borderColor: category.color }}
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {article.status === 'published' && (
                    <Link to={`/blog/${article.slug}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Link to={`/blog-admin/${article.slug}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(article.slug)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Nenhum artigo ainda</h3>
          <p className="text-gray-600 mb-4">Crie seu primeiro artigo para começar</p>
          <Link to="/blog-admin/new">
            <Button>Criar Artigo</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default BlogAdminPage