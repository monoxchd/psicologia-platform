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

  async getHrDashboard(slug, { questionnaireSlug } = {}) {
    const qs = questionnaireSlug ? `?questionnaire_slug=${encodeURIComponent(questionnaireSlug)}` : ''
    const response = await apiService.get(`/companies/${slug}/hr_dashboard${qs}`)
    return response.data
  }
}

export default companyService
