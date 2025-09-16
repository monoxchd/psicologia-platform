import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Heart,
  Clock
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import apiService from '@/services/api.js'
import dashboardService from '@/services/dashboardService.js'
import { toast } from 'sonner'

export default function ProfileManagement({ user, setUser }) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userStats, setUserStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || '',
      date_of_birth: user?.date_of_birth || '',
    }
  })

  useEffect(() => {
    const loadUserStats = async () => {
      try {
        const stats = await dashboardService.getDashboardStats()
        setUserStats(dashboardService.formatStatsForUI(stats))
      } catch (error) {
        console.error('Failed to load user stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    if (user) {
      loadUserStats()
    }
  }, [user])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await apiService.put('/users/profile', data)
      if (response.user) {
        setUser(response.user)
        setIsEditing(false)
        toast.success('Perfil atualizado com sucesso!')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Erro ao atualizar perfil: ' + (error.message || 'Tente novamente'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Não informado'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const calculateAge = (dateString) => {
    if (!dateString) return null
    const today = new Date()
    const birthDate = new Date(dateString)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1
    }
    return age
  }

  const userType = user?.user_type === 'therapist' ? 'Terapeuta' : 'Cliente'
  const age = calculateAge(user?.date_of_birth)

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.profile_photo} />
                <AvatarFallback className="text-2xl font-semibold bg-blue-100 text-blue-600">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                onClick={() => toast.info('Upload de foto em desenvolvimento')}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  <Badge variant={user?.user_type === 'therapist' ? 'default' : 'secondary'}>
                    {userType}
                  </Badge>
                  {user?.verified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {user?.email}
                </div>
                {user?.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {user?.phone}
                  </div>
                )}
                {user?.date_of_birth && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {age} anos
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Mantenha suas informações sempre atualizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">Nome *</Label>
                      <Input
                        id="first_name"
                        {...register('first_name', { required: 'Nome é obrigatório' })}
                        className={errors.first_name ? 'border-red-500' : ''}
                      />
                      {errors.first_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="last_name">Sobrenome *</Label>
                      <Input
                        id="last_name"
                        {...register('last_name', { required: 'Sobrenome é obrigatório' })}
                        className={errors.last_name ? 'border-red-500' : ''}
                      />
                      {errors.last_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email', {
                        required: 'Email é obrigatório',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Email inválido'
                        }
                      })}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        {...register('phone')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="date_of_birth">Data de Nascimento</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        {...register('date_of_birth')}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      placeholder="Rua, número, bairro, cidade"
                      {...register('address')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Sobre você</Label>
                    <Textarea
                      id="bio"
                      placeholder="Conte um pouco sobre você, seus objetivos ou experiências..."
                      rows={4}
                      {...register('bio')}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nome Completo</Label>
                      <p className="text-gray-900 mt-1">
                        {user?.first_name} {user?.last_name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="text-gray-900 mt-1">{user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Telefone</Label>
                      <p className="text-gray-900 mt-1">
                        {user?.phone || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Data de Nascimento</Label>
                      <p className="text-gray-900 mt-1">
                        {formatDate(user?.date_of_birth)}
                        {age && ` (${age} anos)`}
                      </p>
                    </div>
                  </div>

                  {user?.address && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Endereço</Label>
                      <p className="text-gray-900 mt-1 flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                        {user?.address}
                      </p>
                    </div>
                  )}

                  {user?.bio && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Sobre você</Label>
                      <p className="text-gray-900 mt-1 leading-relaxed">
                        {user?.bio}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                      </div>
                      {index < 2 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm">Sessões Realizadas</span>
                    </div>
                    <span className="font-semibold">{userStats?.totalSessions || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm">Tempo Total</span>
                    </div>
                    <span className="font-semibold">{userStats?.totalHours || 0}h</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Membro desde</span>
                    </div>
                    <span className="font-semibold text-sm">
                      {formatDate(user?.created_at)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {user?.user_type === 'client' && (
            <Card>
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
                <CardDescription>
                  Configure suas preferências de terapia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <span className="text-gray-500">Especialidades de interesse:</span>
                  <p className="font-medium mt-1">Ansiedade, Depressão</p>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Horários preferenciais:</span>
                  <p className="font-medium mt-1">Tarde (14:00 - 18:00)</p>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Modalidade:</span>
                  <p className="font-medium mt-1">Online preferido</p>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Notificações:</span>
                  <p className="font-medium mt-1">Email e SMS ativados</p>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Idioma:</span>
                  <p className="font-medium mt-1">Português</p>
                </div>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => toast.info('Configuração de preferências em desenvolvimento')}>
                  Editar Preferências
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}