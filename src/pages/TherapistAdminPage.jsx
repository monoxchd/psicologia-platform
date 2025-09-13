import { Button } from '@/components/ui/button.jsx'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TherapistAvailability from '../components/TherapistAvailability.jsx'

export default function TherapistAdminPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Voltar ao Site
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Painel do Psicólogo</h1>
          <p className="text-gray-600">Gerencie sua disponibilidade e horários</p>
        </div>
        <TherapistAvailability />
      </div>
    </div>
  )
}