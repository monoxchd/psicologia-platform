import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Search, Calendar, Clock, Eye } from 'lucide-react'
import { blogService } from '../services/blogService'
import SEOHead from '../components/SEOHead'

const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadArticles()
    loadCategories()
  }, [searchParams, currentPage])

  const loadArticles = async () => {
    try {
      setLoading(true)
      const response = await blogService.getArticles({
        search: searchParams.get('search'),
        category: searchParams.get('category'),
        page: currentPage
      })
      setArticles(response.articles)
      setTotalPages(response.pagination.total_pages)
    } catch (error) {
      console.error('Error loading articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await blogService.getCategories()
      setCategories(response.categories)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const newSearchParams = new URLSearchParams(searchParams)
    if (searchTerm.trim()) {
      newSearchParams.set('search', searchTerm.trim())
    } else {
      newSearchParams.delete('search')
    }
    setSearchParams(newSearchParams)
    setCurrentPage(1)
  }

  const handleCategoryFilter = (categorySlug) => {
    const newSearchParams = new URLSearchParams(searchParams)
    if (categorySlug && categorySlug !== selectedCategory) {
      newSearchParams.set('category', categorySlug)
      setSelectedCategory(categorySlug)
    } else {
      newSearchParams.delete('category')
      setSelectedCategory('')
    }
    setSearchParams(newSearchParams)
    setCurrentPage(1)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">Carregando artigos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Blog de Saúde Mental - MindCredits"
        description="Artigos especializados sobre saúde mental escritos por terapeutas licenciados. Encontre insights e orientações profissionais."
        type="website"
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog de Saúde Mental</h1>
          <p className="text-xl opacity-90">Insights e orientações de terapeutas licenciados</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar artigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Buscar</Button>
          </form>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!selectedCategory ? "default" : "outline"}
              onClick={() => handleCategoryFilter('')}
              size="sm"
            >
              Todas as Categorias
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                onClick={() => handleCategoryFilter(category.slug)}
                size="sm"
                style={{
                  borderColor: selectedCategory === category.slug ? category.color : undefined,
                  backgroundColor: selectedCategory === category.slug ? category.color : undefined
                }}
              >
                {category.name} ({category.articles_count})
              </Button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              {article.featured_image_url && (
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={article.featured_image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex flex-wrap gap-1 mb-2">
                  {article.categories.map((category) => (
                    <Badge
                      key={category.id}
                      style={{ backgroundColor: category.color }}
                      className="text-white"
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
                <h3 className="text-xl font-semibold line-clamp-2">
                  <Link to={`/blog/${article.slug}`} className="hover:text-blue-600">
                    {article.title}
                  </Link>
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(article.published_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {article.read_time_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {article.views_count}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={article.author.profile_image_url || '/default-avatar.png'}
                    alt={article.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-sm">{article.author.name}</p>
                    <p className="text-xs text-gray-500">{article.author.specialty}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {articles.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Nenhum artigo encontrado</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory
                ? 'Tente ajustar seus filtros de busca.'
                : 'Em breve teremos artigos disponíveis.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogPage