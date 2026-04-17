import { Link } from 'react-router-dom'
import TriageFlow from '../components/triage/TriageFlow.jsx'
import horizontalLogo from '../assets/horizontal-logo.png'

export default function TriagePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={horizontalLogo} alt="Terapia Conecta" className="h-8 w-auto" />
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            Sair
          </Link>
        </div>
      </header>

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <TriageFlow />
      </main>
    </div>
  )
}
