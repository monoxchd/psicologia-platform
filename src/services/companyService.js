import apiService from './api.js'

const companyService = {
  async getCompanyBySlug(slug) {
    const response = await apiService.get(`/companies/${slug}`)
    return response.data
  },

  async getCompanyTherapists(slug) {
    const response = await apiService.get(`/companies/${slug}/therapists`)
    return response.data
  },

  async getHrDashboard(slug) {
    const response = await apiService.get(`/companies/${slug}/hr_dashboard`)
    return response.data
  },

  async getHrInsights(slug) {
    const response = await apiService.get(`/companies/${slug}/hr_insights`)
    return response.data
  }
}

export default companyService
