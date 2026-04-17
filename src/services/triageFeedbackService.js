import api from './api.js'

// Sends aggregated feedback about a triage result. Backend strict-mode
// rejects anything beyond tema + resposta. See
// docs/triagem-terapiaconecta.md for the privacy contract.
export async function submitTriageFeedback({ tema, resposta }) {
  return api.post('/triage_feedback', { tema, resposta })
}
