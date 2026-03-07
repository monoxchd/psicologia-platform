import api from './api.js'

class AdminService {
  // Companies
  async getCompanies(q = '') {
    const params = q ? { q } : {}
    return api.get('/admin/companies', params)
  }

  async getCompany(id) {
    return api.get(`/admin/companies/${id}`)
  }

  async createCompany(data) {
    return api.post('/admin/companies', { company: data })
  }

  async updateCompany(id, data) {
    return api.put(`/admin/companies/${id}`, { company: data })
  }

  async toggleCompanyActive(id) {
    return api.request(`/admin/companies/${id}/toggle_active`, { method: 'PATCH' })
  }

  async addTherapistToCompany(companyId, therapistId) {
    return api.post(`/admin/companies/${companyId}/therapists`, { therapist_id: therapistId })
  }

  async removeTherapistFromCompany(companyId, therapistId) {
    return api.delete(`/admin/companies/${companyId}/therapists/${therapistId}`)
  }

  // Therapists
  async getTherapists(q = '') {
    const params = q ? { q } : {}
    return api.get('/admin/therapists', params)
  }

  async getTherapist(id) {
    return api.get(`/admin/therapists/${id}`)
  }

  async createTherapist(data) {
    return api.post('/admin/therapists', { therapist: data })
  }

  async updateTherapist(id, data) {
    return api.put(`/admin/therapists/${id}`, { therapist: data })
  }

  async toggleTherapistActive(id) {
    return api.request(`/admin/therapists/${id}/toggle_active`, { method: 'PATCH' })
  }

  // Clients
  async getClients(q = '') {
    const params = q ? { q } : {}
    return api.get('/admin/clients', params)
  }

  async getClient(id) {
    return api.get(`/admin/clients/${id}`)
  }

  async createClient(data) {
    return api.post('/admin/clients', { client: data })
  }

  async updateClient(id, data) {
    return api.put(`/admin/clients/${id}`, { client: data })
  }

  async toggleClientActive(id) {
    return api.request(`/admin/clients/${id}/toggle_active`, { method: 'PATCH' })
  }
}

export default new AdminService()
