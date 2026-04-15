import { useParams, Navigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useEffect } from 'react'
import authService from '@/services/authService'

export default function CompanyAuthGate({ children }) {
  const { slug } = useParams()
  const location = useLocation()

  const isLoggedIn = authService.isLoggedIn()
  const user = isLoggedIn ? authService.getUser() : null

  // Pre-update clients may have a cached user object without company_slug.
  // Refresh from /auth/me so the next render has authoritative data.
  const isClientMissingSlug =
    user?.user_type === 'client' && user.company_slug === undefined
  useEffect(() => {
    if (isClientMissingSlug) {
      authService.getCurrentUser().then((fresh) => {
        if (fresh) localStorage.setItem('user', JSON.stringify(fresh))
      })
    }
  }, [isClientMissingSlug])

  // Only block on explicit mismatch: company_slug present and different, or
  // explicitly null (client with no company at all).
  const hasResolvedSlug =
    user?.user_type === 'client' && user.company_slug !== undefined
  const isClientFromOtherCompany =
    hasResolvedSlug && user.company_slug && user.company_slug !== slug
  const isClientWithNoCompany =
    hasResolvedSlug && !user.company_slug

  useEffect(() => {
    if (isClientFromOtherCompany) {
      toast.error('Esta área pertence a outra empresa. Redirecionando para a sua.')
    } else if (isClientWithNoCompany) {
      toast.error('Sua conta não está vinculada a esta empresa.')
    }
  }, [isClientFromOtherCompany, isClientWithNoCompany])

  if (!isLoggedIn) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/empresa/${slug}/login?redirect=${redirect}`} replace />
  }

  if (isClientFromOtherCompany) {
    return <Navigate to={`/empresa/${user.company_slug}`} replace />
  }

  if (isClientWithNoCompany) {
    return <Navigate to={`/empresa/${slug}/login`} replace />
  }

  return children
}
