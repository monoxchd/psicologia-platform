import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    if (error) {
      // OAuth was denied or failed
      console.error('Google OAuth error:', error)

      // Send error message to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: error,
          description: searchParams.get('error_description')
        }, window.location.origin)
      }

      window.close()
      return
    }

    if (code) {
      // OAuth was successful, send code to parent window
      console.log('Google OAuth success, sending code to parent')

      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_SUCCESS',
          code: code,
          state: state
        }, window.location.origin)
      }

      window.close()
      return
    }

    // No code or error - something went wrong
    console.error('Google OAuth callback: no code or error received')

    if (window.opener) {
      window.opener.postMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: 'No authorization code received'
      }, window.location.origin)
    }

    window.close()
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Conectando Google Calendar...
        </h2>
        <p className="text-gray-600 text-sm">
          Esta janela será fechada automaticamente.
        </p>
      </div>
    </div>
  )
}