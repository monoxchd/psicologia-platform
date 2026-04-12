import { useParams, Navigate, useLocation } from 'react-router-dom'
import authService from '@/services/authService'

export default function CompanyAuthGate({ children }) {
  const { slug } = useParams()
  const location = useLocation()

  if (!authService.isLoggedIn()) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/empresa/${slug}/login?redirect=${redirect}`} replace />
  }

  return children
}
