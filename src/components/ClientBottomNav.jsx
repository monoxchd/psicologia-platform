import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Search, BookOpen, CreditCard } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Início', icon: Home },
  { path: '/matching', label: 'Psicólogos', icon: Search },
  { path: '/blog', label: 'Artigos', icon: BookOpen },
  { path: '/credits', label: 'Créditos', icon: CreditCard },
]

export default function ClientBottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200/60 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-3xl mx-auto flex items-center justify-around px-2 py-1.5">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = isActive(path)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[64px] ${
                active
                  ? 'text-indigo-600'
                  : 'text-gray-400 hover:text-gray-600 active:text-gray-700'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className={`text-[10px] leading-tight ${active ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
