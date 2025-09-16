import apiService from './api.js'
import urlAuthService from './urlAuthService.js'

class AuthService {
  constructor() {
    this.user = null
    this.isAuthenticated = false
  }

  async login(email, password) {
    try {
      const response = await apiService.post('/auth/login', {
        email,
        password
      })

      if (response.token) {
        apiService.setAuthToken(response.token)
        this.user = response.user
        this.isAuthenticated = true
        localStorage.setItem('user', JSON.stringify(response.user))
        return { success: true, user: response.user }
      }

      return { success: false, error: 'Login failed' }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error.message || 'Login failed'
      }
    }
  }

  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', {
        user: userData
      })

      if (response.token) {
        apiService.setAuthToken(response.token)
        this.user = response.user
        this.isAuthenticated = true
        localStorage.setItem('user', JSON.stringify(response.user))
        return { success: true, user: response.user }
      }

      return { success: false, error: 'Registration failed' }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: error.message || 'Registration failed'
      }
    }
  }

  async getCurrentUser() {
    try {
      const token = apiService.getAuthToken()
      if (!token) {
        return null
      }

      const response = await apiService.get('/auth/me')
      if (response.user) {
        this.user = response.user
        this.isAuthenticated = true
        return response.user
      }

      return null
    } catch (error) {
      console.error('Get current user error:', error)
      this.logout()
      return null
    }
  }

  logout() {
    apiService.setAuthToken(null)
    this.user = null
    this.isAuthenticated = false
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
    urlAuthService.clearAuth()
  }

  getUser() {
    if (!this.user) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser)
          this.isAuthenticated = true
        } catch (error) {
          console.error('Error parsing stored user:', error)
          this.logout()
        }
      }
    }
    return this.user
  }

  isLoggedIn() {
    const hasUidAuth = urlAuthService.isAuthenticated()
    const token = apiService.getAuthToken()
    const user = this.getUser()
    return hasUidAuth && (!!(token && user))
  }

  isUidAuthenticated() {
    return urlAuthService.isAuthenticated()
  }

  requiresUidAuth() {
    return !urlAuthService.isAuthenticated()
  }

  isTherapist() {
    const user = this.getUser()
    return user?.user_type === 'therapist'
  }

  isClient() {
    const user = this.getUser()
    return user?.user_type === 'client'
  }
}

export default new AuthService()