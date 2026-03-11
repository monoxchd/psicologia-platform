import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import {
  User,
  ArrowLeft,
  Save,
  Loader2,
  Globe,
  Briefcase,
  Award,
  DollarSign,
  Camera,
  Trash2,
  Heart
} from 'lucide-react'
import authService from '../services/authService'
import apiService from '../services/api'
import therapistService from '../services/therapistService'
import { toast } from 'sonner'

const TherapistProfileEditPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [user, setUser] = useState(null)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    experience_years: '',
    bio: '',
    crp_number: '',
    credits_per_minute: '',
    personal_site_url: '',
    acolhimento_quote: ''
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const currentUser = await authService.getCurrentUser()

      if (!currentUser || currentUser.user_type !== 'therapist') {
        toast.error('Acesso restrito a terapeutas')
        navigate('/login')
        return
      }

      setUser(currentUser)
      setProfilePhotoUrl(currentUser.profile_photo_url || null)
      setFormData({
        name: currentUser.name || '',
        specialty: currentUser.specialty || '',
        experience_years: currentUser.experience_years || '',
        bio: currentUser.bio || '',
        crp_number: currentUser.crp_number || '',
        credits_per_minute: currentUser.credits_per_minute || '',
        personal_site_url: currentUser.personal_site_url || '',
        acolhimento_quote: currentUser.acolhimento_quote || ''
      })
    } catch (error) {
      console.error('Error loading user:', error)
      toast.error('Erro ao carregar dados do perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de arquivo inválido. Use JPEG, PNG ou WebP.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 2MB.')
      return
    }

    setUploadingPhoto(true)
    try {
      const result = await therapistService.uploadProfilePhoto(user.id, file)
      setProfilePhotoUrl(result.profile_photo_url)
      toast.success('Foto atualizada!')
    } catch (error) {
      toast.error(error.message || 'Erro ao fazer upload da foto')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handlePhotoDelete = async () => {
    setUploadingPhoto(true)
    try {
      await therapistService.deleteProfilePhoto(user.id)
      setProfilePhotoUrl(null)
      toast.success('Foto removida')
    } catch (error) {
      toast.error(error.message || 'Erro ao remover foto')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    if (!formData.specialty.trim()) {
      toast.error('Especialidade é obrigatória')
      return
    }
    if (!formData.crp_number.trim()) {
      toast.error('Número do CRP é obrigatório')
      return
    }

    setSaving(true)
    try {
      const response = await apiService.put(`/therapists/${user.id}`, {
        therapist: {
          name: formData.name,
          specialty: formData.specialty,
          experience_years: parseInt(formData.experience_years) || 0,
          bio: formData.bio,
          crp_number: formData.crp_number,
          credits_per_minute: parseFloat(formData.credits_per_minute) || 0,
          personal_site_url: formData.personal_site_url,
          acolhimento_quote: formData.acolhimento_quote
        }
      })

      // Update local storage with new user data
      const updatedUser = { ...user, ...response }
      localStorage.setItem('user', JSON.stringify(updatedUser))

      toast.success('Perfil atualizado com sucesso!')
      navigate('/therapist/dashboard')
    } catch (error) {
      console.error('Error updating profile:', error)
      const errorMessage = error.errors
        ? error.errors.join(', ')
        : 'Erro ao atualizar perfil'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/therapist/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
          <p className="text-gray-600 mt-1">
            Atualize suas informações profissionais
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Dados principais do seu perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="crp_number">Número do CRP *</Label>
                  <Input
                    id="crp_number"
                    name="crp_number"
                    value={formData.crp_number}
                    onChange={handleChange}
                    placeholder="Ex: 06/123456"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="experience_years">Anos de Experiência</Label>
                  <Input
                    id="experience_years"
                    name="experience_years"
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={handleChange}
                    placeholder="Ex: 5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Conte um pouco sobre você e sua abordagem terapêutica..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Informações Profissionais
              </CardTitle>
              <CardDescription>
                Especialização e valores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="specialty">Especialidade *</Label>
                <Input
                  id="specialty"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  placeholder="Ex: Terapia Cognitivo-Comportamental"
                  required
                />
              </div>

              <div>
                <Label htmlFor="credits_per_minute" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Valor por Sessão (R$)
                </Label>
                <Input
                  id="credits_per_minute"
                  name="credits_per_minute"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.credits_per_minute}
                  onChange={handleChange}
                  placeholder="Ex: 150"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Valor cobrado por sessão de atendimento
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Acolhimento Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Acolhimento
              </CardTitle>
              <CardDescription>
                Sua frase para a página de Sessão de Acolhimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="acolhimento_quote">Frase / Citação</Label>
                <Textarea
                  id="acolhimento_quote"
                  name="acolhimento_quote"
                  value={formData.acolhimento_quote}
                  onChange={handleChange}
                  placeholder="Ex: Acredito que todo mundo merece ser ouvido, especialmente quando não sabe nem o que dizer."
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Esta frase aparece na sua página individual de acolhimento.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* External Links Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Links Externos
              </CardTitle>
              <CardDescription>
                Conecte seu site ou página profissional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="personal_site_url">Site Pessoal / Página Profissional</Label>
                <Input
                  id="personal_site_url"
                  name="personal_site_url"
                  type="url"
                  value={formData.personal_site_url}
                  onChange={handleChange}
                  placeholder="https://seusite.com.br"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Link para seu site ou página em outro projeto
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Profile Photo Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Foto de Perfil
              </CardTitle>
              <CardDescription>
                Sua foto será exibida nas páginas de agendamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt={formData.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                      {uploadingPhoto ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      {uploadingPhoto ? 'Enviando...' : 'Escolher foto'}
                    </span>
                  </label>
                  {profilePhotoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 justify-start"
                      onClick={handlePhotoDelete}
                      disabled={uploadingPhoto}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remover foto
                    </Button>
                  )}
                  <p className="text-xs text-gray-500">JPEG, PNG ou WebP. Máximo 2MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link to="/therapist/dashboard">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TherapistProfileEditPage
