import apiService from './api.js'

// Therapist-side service for reading activity entries shared by a connected
// patient. Backed by /api/v1/patients/:client_id/entries.
class PatientEntriesService {
  async getEntries(clientId, params = {}) {
    return apiService.get(`/patients/${clientId}/entries`, params)
  }

  async getEntry(clientId, entryId) {
    return apiService.get(`/patients/${clientId}/entries/${entryId}`)
  }
}

export default new PatientEntriesService()
