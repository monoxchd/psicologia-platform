import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import RegisterForm from "@/components/auth/RegisterForm"
import authService from "@/services/authService"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleRegister = async (values) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await authService.register(values)

      if (response.success) {
        // Redirect based on user type
        const redirectPath = response.user.user_type === 'therapist'
          ? '/therapist/dashboard'
          : '/simple-dashboard'
        navigate(redirectPath)
      } else {
        setError(response.error || "Registration failed. Please try again.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Registration failed. Please try again.")
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

        <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}