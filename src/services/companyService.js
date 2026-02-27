import apiService from './api.js'

const companyService = {
  async getCompanyBySlug(slug) {
    const response = await apiService.get(`/companies/${slug}`)
    return response.data
  }
}

export default companyService
