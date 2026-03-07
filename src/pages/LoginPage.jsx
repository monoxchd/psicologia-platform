import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import LoginForm from "@/components/auth/LoginForm"
import authService from "@/services/authService"
import horizontalLogo from '../assets/horizontal-logo.png'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (values) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await authService.login(values.email, values.password)

      if (response.success) {
        // Redirect based on user type
        const redirectPath = response.user.user_type === 'therapist'
          ? '/therapist/dashboard'
          : '/dashboard'
        navigate(redirectPath)
      } else {
        setError(response.error || "Falha no login. Por favor, tente novamente.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Falha no login. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <img
            src={horizontalLogo}
            alt="Terapia Conecta"
            className="h-10 object-contain"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

      </div>
    </div>
  )
}