import api from './api'

class LeadService {
  async createLead(leadData) {
    try {
      const response = await api.post('/leads', { lead: leadData })
      return response
    } catch (error) {
      console.error('Failed to create lead:', error)
      throw error
    }
  }
}

export default new LeadService()
