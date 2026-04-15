import { Link, useLocation } from 'react-router-dom'
import { LogIn, LogOut, Users, ClipboardList, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import authService from '@/services/authService'
import horizontalLogo from '../assets/horizontal-logo.png'

export default function CompanyHeader({ company, slug, rightSlot = null }) {
  const location = useLocation()
  const isLoggedIn = authService.isLoggedIn()
  const primaryColor = company?.primary_color || '#4f46e5'

  const base = `/empresa/${slug}`
  // Questionário nav targets the company's anonymous NR-1 questionnaire —
  // hide it for logged-in users; their identity would break the anonymity.
  const navItems = [
    { to: `${base}/psicologos`, label: 'Psicólogos', icon: Users, match: '/psicologos' },
    !isLoggedIn && company?.questionnaire_slug && {
      to: `${base}/questionario/${company.questionnaire_slug}`,
      label: 'Questionário',
      icon: ClipboardList,
      match: '/questionario/'
    },
    { to: `${base}/rh`, label: 'RH', icon: BarChart3, match: '/rh' }
  ].filter(Boolean)

  const isActive = (match) => location.pathname.startsWith(`${base}${match}`)

  const handleLogout = () => {
    authService.logout()
    window.location.href = base
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center gap-4">
          {/* Logo */}
          <Link to={base} className="flex-shrink-0">
            <img
              src={company?.logo_url || horizontalLogo}
              alt={company?.logo_url ? `${company.name} Logo` : 'Terapia Conecta Logo'}
              className="h-8 object-contain"
            />
          </Link>

          {/* Nav (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, match }) => {
              const active = isActive(match)
              return (
                <Link
                  key={to}
                  to={to}
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
                  style={
                    active
                      ? { color: primaryColor, backgroundColor: `${primaryColor}12` }
                      : { color: '#4b5563' }
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {rightSlot}
            {company?.name && (
              <span
                className="hidden sm:inline text-xs font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                {company.name}
              </span>
            )}
            {isLoggedIn ? (
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            ) : (
              <Link to={`${base}/login`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-1 mt-2 -mb-1 overflow-x-auto">
          {navItems.map(({ to, label, icon: Icon, match }) => {
            const active = isActive(match)
            return (
              <Link
                key={to}
                to={to}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap"
                style={
                  active
                    ? { color: primaryColor, backgroundColor: `${primaryColor}12` }
                    : { color: '#4b5563' }
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
