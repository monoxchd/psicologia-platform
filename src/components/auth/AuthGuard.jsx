import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import urlAuthService from '../../services/urlAuthService.js'

const AuthGuard = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)

      if (urlAuthService.isAuthenticated()) {
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }

      const uid = urlAuthService.getUidFromUrl()
      if (uid) {
        const result = await urlAuthService.validateUid(uid)
        if (result.success) {
          setIsAuthenticated(true)
          const cleanUrl = new URL(window.location)
          cleanUrl.searchParams.delete('uid')
          window.history.replaceState({}, '', cleanUrl)
        } else {
          setIsAuthenticated(false)
        }
      } else {
        setIsAuthenticated(false)
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [location.search])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/access" replace />
  }

  return children
}

export default AuthGuard