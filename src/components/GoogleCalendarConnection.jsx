import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import {
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Clock,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import apiService from '../services/api.js'

export default function GoogleCalendarConnection({ therapistId, onConnectionChange }) {
  const [status, setStatus] = useState({
    connected: false,
    token_valid: false,
    loading: true
  })
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [error, setError] = useState(null)
  const [lastSync, setLastSync] = useState(null)

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus()
  }, [therapistId])

  // Listen for OAuth callback from popup
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        handleOAuthCallback(event.data.code)
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        setError(event.data.error || 'Authorization failed')
        setConnecting(false)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const checkConnectionStatus = async () => {
    try {
      setError(null)
      const response = await apiService.get(`/therapists/${therapistId}/google_calendar/status`)
      setStatus(response)
      setLastSync(response.last_sync)
    } catch (error) {
      console.error('Failed to check Google Calendar status:', error)
      setError('Failed to check connection status')
    } finally {
      setStatus(prev => ({ ...prev, loading: false }))
    }
  }

  const initiateConnection = async () => {
    try {
      setConnecting(true)
      setError(null)

      const response = await apiService.get(`/therapists/${therapistId}/google_calendar/auth_url`)

      // Open OAuth popup
      const popup = window.open(
        response.auth_url,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      // Monitor popup for closure
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          setConnecting(false)
        }
      }, 1000)

    } catch (error) {
      console.error('Failed to initiate Google Calendar connection:', error)
      setError('Failed to start connection process')
      setConnecting(false)
    }
  }

  const handleOAuthCallback = async (authCode) => {
    try {
      setError(null)

      const response = await apiService.post(`/therapists/${therapistId}/google_calendar/callback`, {
        code: authCode
      })

      setStatus({
        connected: true,
        token_valid: true,
        loading: false
      })

      setLastSync(new Date().toISOString())

      // Notify parent component
      if (onConnectionChange) {
        onConnectionChange(true, response.events_imported)
      }

    } catch (error) {
      console.error('OAuth callback failed:', error)
      setError(error.response?.data?.error || 'Failed to complete connection')
    } finally {
      setConnecting(false)
    }
  }

  const syncCalendar = async () => {
    try {
      setSyncing(true)
      setError(null)

      const response = await apiService.post(`/therapists/${therapistId}/google_calendar/sync`)

      setLastSync(new Date().toISOString())

      // Show success feedback
      if (onConnectionChange) {
        onConnectionChange(true, response.events_processed)
      }

    } catch (error) {
      console.error('Calendar sync failed:', error)

      if (error.response?.data?.code === 'TOKEN_EXPIRED') {
        setStatus(prev => ({ ...prev, token_valid: false }))
        setError('Authorization expired. Please reconnect your Google Calendar.')
      } else {
        setError(error.response?.data?.error || 'Sync failed')
      }
    } finally {
      setSyncing(false)
    }
  }

  const disconnectCalendar = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar? This will remove sync functionality.')) {
      return
    }

    try {
      setDisconnecting(true)
      setError(null)

      await apiService.delete(`/therapists/${therapistId}/google_calendar/disconnect`)

      setStatus({
        connected: false,
        token_valid: false,
        loading: false
      })

      setLastSync(null)

      // Notify parent component
      if (onConnectionChange) {
        onConnectionChange(false, 0)
      }

    } catch (error) {
      console.error('Failed to disconnect Google Calendar:', error)
      setError('Failed to disconnect')
    } finally {
      setDisconnecting(false)
    }
  }

  const getStatusBadge = () => {
    if (status.loading) {
      return <Badge variant="outline">Verificando...</Badge>
    }

    if (!status.connected) {
      return <Badge variant="destructive">Desconectado</Badge>
    }

    if (!status.token_valid) {
      return <Badge variant="destructive">Token Expirado</Badge>
    }

    return <Badge variant="default" className="bg-green-600">Conectado</Badge>
  }

  const getStatusIcon = () => {
    if (status.loading) {
      return <Loader2 className="h-5 w-5 animate-spin" />
    }

    if (!status.connected) {
      return <XCircle className="h-5 w-5 text-red-500" />
    }

    if (!status.token_valid) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }

    return <CheckCircle className="h-5 w-5 text-green-500" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Sync
          </span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="font-medium">
              {status.loading && "Verificando status..."}
              {!status.loading && !status.connected && "Google Calendar não conectado"}
              {!status.loading && status.connected && !status.token_valid && "Autorização expirada - reconexão necessária"}
              {!status.loading && status.connected && status.token_valid && "Google Calendar conectado e sincronizado"}
            </p>
            {lastSync && (
              <p className="text-sm text-gray-600">
                Última sincronização: {new Date(lastSync).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Connection Actions */}
        <div className="flex gap-2">
          {!status.connected || !status.token_valid ? (
            <Button
              onClick={initiateConnection}
              disabled={connecting || status.loading}
              className="flex items-center gap-2"
            >
              {connecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Conectar Google Calendar
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={syncCalendar}
                disabled={syncing}
                variant="outline"
                className="flex items-center gap-2"
              >
                {syncing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Sincronizar Agora
                  </>
                )}
              </Button>

              <Button
                onClick={disconnectCalendar}
                disabled={disconnecting}
                variant="destructive"
              >
                {disconnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Desconectando...
                  </>
                ) : (
                  'Desconectar'
                )}
              </Button>
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Como funciona:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Importação automática:</strong> Eventos do Google Calendar viram períodos bloqueados</li>
            <li>• <strong>Sincronização bidirecional:</strong> Sessões agendadas aparecem no Google Calendar</li>
            <li>• <strong>Tempo real:</strong> Mudanças são sincronizadas automaticamente</li>
            <li>• <strong>Sem conflitos:</strong> Sistema previne double-booking automaticamente</li>
          </ul>
        </div>

        {/* Status Details */}
        {status.connected && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Detalhes da Conexão:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-medium">
                  {status.token_valid ? 'Ativo' : 'Requer reconexão'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Última verificação:</span>
                <span className="ml-2 font-medium">
                  {new Date().toLocaleTimeString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}