import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { gtmPageview, isGTMLoaded } from '../services/gtm.js'
import { isMarketingRoute } from '../utils/marketingRoutes.js'

export default function RouteTracker() {
  const location = useLocation()

  useEffect(() => {
    if (!isGTMLoaded()) return
    if (!isMarketingRoute(location.pathname)) return
    gtmPageview(location.pathname + location.search)
  }, [location.pathname, location.search])

  return <Outlet />
}
