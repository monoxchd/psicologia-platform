import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import { blogService } from '../services/blogService'

const ArticleEditorPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(slug)

  const [article, setArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft',
    featured_image_url: '',
    meta_title: '',
    meta_description: '',
    category_ids: [],
    tag_ids: []
  })

  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadFormData()
    if (isEditing) {
      loadArticle()
    }
  }, [slug])

  const loadFormData = async () => {
    try {
      const [categoriesResponse, tagsResponse] = await Promise.all([
        blogService.getAllCategories(),
        blogService.getAllTags()
      ])
      setCategories(categoriesResponse.categories)
      setTags(tagsResponse.tags)
    } catch (error) {
      console.error('Error loading form data:', error)
    }
  }

  const loadArticle = async () => {
    try {
      setLoading(true)
      const response = await blogService.getArticle(slug)
      const articleData = response.article
      setArticle({
        title: articleData.title,
        content: articleData.content,
        excerpt: articleData.excerpt || '',
        status: articleData.status,
        featured_image_url: articleData.featured_image_url || '',
        meta_title: articleData.meta_title || '',
        meta_description: articleData.meta_description || '',
        category_ids: articleData.categories.map(c => c.id),
        tag_ids: articleData.tags.map(t => t.id)
      })
    } catch (error) {
      console.error('Error loading article:', error)
      alert('Erro ao carregar artigo')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (status = article.status) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('authToken')
      const articleData = { ...article, status }

      let response
      if (isEditing) {
        response = await blogService.updateArticle(slug, articleData, token)
      } else {
        response = await blogService.createArticle(articleData, token)
      }

      if (!isEditing) {
        navigate(`/blog-admin/${response.article.slug}/edit`)
      } else {
        setArticle(prev => ({ ...prev, status }))
      }

      alert(isEditing ? 'Artigo atualizado!' : 'Artigo criado!')
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Erro ao salvar artigo')
    } finally {
      setSaving(false)
    }
  }

  const handleCategoryToggle = (categoryId) => {
    setArticle(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }))
  }

  const handleTagToggle = (tagId) => {
    setArticle(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId]
    }))
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/blog-admin" className="text-blue-600 hover:underline">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Editar Artigo' : 'Novo Artigo'}
            </h1>
            {article.status && (
              <Badge className={
                article.status === 'published' ? 'bg-green-100 text-green-800' :
                article.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }>
                {article.status === 'published' ? 'Publicado' :
                 article.status === 'draft' ? 'Rascunho' : 'Arquivado'}
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            {article.status === 'published' && isEditing && (
              <Link to={`/blog/${slug}`} target="_blank">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
              </Link>
            )}
            <Button
              onClick={() => handleSave('draft')}
              variant="outline"
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
            <Button
              onClick={() => handleSave('published')}
              disabled={saving || !article.title || !article.content}
            >
              {saving ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Título *</label>
              <Input
                value={article.title}
                onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título do artigo..."
                className="text-xl"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">Conteúdo *</label>
              <Textarea
                value={article.content}
                onChange={(e) => setArticle(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Escreva o conteúdo do artigo usando HTML..."
                rows={20}
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Você pode usar HTML para formatação (p, h2, h3, strong, em, ul, ol, li, a, etc.)
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium mb-2">Resumo</label>
              <Textarea
                value={article.excerpt}
                onChange={(e) => setArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Breve descrição do artigo (deixe em branco para gerar automaticamente)..."
                rows={3}
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium mb-2">URL da Imagem de Destaque</label>
              <Input
                value={article.featured_image_url}
                onChange={(e) => setArticle(prev => ({ ...prev, featured_image_url: e.target.value }))}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Configurações SEO</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título SEO (máx. 60 caracteres)</label>
                  <Input
                    value={article.meta_title}
                    onChange={(e) => setArticle(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="Título otimizado para motores de busca..."
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500">{article.meta_title.length}/60</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição SEO (máx. 160 caracteres)</label>
                  <Textarea
                    value={article.meta_description}
                    onChange={(e) => setArticle(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="Descrição otimizada para motores de busca..."
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500">{article.meta_description.length}/160</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Categorias</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={article.category_ids.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                      />
                      <span style={{ color: category.color }}>●</span>
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Tags</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={article.tag_ids.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                      />
                      <span className="text-sm">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArticleEditorPage