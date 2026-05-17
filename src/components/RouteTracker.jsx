import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ga4Pageview, isGA4Loaded } from '../services/googleAnalytics.js'
import { isMarketingRoute } from '../utils/marketingRoutes.js'

export default function RouteTracker() {
  const location = useLocation()

  useEffect(() => {
    if (!isGA4Loaded()) return
    if (!isMarketingRoute(location.pathname)) return
    ga4Pageview(location.pathname + location.search)
  }, [location.pathname, location.search])

  return <Outlet />
}
