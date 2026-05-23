import api from './api.js'

const paymentService = {
  // Creates an Asaas charge with split for an appointment that's in
  // `pending_payment`. Returns { payment_id, invoice_url, expires_at, status }.
  async createPayment(appointmentId) {
    return api.post('/payments', { appointment_id: appointmentId })
  },

  // Polled by ConfirmationPage after the user returns from the Asaas hosted
  // checkout. Returns { appointment, payment } where payment may be null for
  // free/B2B bookings.
  async getStatus(appointmentId) {
    return api.get(`/payments/status?appointment_id=${encodeURIComponent(appointmentId)}`)
  },

  // URL for downloading the receipt PDF for a confirmed payment. Auth is
  // enforced server-side; the link must be opened in a session that has the
  // user's Bearer token (we fetch with auth headers and pipe to a blob URL).
  receiptUrl(appointmentId) {
    return `/payments/receipt?appointment_id=${encodeURIComponent(appointmentId)}`
  },

  async downloadReceipt(appointmentId) {
    const blob = await api.requestBlob(this.receiptUrl(appointmentId))
    return blob
  },

  // Therapist-side summary of platform-owed manual repasses. Used by the
  // Receita Prevista card on the therapist dashboard to nudge non-Asaas
  // therapists toward connecting their wallet.
  async getMyPayouts() {
    return api.get('/payments/therapist_payouts')
  },
}

export default paymentService
