import apiService from './api.js'

// Clinical-connection service: mutual handshake between Client and Therapist
// via per-user connection codes. Backing endpoints under /api/v1/connection.
class ConnectionService {
  async getMyCode() {
    return apiService.get('/connection/my_code')
  }

  async connectWithCode(partnerCode) {
    return apiService.post('/connection/connect', { partner_code: partnerCode })
  }

  async rotateCode() {
    return apiService.post('/connection/rotate_code', {})
  }

  async getStatus() {
    return apiService.get('/connection/status')
  }

  async getPendingRequests() {
    return apiService.get('/connection/pending_requests')
  }

  async respondToRequest(careRelationshipId, accept) {
    return apiService.post('/connection/respond', {
      care_relationship_id: careRelationshipId,
      accept
    })
  }

  // Therapist-only. Requires an active appointment with the client.
  async requestConnection(clientId) {
    return apiService.post('/connection/request', { client_id: clientId })
  }

  async revoke(careRelationshipId) {
    return apiService.delete(`/connection/${careRelationshipId}`)
  }
}

export default new ConnectionService()
