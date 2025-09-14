import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import LoginForm from "@/components/auth/LoginForm"
import authService from "@/services/authService"

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
        if (response.user.user_type === 'therapist') {
          navigate('/therapist-admin')
        } else {
          navigate('/matching')
        }
      } else {
        setError(response.error || "Login failed. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}