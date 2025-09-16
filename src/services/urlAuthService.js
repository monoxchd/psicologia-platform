import apiService from './api.js'

class UrlAuthService {
  constructor() {
    this.validatedUid = null
    this.isUidAuthenticated = false
  }

  getUidFromUrl() {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('uid')
  }

  async validateUid(uid) {
    if (!uid) {
      return { success: false, error: 'No UID provided' }
    }

    try {
      const response = await apiService.get(`/auth/validate-uid/${uid}`)

      if (response.valid) {
        this.validatedUid = uid
        this.isUidAuthenticated = true
        localStorage.setItem('validated_uid', uid)
        localStorage.setItem('uid_auth_time', Date.now().toString())

        return {
          success: true,
          uid: uid,
          user: response.user
        }
      }

      return { success: false, error: 'Invalid UID' }
    } catch (error) {
      console.error('UID validation error:', error)
      return {
        success: false,
        error: error.message || 'UID validation failed'
      }
    }
  }

  isAuthenticated() {
    const storedUid = localStorage.getItem('validated_uid')
    const authTime = localStorage.getItem('uid_auth_time')

    if (!storedUid || !authTime) {
      return false
    }

    const sessionDuration = 24 * 60 * 60 * 1000
    const isExpired = (Date.now() - parseInt(authTime)) > sessionDuration

    if (isExpired) {
      this.clearAuth()
      return false
    }

    this.validatedUid = storedUid
    this.isUidAuthenticated = true
    return true
  }

  getValidatedUid() {
    return this.validatedUid || localStorage.getItem('validated_uid')
  }

  clearAuth() {
    this.validatedUid = null
    this.isUidAuthenticated = false
    localStorage.removeItem('validated_uid')
    localStorage.removeItem('uid_auth_time')
  }

  redirectToAccess() {
    window.location.href = '/access'
  }
}

export default new UrlAuthService()