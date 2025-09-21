const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const blogService = {
  async getArticles(params = {}) {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.append('search', params.search)
    if (params.category) searchParams.append('category', params.category)
    if (params.tag) searchParams.append('tag', params.tag)
    if (params.page) searchParams.append('page', params.page)

    const response = await fetch(`${API_BASE_URL}/articles?${searchParams}`)
    if (!response.ok) throw new Error('Failed to fetch articles')
    return response.json()
  },

  async getArticle(slug) {
    const response = await fetch(`${API_BASE_URL}/articles/${slug}`)
    if (!response.ok) throw new Error('Failed to fetch article')
    return response.json()
  },

  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/articles/categories`)
    if (!response.ok) throw new Error('Failed to fetch categories')
    return response.json()
  },

  async getTags() {
    const response = await fetch(`${API_BASE_URL}/articles/tags`)
    if (!response.ok) throw new Error('Failed to fetch tags')
    return response.json()
  },

  async getMyArticles(token) {
    const response = await fetch(`${API_BASE_URL}/articles/my_articles`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) throw new Error('Failed to fetch my articles')
    return response.json()
  },

  async createArticle(articleData, token) {
    const response = await fetch(`${API_BASE_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ article: articleData })
    })
    if (!response.ok) throw new Error('Failed to create article')
    return response.json()
  },

  async updateArticle(slug, articleData, token) {
    const response = await fetch(`${API_BASE_URL}/articles/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ article: articleData })
    })
    if (!response.ok) throw new Error('Failed to update article')
    return response.json()
  },

  async deleteArticle(slug, token) {
    const response = await fetch(`${API_BASE_URL}/articles/${slug}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) throw new Error('Failed to delete article')
  },

  async getAllCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`)
    if (!response.ok) throw new Error('Failed to fetch all categories')
    return response.json()
  },

  async getAllTags() {
    const response = await fetch(`${API_BASE_URL}/tags`)
    if (!response.ok) throw new Error('Failed to fetch all tags')
    return response.json()
  },

  async createCategory(categoryData, token) {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ category: categoryData })
    })
    if (!response.ok) throw new Error('Failed to create category')
    return response.json()
  },

  async createTag(tagData, token) {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ tag: tagData })
    })
    if (!response.ok) throw new Error('Failed to create tag')
    return response.json()
  }
}