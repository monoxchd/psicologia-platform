import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import {
  Settings,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Smartphone,
  Mail,
  Globe,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Trash2,
  Download,
  AlertTriangle,
  Check,
  X,
  Key,
  UserCheck,
  Calendar,
  Clock,
  CreditCard,
  Languages
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import apiService from '@/services/api.js'
import authService from '@/services/authService.js'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function AccountSettings({ user, setUser }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      email_appointments: true,
      email_reminders: true,
      email_marketing: false,
      push_appointments: true,
      push_reminders: true,
      sms_reminders: false
    },
    privacy: {
      profile_visibility: 'private',
      allow_therapist_contact: true,
      data_sharing: false
    },
    preferences: {
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      theme: 'system',
      appointment_buffer: 15,
      default_session_duration: 50
    }
  })

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await apiService.get('/settings')
      if (response.settings) {
        setSettings(response.settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const updateSettings = async (section, key, value) => {
    try {
      const updatedSettings = {
        ...settings,
        [section]: {
          ...settings[section],
          [key]: value
        }
      }

      await apiService.put('/settings', updatedSettings)
      setSettings(updatedSettings)
      toast.success('Configuração atualizada!')
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Erro ao atualizar configuração')
    }
  }

  const handlePasswordChange = async (data) => {
    if (data.new_password !== data.confirm_password) {
      toast.error('As senhas não coincidem')
      return
    }

    setChangingPassword(true)
    try {
      await apiService.put('/auth/change-password', {
        current_password: data.current_password,
        new_password: data.new_password
      })

      resetPassword()
      toast.success('Senha alterada com sucesso!')
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Erro ao alterar senha: ' + (error.message || 'Verifique sua senha atual'))
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await apiService.delete('/users/account')
      authService.logout()
      navigate('/login')
      toast.success('Conta deletada com sucesso')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Erro ao deletar conta')
    }
  }

  const handleExportData = async () => {
    try {
      const response = await apiService.get('/users/export-data')

      // Create and trigger download
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mindcredits-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Dados exportados com sucesso!')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Erro ao exportar dados')
    }
  }

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <Label className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações da Conta</CardTitle>
          <CardDescription>
            Gerencie suas preferências, privacidade e configurações de segurança
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacidade</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Preferências</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Conta</span>
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Notificações por Email
                </CardTitle>
                <CardDescription>
                  Configure quais emails você deseja receber
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <ToggleSwitch
                  checked={settings.notifications.email_appointments}
                  onChange={(value) => updateSettings('notifications', 'email_appointments', value)}
                  label="Confirmações de agendamento"
                  description="Receba emails quando um agendamento for confirmado ou alterado"
                />
                <Separator />
                <ToggleSwitch
                  checked={settings.notifications.email_reminders}
                  onChange={(value) => updateSettings('notifications', 'email_reminders', value)}
                  label="Lembretes de sessão"
                  description="Receba lembretes por email antes das suas sessões"
                />
                <Separator />
                <ToggleSwitch
                  checked={settings.notifications.email_marketing}
                  onChange={(value) => updateSettings('notifications', 'email_marketing', value)}
                  label="Novidades e promoções"
                  description="Receba informações sobre novos recursos e ofertas especiais"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Notificações Push
                </CardTitle>
                <CardDescription>
                  Configure notificações no seu dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <ToggleSwitch
                  checked={settings.notifications.push_appointments}
                  onChange={(value) => updateSettings('notifications', 'push_appointments', value)}
                  label="Agendamentos"
                  description="Notificações sobre confirmações e alterações"
                />
                <Separator />
                <ToggleSwitch
                  checked={settings.notifications.push_reminders}
                  onChange={(value) => updateSettings('notifications', 'push_reminders', value)}
                  label="Lembretes"
                  description="Lembretes antes das suas sessões"
                />
                <Separator />
                <ToggleSwitch
                  checked={settings.notifications.sms_reminders}
                  onChange={(value) => updateSettings('notifications', 'sms_reminders', value)}
                  label="SMS"
                  description="Receba lembretes por SMS (sujeito a cobrança)"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Visibilidade do Perfil
                </CardTitle>
                <CardDescription>
                  Controle quem pode ver suas informações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="profile-visibility">Visibilidade do perfil</Label>
                  <Select
                    value={settings.privacy.profile_visibility}
                    onValueChange={(value) => updateSettings('privacy', 'profile_visibility', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Privado - Apenas terapeutas designados</SelectItem>
                      <SelectItem value="therapists">Terapeutas - Visível para todos os terapeutas</SelectItem>
                      <SelectItem value="public">Público - Visível na plataforma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <ToggleSwitch
                  checked={settings.privacy.allow_therapist_contact}
                  onChange={(value) => updateSettings('privacy', 'allow_therapist_contact', value)}
                  label="Permitir contato direto"
                  description="Terapeutas podem entrar em contato diretamente com você"
                />

                <Separator />

                <ToggleSwitch
                  checked={settings.privacy.data_sharing}
                  onChange={(value) => updateSettings('privacy', 'data_sharing', value)}
                  label="Compartilhamento de dados"
                  description="Permitir uso anônimo dos dados para pesquisa e melhoria dos serviços"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Alterar Senha
                </CardTitle>
                <CardDescription>
                  Mantenha sua conta segura com uma senha forte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit(handlePasswordChange)} className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Senha Atual *</Label>
                    <div className="relative mt-2">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        {...registerPassword('current_password', { required: 'Senha atual é obrigatória' })}
                        className={passwordErrors.current_password ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordErrors.current_password && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.current_password.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="new-password">Nova Senha *</Label>
                    <div className="relative mt-2">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        {...registerPassword('new_password', {
                          required: 'Nova senha é obrigatória',
                          minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' }
                        })}
                        className={passwordErrors.new_password ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordErrors.new_password && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.new_password.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Confirmar Nova Senha *</Label>
                    <div className="relative mt-2">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        {...registerPassword('confirm_password', { required: 'Confirmação de senha é obrigatória' })}
                        className={passwordErrors.confirm_password ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordErrors.confirm_password && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.confirm_password.message}</p>
                    )}
                  </div>

                  <Button type="submit" disabled={changingPassword}>
                    {changingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Alterando...
                      </>
                    ) : (
                      'Alterar Senha'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Autenticação de Dois Fatores
                </CardTitle>
                <CardDescription>
                  Adicione uma camada extra de segurança à sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">Autenticação de dois fatores</p>
                    <p className="text-xs text-gray-500">Em breve - Adicione segurança extra com seu celular</p>
                  </div>
                  <Button variant="outline" disabled>
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Idioma e Região
                </CardTitle>
                <CardDescription>
                  Configure o idioma e fuso horário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) => updateSettings('preferences', 'language', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (United States)</SelectItem>
                      <SelectItem value="es-ES">Español (España)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select
                    value={settings.preferences.timezone}
                    onValueChange={(value) => updateSettings('preferences', 'timezone', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                      <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Preferências de Agendamento
                </CardTitle>
                <CardDescription>
                  Configure suas preferências para agendamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="appointment-buffer">Tempo de preparação (minutos)</Label>
                  <Select
                    value={settings.preferences.appointment_buffer.toString()}
                    onValueChange={(value) => updateSettings('preferences', 'appointment_buffer', parseInt(value))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutos</SelectItem>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Tempo livre que você gostaria antes e depois das sessões
                  </p>
                </div>

                <div>
                  <Label htmlFor="default-duration">Duração padrão da sessão (minutos)</Label>
                  <Select
                    value={settings.preferences.default_session_duration.toString()}
                    onValueChange={(value) => updateSettings('preferences', 'default_session_duration', parseInt(value))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="50">50 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                      <SelectItem value="90">90 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5" />
                  Aparência
                </CardTitle>
                <CardDescription>
                  Configure o tema da interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="theme">Tema</Label>
                  <Select
                    value={settings.preferences.theme}
                    onValueChange={(value) => updateSettings('preferences', 'theme', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Exportar Dados
                </CardTitle>
                <CardDescription>
                  Baixe uma cópia de todos os seus dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">Dados da conta</p>
                    <p className="text-xs text-gray-500">
                      Inclui perfil, histórico de sessões, configurações e transações
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Zona de Perigo
                </CardTitle>
                <CardDescription>
                  Ações irreversíveis relacionadas à sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h3 className="text-sm font-medium text-red-800 mb-2">
                      Deletar Conta
                    </h3>
                    <p className="text-sm text-red-700 mb-4">
                      Esta ação é permanente e não pode ser desfeita. Todos os seus dados,
                      incluindo histórico de sessões e configurações, serão perdidos.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deletar Conta
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deletar conta permanentemente?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso irá deletar permanentemente
                            sua conta e remover todos os seus dados dos nossos servidores.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Sim, deletar minha conta
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}