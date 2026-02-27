import apiService from './api.js'

const questionnaireService = {
  async getQuestionnaire(slug) {
    const response = await apiService.get(`/questionnaires/${slug}`)
    return response.data
  },

  async submitResponse(questionnaireSlug, answers) {
    const response = await apiService.post('/questionnaire_responses', {
      questionnaire_slug: questionnaireSlug,
      answers
    })
    return response.data
  },

  async getResponses(questionnaireSlug) {
    const response = await apiService.get(`/questionnaires/${questionnaireSlug}/responses`)
    return response.data
  },

  async getResponseDetail(responseId) {
    const response = await apiService.get(`/questionnaire_responses/${responseId}`)
    return response.data
  }
}

export default questionnaireService
