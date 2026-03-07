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

  async uploadCompanyLogo(companyId, imageFile) {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
    const token = localStorage.getItem('auth_token')
    const formData = new FormData()
    formData.append('logo', imageFile)

    const response = await fetch(`${API_BASE_URL}/admin/companies/${companyId}/upload_logo`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    })

    const data = await response.json()
    if (!response.ok) {
      const error = new Error(data.error || 'Erro ao enviar logo')
      error.errors = data.errors
      throw error
    }
    return data
  }

  async destroyCompanyLogo(companyId) {
    return api.delete(`/admin/companies/${companyId}/destroy_logo`)
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

  // Leads (B2C)
  async getLeads(params = {}) {
    return api.get('/admin/leads', params)
  }

  async updateLead(id, data) {
    return api.put(`/admin/leads/${id}`, { lead: data })
  }

  // DNF Leads (B2B)
  async getDnfLeads(params = {}) {
    return api.get('/admin/dnf_leads', params)
  }

  async updateDnfLead(id, data) {
    return api.put(`/admin/dnf_leads/${id}`, { dnf_lead: data })
  }
}

export default new AdminService()
