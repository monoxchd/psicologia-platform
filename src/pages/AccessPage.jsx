import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import urlAuthService from '../services/urlAuthService.js'

const AccessPage = () => {
  const [uid, setUid] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const urlUid = searchParams.get('uid')
    if (urlUid) {
      setUid(urlUid)
      handleValidation(urlUid)
    }
  }, [searchParams])

  const handleValidation = async (uidToValidate = uid) => {
    if (!uidToValidate?.trim()) {
      setError('Please enter a valid UID')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await urlAuthService.validateUid(uidToValidate.trim())

      if (result.success) {
        navigate('/dashboard', { replace: true })
      } else {
        setError(result.error || 'Invalid UID. Please check your access link.')
      }
    } catch (err) {
      setError('An error occurred while validating your access. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleValidation()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Access Required</CardTitle>
            <CardDescription>
              Enter your unique access ID to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Enter your UID"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading || !uid.trim()}
                className="w-full"
              >
                {isLoading ? 'Validating...' : 'Access Platform'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an access ID?{' '}
                <a href="mailto:support@mindcredits.com" className="text-blue-600 hover:underline">
                  Contact support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AccessPage