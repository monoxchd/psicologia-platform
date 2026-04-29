import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Building2, Users, UserCog, Plus, Search, Edit, Power, Loader2,
  Shield, X, UserPlus, Upload, Trash2, Mail, MessageSquare, Eye, Briefcase, ClipboardList, Tag as TagIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.jsx'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table.jsx'
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '@/components/ui/dialog.jsx'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog.jsx'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.jsx'

import authService from '@/services/authService.js'
import adminService from '@/services/adminService.js'
import { formatCep } from '@/utils/cep'

const ADMIN_EMAIL = 'dneves.junior@gmail.com'

// ─── Main Page ───────────────────────────────────────────────

export default function AdminPage() {
  const navigate = useNavigate()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await authService.getCurrentUser()
        if (!user || user.user_type !== 'therapist' || user.email !== ADMIN_EMAIL) {
          toast.error('Acesso restrito ao administrador')
          navigate('/login')
          return
        }
        setAuthorized(true)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [navigate])

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600 text-sm">Gerenciar empresas, terapeutas, clientes e serviços</p>
          </div>
        </div>

        <Tabs defaultValue="companies">
          <TabsList>
            <TabsTrigger value="companies" className="gap-1.5">
              <Building2 className="h-4 w-4" />
              Empresas
            </TabsTrigger>
            <TabsTrigger value="therapists" className="gap-1.5">
              <UserCog className="h-4 w-4" />
              Terapeutas
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-1.5">
              <Users className="h-4 w-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-1.5">
              <Mail className="h-4 w-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-1.5">
              <Briefcase className="h-4 w-4" />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="questionnaires" className="gap-1.5">
              <ClipboardList className="h-4 w-4" />
              Questionários
            </TabsTrigger>
            <TabsTrigger value="themes" className="gap-1.5">
              <TagIcon className="h-4 w-4" />
              Temas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="companies">
            <CompaniesTab />
          </TabsContent>
          <TabsContent value="therapists">
            <TherapistsTab />
          </TabsContent>
          <TabsContent value="clients">
            <ClientsTab />
          </TabsContent>
          <TabsContent value="leads">
            <LeadsTab />
          </TabsContent>
          <TabsContent value="services">
            <ServicesTab />
          </TabsContent>
          <TabsContent value="questionnaires">
            <QuestionnairesTab />
          </TabsContent>
          <TabsContent value="themes">
            <ThemesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// ─── Companies Tab ───────────────────────────────────────────

function CompaniesTab() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [toggleTarget, setToggleTarget] = useState(null)

  const loadCompanies = async () => {
    try {
      const data = await adminService.getCompanies()
      setCompanies(data)
    } catch (e) {
      toast.error('Erro ao carregar empresas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCompanies() }, [])

  const filtered = useMemo(() => {
    if (!search) return companies
    const q = search.toLowerCase()
    return companies.filter(c =>
      c.name.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q)
    )
  }, [companies, search])

  const handleSave = async (formData) => {
    try {
      let result
      if (editing) {
        result = await adminService.updateCompany(editing.id, formData)
        setCompanies(prev => prev.map(c => c.id === result.id ? result : c))
        toast.success('Empresa atualizada')
      } else {
        result = await adminService.createCompany(formData)
        setCompanies(prev => [result, ...prev])
        toast.success('Empresa criada')
      }
      setDialogOpen(false)
      setEditing(null)
      return result
    } catch (e) {
      toast.error(e.errors ? e.errors.join(', ') : 'Erro ao salvar empresa')
      return null
    }
  }

  const handleToggleActive = async () => {
    if (!toggleTarget) return
    try {
      const updated = await adminService.toggleCompanyActive(toggleTarget.id)
      setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c))
      toast.success(updated.active ? 'Empresa ativada' : 'Empresa desativada')
    } catch (e) {
      toast.error('Erro ao alterar status')
    } finally {
      setToggleTarget(null)
    }
  }

  const openDetail = async (company) => {
    try {
      const data = await adminService.getCompany(company.id)
      setDetail(data)
      setDetailOpen(true)
    } catch (e) {
      toast.error('Erro ao carregar detalhes')
    }
  }

  if (loading) return <LoadingState />

  return (
    <>
      <div className="flex items-center justify-between gap-4 mt-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar empresas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState message="Nenhuma empresa encontrada" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-center">Terapeutas</TableHead>
                  <TableHead className="text-center">Clientes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(company => (
                  <TableRow key={company.id}>
                    <TableCell
                      className="font-medium cursor-pointer hover:underline"
                      onClick={() => openDetail(company)}
                    >
                      {company.name}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">{company.slug}</TableCell>
                    <TableCell className="text-sm">{company.contact_email || '—'}</TableCell>
                    <TableCell className="text-center">{company.therapists_count}</TableCell>
                    <TableCell className="text-center">{company.clients_count}</TableCell>
                    <TableCell>
                      <ActiveBadge active={company.active} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(company); setDialogOpen(true) }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setToggleTarget(company)}>
                          <Power className={`h-4 w-4 ${company.active ? 'text-red-500' : 'text-green-500'}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CompanyFormDialog
        open={dialogOpen}
        onOpenChange={open => { if (!open) { setDialogOpen(false); setEditing(null) } }}
        company={editing}
        onSave={handleSave}
      />

      <ToggleActiveDialog
        open={!!toggleTarget}
        onOpenChange={open => { if (!open) setToggleTarget(null) }}
        name={toggleTarget?.name}
        active={toggleTarget?.active}
        onConfirm={handleToggleActive}
      />

      <CompanyDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        company={detail}
        onUpdate={(updated) => {
          setDetail(updated)
          setCompanies(prev => prev.map(c => c.id === updated.id ? { ...c, therapists_count: updated.therapists?.length || 0 } : c))
        }}
      />
    </>
  )
}

// ─── Therapists Tab ──────────────────────────────────────────

function TherapistsTab() {
  const [therapists, setTherapists] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toggleTarget, setToggleTarget] = useState(null)

  const loadTherapists = async () => {
    try {
      const data = await adminService.getTherapists()
      setTherapists(data)
    } catch (e) {
      toast.error('Erro ao carregar terapeutas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTherapists() }, [])

  const filtered = useMemo(() => {
    if (!search) return therapists
    const q = search.toLowerCase()
    return therapists.filter(t =>
      t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q) || t.specialty?.toLowerCase().includes(q)
    )
  }, [therapists, search])

  const handleSave = async (formData) => {
    try {
      if (editing) {
        const updated = await adminService.updateTherapist(editing.id, formData)
        setTherapists(prev => prev.map(t => t.id === updated.id ? updated : t))
        toast.success('Terapeuta atualizado')
      } else {
        const created = await adminService.createTherapist(formData)
        setTherapists(prev => [created, ...prev])
        toast.success('Terapeuta criado')
      }
      setDialogOpen(false)
      setEditing(null)
    } catch (e) {
      toast.error(e.errors ? e.errors.join(', ') : 'Erro ao salvar terapeuta')
    }
  }

  const handleToggleActive = async () => {
    if (!toggleTarget) return
    try {
      const updated = await adminService.toggleTherapistActive(toggleTarget.id)
      setTherapists(prev => prev.map(t => t.id === updated.id ? updated : t))
      toast.success(updated.active ? 'Terapeuta ativado' : 'Terapeuta desativado')
    } catch (e) {
      toast.error('Erro ao alterar status')
    } finally {
      setToggleTarget(null)
    }
  }

  if (loading) return <LoadingState />

  return (
    <>
      <div className="flex items-center justify-between gap-4 mt-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar terapeutas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Terapeuta
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState message="Nenhum terapeuta encontrado" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>CRP</TableHead>
                  <TableHead className="text-center">Empresas</TableHead>
                  <TableHead className="text-center">Acolhimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(therapist => (
                  <TableRow key={therapist.id}>
                    <TableCell className="font-medium">{therapist.name}</TableCell>
                    <TableCell className="text-sm">{therapist.email}</TableCell>
                    <TableCell className="text-sm">{therapist.specialty || '—'}</TableCell>
                    <TableCell className="text-sm">{therapist.crp_number || '—'}</TableCell>
                    <TableCell className="text-center">{therapist.companies_count}</TableCell>
                    <TableCell className="text-center text-sm">
                      {therapist.acolhimento_price ? `R$${parseFloat(therapist.acolhimento_price).toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell>
                      <ActiveBadge active={therapist.active} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(therapist); setDialogOpen(true) }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setToggleTarget(therapist)}>
                          <Power className={`h-4 w-4 ${therapist.active ? 'text-red-500' : 'text-green-500'}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TherapistFormDialog
        open={dialogOpen}
        onOpenChange={open => { if (!open) { setDialogOpen(false); setEditing(null) } }}
        therapist={editing}
        onSave={handleSave}
      />

      <ToggleActiveDialog
        open={!!toggleTarget}
        onOpenChange={open => { if (!open) setToggleTarget(null) }}
        name={toggleTarget?.name}
        active={toggleTarget?.active}
        onConfirm={handleToggleActive}
      />
    </>
  )
}

// ─── Clients Tab ─────────────────────────────────────────────

function ClientsTab() {
  const [clients, setClients] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toggleTarget, setToggleTarget] = useState(null)

  const loadData = async () => {
    try {
      const [clientsData, companiesData] = await Promise.all([
        adminService.getClients(),
        adminService.getCompanies(),
      ])
      setClients(clientsData)
      setCompanies(companiesData)
    } catch (e) {
      toast.error('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const filtered = useMemo(() => {
    if (!search) return clients
    const q = search.toLowerCase()
    return clients.filter(c =>
      c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.company_name?.toLowerCase().includes(q)
    )
  }, [clients, search])

  const handleSave = async (formData) => {
    try {
      if (editing) {
        const updated = await adminService.updateClient(editing.id, formData)
        setClients(prev => prev.map(c => c.id === updated.id ? updated : c))
        toast.success('Cliente atualizado')
      } else {
        const created = await adminService.createClient(formData)
        setClients(prev => [created, ...prev])
        toast.success('Cliente criado')
      }
      setDialogOpen(false)
      setEditing(null)
    } catch (e) {
      toast.error(e.errors ? e.errors.join(', ') : 'Erro ao salvar cliente')
    }
  }

  const handleToggleActive = async () => {
    if (!toggleTarget) return
    try {
      const updated = await adminService.toggleClientActive(toggleTarget.id)
      setClients(prev => prev.map(c => c.id === updated.id ? updated : c))
      toast.success(updated.active ? 'Cliente ativado' : 'Cliente desativado')
    } catch (e) {
      toast.error('Erro ao alterar status')
    } finally {
      setToggleTarget(null)
    }
  }

  if (loading) return <LoadingState />

  return (
    <>
      <div className="flex items-center justify-between gap-4 mt-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar clientes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState message="Nenhum cliente encontrado" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(client => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="text-sm">{client.email}</TableCell>
                    <TableCell className="text-sm">{client.company_name || '—'}</TableCell>
                    <TableCell className="text-sm">{client.department || '—'}</TableCell>
                    <TableCell>
                      <ActiveBadge active={client.active} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(client); setDialogOpen(true) }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setToggleTarget(client)}>
                          <Power className={`h-4 w-4 ${client.active ? 'text-red-500' : 'text-green-500'}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={open => { if (!open) { setDialogOpen(false); setEditing(null) } }}
        client={editing}
        companies={companies}
        onSave={handleSave}
      />

      <ToggleActiveDialog
        open={!!toggleTarget}
        onOpenChange={open => { if (!open) setToggleTarget(null) }}
        name={toggleTarget?.name}
        active={toggleTarget?.active}
        onConfirm={handleToggleActive}
      />
    </>
  )
}

// ─── Shared Components ───────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-12 text-gray-500">{message}</div>
  )
}

function ActiveBadge({ active }) {
  return (
    <Badge className={active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
      {active ? 'Ativo' : 'Inativo'}
    </Badge>
  )
}

function ToggleActiveDialog({ open, onOpenChange, name, active, onConfirm }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {active ? 'Desativar' : 'Ativar'} {name}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {active
              ? 'Este registro será desativado. Você pode reativá-lo depois.'
              : 'Este registro será reativado.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {active ? 'Desativar' : 'Ativar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ─── Company Form Dialog ─────────────────────────────────────

function CompanyFormDialog({ open, onOpenChange, company, onSave }) {
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    if (open) {
      setLogoFile(null)
      setLogoPreview(company?.logo_url || null)
      setForm(company ? {
        name: company.name || '',
        slug: company.slug || '',
        description: company.description || '',
        contact_email: company.contact_email || '',
        contact_phone: company.contact_phone || '',
        primary_color: company.primary_color || '#6366f1',
        secondary_color: company.secondary_color || '#8b5cf6',
        employee_count: company.employee_count || '',
      } : {
        name: '', slug: '', description: '', contact_email: '', contact_phone: '',
        primary_color: '#6366f1', secondary_color: '#8b5cf6', employee_count: '',
      })
    }
  }, [open, company])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleLogoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo inválido. Use JPEG, PNG, SVG ou WebP.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 2MB.')
      return
    }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name?.trim()) { toast.error('Nome é obrigatório'); return }
    setSaving(true)
    const data = { ...form }
    if (data.employee_count) data.employee_count = parseInt(data.employee_count)
    else delete data.employee_count
    if (!data.slug?.trim()) delete data.slug

    const result = await onSave(data)

    // Upload logo after create/update if a file was selected
    if (result && logoFile) {
      setUploadingLogo(true)
      try {
        await adminService.uploadCompanyLogo(result.id, logoFile)
        toast.success('Logo enviado')
      } catch (err) {
        toast.error('Empresa salva, mas erro ao enviar logo')
      } finally {
        setUploadingLogo(false)
      }
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{company ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
          <DialogDescription>
            {company ? 'Atualize os dados da empresa' : 'Preencha os dados para criar uma empresa'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name">Nome *</Label>
              <Input id="company-name" name="name" value={form.name || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="company-slug">Slug</Label>
              <Input id="company-slug" name="slug" value={form.slug || ''} onChange={handleChange} placeholder="Auto-gerado se vazio" />
            </div>
          </div>
          <div>
            <Label htmlFor="company-description">Descrição</Label>
            <Textarea id="company-description" name="description" value={form.description || ''} onChange={handleChange} rows={2} />
          </div>

          {/* Logo upload */}
          <div>
            <Label>Logo</Label>
            <div className="flex items-center gap-4 mt-1">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-12 w-12 rounded object-contain border" />
              ) : (
                <div className="h-12 w-12 rounded border bg-gray-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <label className="cursor-pointer">
                <input type="file" accept="image/jpeg,image/png,image/svg+xml,image/webp" onChange={handleLogoSelect} className="hidden" />
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border rounded text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  {logoFile ? logoFile.name : 'Escolher logo'}
                </span>
              </label>
              {logoPreview && (
                <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => { setLogoFile(null); setLogoPreview(null) }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">JPEG, PNG, SVG ou WebP. Máximo 2MB.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-email">Email de contato</Label>
              <Input id="company-email" name="contact_email" type="email" value={form.contact_email || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="company-phone">Telefone</Label>
              <Input id="company-phone" name="contact_phone" value={form.contact_phone || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="company-primary-color">Cor primária</Label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.primary_color || '#6366f1'} onChange={e => setForm(prev => ({ ...prev, primary_color: e.target.value }))} className="h-9 w-9 rounded border cursor-pointer" />
                <Input id="company-primary-color" name="primary_color" value={form.primary_color || ''} onChange={handleChange} className="flex-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="company-secondary-color">Cor secundária</Label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.secondary_color || '#8b5cf6'} onChange={e => setForm(prev => ({ ...prev, secondary_color: e.target.value }))} className="h-9 w-9 rounded border cursor-pointer" />
                <Input id="company-secondary-color" name="secondary_color" value={form.secondary_color || ''} onChange={handleChange} className="flex-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="company-employee-count">N° Funcionários</Label>
              <Input id="company-employee-count" name="employee_count" type="number" min="1" value={form.employee_count || ''} onChange={handleChange} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving || uploadingLogo}>
              {(saving || uploadingLogo) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {company ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Company Detail Dialog (therapist assignments) ───────────

function CompanyDetailDialog({ open, onOpenChange, company, onUpdate }) {
  const [allTherapists, setAllTherapists] = useState([])
  const [addingId, setAddingId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      adminService.getTherapists().then(setAllTherapists).catch(() => {})
    }
  }, [open])

  if (!company) return null

  const assignedIds = new Set((company.therapists || []).map(t => t.id))
  const available = allTherapists.filter(t => !assignedIds.has(t.id) && t.active)

  const handleAdd = async () => {
    if (!addingId) return
    setSaving(true)
    try {
      const added = await adminService.addTherapistToCompany(company.id, parseInt(addingId))
      const updated = { ...company, therapists: [...(company.therapists || []), added] }
      onUpdate(updated)
      setAddingId('')
      toast.success('Terapeuta adicionado')
    } catch (e) {
      toast.error(e.errors ? e.errors.join(', ') : 'Erro ao adicionar terapeuta')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (therapistId) => {
    try {
      await adminService.removeTherapistFromCompany(company.id, therapistId)
      const updated = { ...company, therapists: company.therapists.filter(t => t.id !== therapistId) }
      onUpdate(updated)
      toast.success('Terapeuta removido')
    } catch (e) {
      toast.error('Erro ao remover terapeuta')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{company.name} — Terapeutas</DialogTitle>
          <DialogDescription>
            Gerencie os terapeutas vinculados a esta empresa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Select value={addingId} onValueChange={setAddingId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecionar terapeuta..." />
              </SelectTrigger>
              <SelectContent>
                {available.length === 0 ? (
                  <SelectItem value="_none" disabled>Nenhum disponível</SelectItem>
                ) : (
                  available.map(t => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name} — {t.specialty || 'Sem especialidade'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button onClick={handleAdd} disabled={!addingId || saving} size="icon">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>

          {(company.therapists || []).length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Nenhum terapeuta vinculado</p>
          ) : (
            <div className="space-y-2">
              {company.therapists.map(t => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.email} — {t.specialty || 'Sem especialidade'}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemove(t.id)}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Therapist Form Dialog ───────────────────────────────────

function TherapistFormDialog({ open, onOpenChange, therapist, onSave }) {
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [availableTags, setAvailableTags] = useState([])

  useEffect(() => {
    if (open) {
      const mapOffice = (o) => ({
        id: o.id,
        label: o.label || '',
        cep: o.cep || '',
        street: o.street || '',
        neighborhood: o.neighborhood || '',
        city: o.city || 'São Paulo',
        state: o.state || 'SP',
        active: o.active !== false,
        position: o.position ?? 0,
        location_geocoded_at: o.location_geocoded_at,
        _destroy: false,
      })

      setForm(therapist ? {
        email: therapist.email || '',
        name: therapist.name || '',
        specialty: therapist.specialty || '',
        experience_years: therapist.experience_years || '',
        bio: therapist.bio || '',
        crp_number: therapist.crp_number || '',
        personal_site_url: therapist.personal_site_url || '',
        calendly_url: therapist.calendly_url || '',
        acolhimento_price: therapist.acolhimento_price || '',
        acolhimento_quote: therapist.acolhimento_quote || '',
        position: therapist.position ?? 0,
        gender: therapist.gender || '',
        pronouns: therapist.pronouns || '',
        serves_children: !!therapist.serves_children,
        serves_teens: !!therapist.serves_teens,
        serves_adults: therapist.serves_adults ?? true,
        offers_remote: therapist.offers_remote ?? true,
        offers_presencial: !!therapist.offers_presencial,
        offices: Array.isArray(therapist.offices) ? therapist.offices.map(mapOffice) : [],
        tag_ids: Array.isArray(therapist.tag_ids) ? therapist.tag_ids : [],
        password: '',
        password_confirmation: '',
      } : {
        email: '', name: '', specialty: '', experience_years: '', bio: '',
        crp_number: '', personal_site_url: '', calendly_url: '',
        acolhimento_price: '', acolhimento_quote: '', position: 0,
        gender: '', pronouns: '',
        serves_children: false, serves_teens: false, serves_adults: true,
        offers_remote: true, offers_presencial: false,
        offices: [],
        tag_ids: [],
        password: '', password_confirmation: '',
      })
    }
  }, [open, therapist])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    adminService.getTags()
      .then(tags => { if (!cancelled) setAvailableTags(tags) })
      .catch(() => { if (!cancelled) setAvailableTags([]) })
    return () => { cancelled = true }
  }, [open])

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const toggleTagId = (id) => {
    setForm(prev => {
      const current = prev.tag_ids || []
      const next = current.includes(id)
        ? current.filter(x => x !== id)
        : [...current, id]
      return { ...prev, tag_ids: next }
    })
  }

  const addOffice = () => {
    setForm(prev => ({
      ...prev,
      offices: [
        ...(prev.offices || []),
        { id: null, label: '', cep: '', street: '', neighborhood: '', city: 'São Paulo', state: 'SP', active: true, position: (prev.offices || []).length, _destroy: false },
      ],
    }))
  }

  const updateOffice = (idx, key, value) => {
    setForm(prev => {
      const next = [...(prev.offices || [])]
      next[idx] = { ...next[idx], [key]: value }
      return { ...prev, offices: next }
    })
  }

  const removeOffice = (idx) => {
    setForm(prev => {
      const next = [...(prev.offices || [])]
      const item = next[idx]
      if (item?.id) {
        next[idx] = { ...item, _destroy: true }
      } else {
        next.splice(idx, 1)
      }
      return { ...prev, offices: next }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name?.trim()) { toast.error('Nome é obrigatório'); return }
    if (!form.email?.trim()) { toast.error('Email é obrigatório'); return }
    if (!therapist && !form.password) { toast.error('Senha é obrigatória para novo terapeuta'); return }
    if (form.password && form.password !== form.password_confirmation) {
      toast.error('Senhas não conferem'); return
    }

    const offices = form.offices || []
    for (const o of offices) {
      if (o._destroy) continue
      if (o.cep && !/^\d{8}$/.test(o.cep.replace(/\D/g, ''))) {
        toast.error(`CEP inválido em "${o.label || 'localização sem nome'}" — deve ter 8 dígitos`); return
      }
    }

    setSaving(true)
    try {
      const data = { ...form }
      if (data.experience_years) data.experience_years = parseInt(data.experience_years)
      if (data.acolhimento_price) data.acolhimento_price = parseFloat(data.acolhimento_price)
      if (!data.acolhimento_price) delete data.acolhimento_price
      if (!data.password) { delete data.password; delete data.password_confirmation }
      if (!data.gender) delete data.gender

      data.therapist_offices_attributes = offices
        .filter(o => !(o._destroy && !o.id))
        .map(o => {
          const attrs = {
            label: o.label || null,
            cep: o.cep ? o.cep.replace(/\D/g, '') : null,
            street: o.street || null,
            neighborhood: o.neighborhood || null,
            city: o.city || null,
            state: o.state || null,
            active: !!o.active,
            position: o.position ?? 0,
          }
          if (o.id) attrs.id = o.id
          if (o._destroy) attrs._destroy = '1'
          return attrs
        })
      delete data.offices

      await onSave(data)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{therapist ? 'Editar Terapeuta' : 'Novo Terapeuta'}</DialogTitle>
          <DialogDescription>
            {therapist ? 'Atualize os dados do terapeuta' : 'Preencha os dados para criar um terapeuta'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="therapist-name">Nome *</Label>
              <Input id="therapist-name" name="name" value={form.name || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="therapist-email">Email *</Label>
              <Input id="therapist-email" name="email" type="email" value={form.email || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="therapist-specialty">Especialidade</Label>
              <Input id="therapist-specialty" name="specialty" value={form.specialty || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="therapist-crp">CRP</Label>
              <Input id="therapist-crp" name="crp_number" value={form.crp_number || ''} onChange={handleChange} placeholder="XX/XXXXX" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="therapist-exp">Anos de experiência</Label>
              <Input id="therapist-exp" name="experience_years" type="number" min="0" value={form.experience_years || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="therapist-position">Posição</Label>
              <Input id="therapist-position" name="position" type="number" min="0" value={form.position ?? 0} onChange={handleChange} placeholder="0" />
            </div>
          </div>
          <div>
            <Label htmlFor="therapist-bio">Biografia</Label>
            <Textarea id="therapist-bio" name="bio" value={form.bio || ''} onChange={handleChange} rows={2} />
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Acolhimento</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="therapist-acolhimento-price">Preço Acolhimento (R$)</Label>
                <Input id="therapist-acolhimento-price" name="acolhimento_price" type="number" min="0" step="0.01" value={form.acolhimento_price || ''} onChange={handleChange} placeholder="Ex: 89.90" />
              </div>
              <div>
                <Label htmlFor="therapist-slug">Slug</Label>
                <Input id="therapist-slug" value={therapist?.slug || 'Auto-gerado'} disabled className="bg-gray-50" />
              </div>
            </div>
            <div>
              <Label htmlFor="therapist-acolhimento-quote">Frase de Acolhimento</Label>
              <Textarea id="therapist-acolhimento-quote" name="acolhimento_quote" value={form.acolhimento_quote || ''} onChange={handleChange} rows={2} placeholder="Frase que aparece na página de acolhimento" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="therapist-site">Site pessoal</Label>
              <Input id="therapist-site" name="personal_site_url" type="url" value={form.personal_site_url || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="therapist-calendly">Calendly URL</Label>
              <Input id="therapist-calendly" name="calendly_url" type="url" value={form.calendly_url || ''} onChange={handleChange} />
            </div>
          </div>

          {/* Demografia & Público */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Demografia & Público</p>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <Label>Gênero</Label>
                <Select
                  value={form.gender || '_unset'}
                  onValueChange={val => setForm(prev => ({ ...prev, gender: val === '_unset' ? '' : val }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Não informado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_unset">Não informado</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefere não dizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="therapist-pronouns">Pronomes</Label>
                <Input id="therapist-pronouns" name="pronouns" value={form.pronouns || ''} onChange={handleChange} placeholder="ela/dela" />
              </div>
            </div>
            <Label className="text-xs text-gray-600">Atende</Label>
            <div className="flex flex-wrap gap-4 mt-1">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name="serves_children" checked={!!form.serves_children} onChange={handleChange} />
                Crianças (0–12)
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name="serves_teens" checked={!!form.serves_teens} onChange={handleChange} />
                Adolescentes (13–17)
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name="serves_adults" checked={!!form.serves_adults} onChange={handleChange} />
                Adultos (18+)
              </label>
            </div>
          </div>

          {/* Modalidade */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Modalidade</p>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name="offers_remote" checked={!!form.offers_remote} onChange={handleChange} />
                Atende online (remoto)
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name="offers_presencial" checked={!!form.offers_presencial} onChange={handleChange} />
                Atende presencial
              </label>
            </div>
          </div>

          {/* Locais de atendimento presencial */}
          {form.offers_presencial && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Locais de atendimento presencial</p>
                <Button type="button" size="sm" variant="outline" onClick={addOffice}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Adicionar localização
                </Button>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Cada local tem seu próprio CEP. Ao salvar, endereço e coordenadas são preenchidos
                automaticamente (ViaCEP + OpenStreetMap). O filtro de proximidade usa o local mais próximo.
              </p>
              {(form.offices || []).filter(o => !o._destroy).length === 0 ? (
                <p className="text-xs text-gray-400 italic">Nenhuma localização adicionada ainda.</p>
              ) : (
                <div className="space-y-3">
                  {(form.offices || []).map((office, idx) => {
                    if (office._destroy) return null
                    return (
                      <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="flex-1">
                            <Label className="text-xs">Identificação</Label>
                            <Input
                              value={office.label || ''}
                              onChange={e => updateOffice(idx, 'label', e.target.value)}
                              placeholder="Ex: Pinheiros, Angélica, Paulista"
                              className="bg-white"
                            />
                          </div>
                          <div className="flex items-center gap-3 pt-6">
                            <label className="inline-flex items-center gap-1 text-xs whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={!!office.active}
                                onChange={e => updateOffice(idx, 'active', e.target.checked)}
                              />
                              Ativo
                            </label>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeOffice(idx)}
                              className="text-red-500 hover:text-red-700 px-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div>
                            <Label className="text-xs">CEP</Label>
                            <Input
                              value={formatCep(office.cep || '')}
                              onChange={e => updateOffice(idx, 'cep', formatCep(e.target.value))}
                              placeholder="00000-000"
                              maxLength={9}
                              inputMode="numeric"
                              className="bg-white"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Rua</Label>
                            <Input
                              value={office.street || ''}
                              onChange={e => updateOffice(idx, 'street', e.target.value)}
                              placeholder="Preenchido pelo CEP"
                              className="bg-white"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Bairro</Label>
                            <Input
                              value={office.neighborhood || ''}
                              onChange={e => updateOffice(idx, 'neighborhood', e.target.value)}
                              className="bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Cidade</Label>
                            <Input
                              value={office.city || ''}
                              onChange={e => updateOffice(idx, 'city', e.target.value)}
                              placeholder="São Paulo"
                              className="bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">UF</Label>
                            <Input
                              value={office.state || ''}
                              onChange={e => updateOffice(idx, 'state', e.target.value)}
                              maxLength={2}
                              placeholder="SP"
                              className="bg-white"
                            />
                          </div>
                        </div>
                        {office.location_geocoded_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            Geocodificado em: {new Date(office.location_geocoded_at).toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tags / Temas */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-1">Temas / Especializações</p>
            <p className="text-xs text-gray-500 mb-3">Selecione as tags que aparecem no filtro de busca.</p>
            {availableTags.filter(t => t.kind == null).length === 0 ? (
              <p className="text-xs text-gray-400">Nenhuma tag cadastrada.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {availableTags.filter(t => t.kind == null).map(tag => {
                  const selected = (form.tag_ids || []).includes(tag.id)
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => toggleTagId(tag.id)}
                      className={
                        "px-2.5 py-1 rounded-full text-xs border transition-colors " +
                        (selected
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400")
                      }
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Abordagens terapêuticas */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-1">Abordagens terapêuticas</p>
            <p className="text-xs text-gray-500 mb-3">Linhas teóricas que o profissional pratica. Aparecem no filtro de busca e no ranking da triagem.</p>
            {availableTags.filter(t => t.kind === 'abordagem').length === 0 ? (
              <p className="text-xs text-gray-400">Nenhuma abordagem cadastrada. Rode <code className="text-[11px]">rake tags:seed_abordagens</code>.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {availableTags.filter(t => t.kind === 'abordagem').map(tag => {
                  const selected = (form.tag_ids || []).includes(tag.id)
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => toggleTagId(tag.id)}
                      className={
                        "px-2.5 py-1 rounded-full text-xs border transition-colors " +
                        (selected
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400")
                      }
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">{therapist ? 'Alterar senha (opcional)' : 'Senha *'}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="therapist-password">Senha</Label>
                <Input id="therapist-password" name="password" type="password" value={form.password || ''} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="therapist-password-confirm">Confirmar senha</Label>
                <Input id="therapist-password-confirm" name="password_confirmation" type="password" value={form.password_confirmation || ''} onChange={handleChange} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {therapist ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Client Form Dialog ──────────────────────────────────────

function ClientFormDialog({ open, onOpenChange, client, companies, onSave }) {
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(client ? {
        email: client.email || '',
        name: client.name || '',
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        phone: client.phone || '',
        company_id: client.company_id ? String(client.company_id) : '',
        department: client.department || '',
        password: '',
        password_confirmation: '',
      } : {
        email: '', name: '', first_name: '', last_name: '', phone: '',
        company_id: '', department: '', password: '', password_confirmation: '',
      })
    }
  }, [open, client])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name?.trim()) { toast.error('Nome é obrigatório'); return }
    if (!form.email?.trim()) { toast.error('Email é obrigatório'); return }
    if (!client && !form.password) { toast.error('Senha é obrigatória para novo cliente'); return }
    if (form.password && form.password !== form.password_confirmation) {
      toast.error('Senhas não conferem'); return
    }

    setSaving(true)
    const data = { ...form }
    if (data.company_id) data.company_id = parseInt(data.company_id)
    else delete data.company_id
    if (!data.password) { delete data.password; delete data.password_confirmation }
    await onSave(data)
    setSaving(false)
  }

  const activeCompanies = (companies || []).filter(c => c.active)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{client ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogDescription>
            {client ? 'Atualize os dados do cliente' : 'Preencha os dados para criar um cliente'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client-name">Nome completo *</Label>
            <Input id="client-name" name="name" value={form.name || ''} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client-first-name">Primeiro nome</Label>
              <Input id="client-first-name" name="first_name" value={form.first_name || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="client-last-name">Sobrenome</Label>
              <Input id="client-last-name" name="last_name" value={form.last_name || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client-email">Email *</Label>
              <Input id="client-email" name="email" type="email" value={form.email || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="client-phone">Telefone</Label>
              <Input id="client-phone" name="phone" value={form.phone || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Empresa</Label>
              <Select value={form.company_id || ''} onValueChange={val => setForm(prev => ({ ...prev, company_id: val === '_none' ? '' : val }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Nenhuma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Nenhuma</SelectItem>
                  {activeCompanies.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="client-department">Departamento</Label>
              <Input id="client-department" name="department" value={form.department || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">{client ? 'Alterar senha (opcional)' : 'Senha *'}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client-password">Senha</Label>
                <Input id="client-password" name="password" type="password" value={form.password || ''} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="client-password-confirm">Confirmar senha</Label>
                <Input id="client-password-confirm" name="password_confirmation" type="password" value={form.password_confirmation || ''} onChange={handleChange} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {client ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Leads Tab ──────────────────────────────────────────────

const STATUS_LABELS = {
  new: 'Novo',
  contacted: 'Contatado',
  converted: 'Convertido',
  archived: 'Arquivado',
}

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  converted: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600',
}

const SOURCE_LABELS = {
  landing: 'Landing Page',
  enigma: 'Enigma',
}

const CONTACT_PREF_LABELS = {
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  phone: 'Ligação',
}

function LeadsTab() {
  const [view, setView] = useState('b2c')
  const [leads, setLeads] = useState([])
  const [dnfLeads, setDnfLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [detailLead, setDetailLead] = useState(null)
  const [detailType, setDetailType] = useState(null)

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const [b2c, b2b] = await Promise.all([
        adminService.getLeads(),
        adminService.getDnfLeads(),
      ])
      setLeads(b2c)
      setDnfLeads(b2b)
    } catch {
      toast.error('Erro ao carregar leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLeads() }, [])

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return leads
    return leads.filter(l =>
      l.name?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q)
    )
  }, [leads, search])

  const filteredDnfLeads = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return dnfLeads
    return dnfLeads.filter(l =>
      l.name?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.utm_source?.toLowerCase().includes(q) || l.utm_campaign?.toLowerCase().includes(q)
    )
  }, [dnfLeads, search])

  const handleStatusChange = async (lead, type, newStatus) => {
    try {
      if (type === 'b2c') {
        await adminService.updateLead(lead.id, { status: newStatus })
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus } : l))
      } else {
        await adminService.updateDnfLead(lead.id, { status: newStatus })
        setDnfLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus } : l))
      }
      toast.success('Status atualizado')
    } catch {
      toast.error('Erro ao atualizar status')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  const formatPhone = (phone) => {
    if (!phone) return '—'
    const d = phone.replace(/\D/g, '')
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
    return phone
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-lg">Leads</CardTitle>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex rounded-md border overflow-hidden">
              <button
                onClick={() => setView('b2c')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === 'b2c' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                B2C ({leads.length})
              </button>
              <button
                onClick={() => setView('b2b')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === 'b2b' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                B2B ({dnfLeads.length})
              </button>
            </div>
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : view === 'b2c' ? (
          <B2CLeadsTable
            leads={filteredLeads}
            formatDate={formatDate}
            formatPhone={formatPhone}
            onStatusChange={(lead, status) => handleStatusChange(lead, 'b2c', status)}
            onViewDetail={(lead) => { setDetailLead(lead); setDetailType('b2c') }}
          />
        ) : (
          <B2BLeadsTable
            leads={filteredDnfLeads}
            formatDate={formatDate}
            formatPhone={formatPhone}
            onStatusChange={(lead, status) => handleStatusChange(lead, 'b2b', status)}
            onViewDetail={(lead) => { setDetailLead(lead); setDetailType('b2b') }}
          />
        )}
      </CardContent>

      <LeadDetailDialog
        lead={detailLead}
        type={detailType}
        open={!!detailLead}
        onClose={() => setDetailLead(null)}
        formatDate={formatDate}
        formatPhone={formatPhone}
      />
    </Card>
  )
}

function B2CLeadsTable({ leads, formatDate, formatPhone, onStatusChange, onViewDetail }) {
  if (leads.length === 0) {
    return <p className="text-center text-gray-500 py-8">Nenhum lead B2C encontrado.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Origem</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell className="font-medium">{lead.name}</TableCell>
            <TableCell>{lead.email}</TableCell>
            <TableCell>{formatPhone(lead.phone)}</TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs">
                {SOURCE_LABELS[lead.source] || lead.source || 'Landing Page'}
              </Badge>
            </TableCell>
            <TableCell>
              <Select value={lead.status} onValueChange={(v) => onStatusChange(lead, v)}>
                <SelectTrigger className="w-[130px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell className="text-sm text-gray-500">{formatDate(lead.created_at)}</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" onClick={() => onViewDetail(lead)}>
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function B2BLeadsTable({ leads, formatDate, formatPhone, onStatusChange, onViewDetail }) {
  if (leads.length === 0) {
    return <p className="text-center text-gray-500 py-8">Nenhum lead B2B encontrado.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead>Origem</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell className="font-medium">{lead.name}</TableCell>
            <TableCell>{lead.email}</TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs">
                {CONTACT_PREF_LABELS[lead.contact_preference] || 'WhatsApp'}
              </Badge>
            </TableCell>
            <TableCell className="text-xs text-gray-500">
              {lead.utm_source ? `${lead.utm_source}${lead.utm_campaign ? ' / ' + lead.utm_campaign : ''}` : 'Direto'}
            </TableCell>
            <TableCell>
              <Select value={lead.status} onValueChange={(v) => onStatusChange(lead, v)}>
                <SelectTrigger className="w-[130px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell className="text-sm text-gray-500">{formatDate(lead.created_at)}</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" onClick={() => onViewDetail(lead)}>
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function LeadDetailDialog({ lead, type, open, onClose, formatDate, formatPhone }) {
  if (!lead) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{lead.name}</DialogTitle>
          <DialogDescription>
            {type === 'b2c' ? 'Lead B2C' : 'Lead B2B'} — {formatDate(lead.created_at)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <span className="text-gray-500">Email:</span>
            <span>{lead.email}</span>

            <span className="text-gray-500">Telefone:</span>
            <span>{formatPhone(lead.phone)}</span>

            <span className="text-gray-500">Status:</span>
            <Badge className={`w-fit ${STATUS_COLORS[lead.status] || ''}`}>
              {STATUS_LABELS[lead.status] || lead.status}
            </Badge>

            {type === 'b2c' && (
              <>
                <span className="text-gray-500">Origem:</span>
                <span>{SOURCE_LABELS[lead.source] || lead.source || 'Landing Page'}</span>

                {lead.age_range && (
                  <>
                    <span className="text-gray-500">Faixa etária:</span>
                    <span>{lead.age_range}</span>
                  </>
                )}
                {lead.urgency && (
                  <>
                    <span className="text-gray-500">Urgência:</span>
                    <span>{lead.urgency}</span>
                  </>
                )}
                {lead.therapy_experience && (
                  <>
                    <span className="text-gray-500">Experiência:</span>
                    <span>{lead.therapy_experience}</span>
                  </>
                )}
              </>
            )}

            {type === 'b2b' && (
              <>
                <span className="text-gray-500">Contato via:</span>
                <span>{CONTACT_PREF_LABELS[lead.contact_preference] || 'WhatsApp'}</span>

                {lead.utm_source && (
                  <>
                    <span className="text-gray-500">Origem:</span>
                    <span>{lead.utm_source} / {lead.utm_medium || '—'}</span>
                  </>
                )}
                {lead.utm_campaign && (
                  <>
                    <span className="text-gray-500">Campanha:</span>
                    <span>{lead.utm_campaign}</span>
                  </>
                )}
                {lead.utm_term && (
                  <>
                    <span className="text-gray-500">Palavra-chave:</span>
                    <span>{lead.utm_term}</span>
                  </>
                )}
              </>
            )}

            {lead.contacted_at && (
              <>
                <span className="text-gray-500">Contatado em:</span>
                <span>{formatDate(lead.contacted_at)}</span>
              </>
            )}
          </div>

          {(lead.concerns || lead.message) && (
            <div className="pt-2 border-t">
              <p className="text-gray-500 mb-1">Preocupações:</p>
              <p className="text-gray-700 whitespace-pre-wrap">{lead.concerns || lead.message}</p>
            </div>
          )}

          {lead.notes && (
            <div className="pt-2 border-t">
              <p className="text-gray-500 mb-1">Notas:</p>
              <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Services Tab ───────────────────────────────────────────

function ServicesTab() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [toggleTarget, setToggleTarget] = useState(null)

  const loadServices = async () => {
    try {
      const data = await adminService.getServices()
      setServices(data)
    } catch (e) {
      toast.error('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadServices() }, [])

  const filtered = useMemo(() => {
    if (!search) return services
    const q = search.toLowerCase()
    return services.filter(s =>
      s.name.toLowerCase().includes(q) || s.slug?.toLowerCase().includes(q)
    )
  }, [services, search])

  const handleSave = async (formData) => {
    try {
      let result
      if (editing) {
        result = await adminService.updateService(editing.id, formData)
        setServices(prev => prev.map(s => s.id === result.id ? result : s))
        toast.success('Serviço atualizado')
      } else {
        result = await adminService.createService(formData)
        setServices(prev => [...prev, result])
        toast.success('Serviço criado')
      }
      setDialogOpen(false)
      setEditing(null)
      return result
    } catch (e) {
      toast.error(e.errors ? e.errors.join(', ') : 'Erro ao salvar serviço')
      return null
    }
  }

  const handleToggleActive = async () => {
    if (!toggleTarget) return
    try {
      const updated = await adminService.toggleServiceActive(toggleTarget.id)
      setServices(prev => prev.map(s => s.id === updated.id ? updated : s))
      toast.success(updated.active ? 'Serviço ativado' : 'Serviço desativado')
    } catch (e) {
      toast.error('Erro ao alterar status')
    } finally {
      setToggleTarget(null)
    }
  }

  const openDetail = async (service) => {
    try {
      const data = await adminService.getService(service.id)
      setDetail(data)
      setDetailOpen(true)
    } catch (e) {
      toast.error('Erro ao carregar detalhes')
    }
  }

  if (loading) return <LoadingState />

  return (
    <>
      <div className="flex items-center justify-between gap-4 mt-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar serviços..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState message="Nenhum serviço encontrado" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Duração</TableHead>
                  <TableHead className="text-right">Preço Padrão</TableHead>
                  <TableHead className="text-center">Login</TableHead>
                  <TableHead className="text-center">Terapeutas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(service => (
                  <TableRow key={service.id}>
                    <TableCell
                      className="font-medium cursor-pointer hover:underline"
                      onClick={() => openDetail(service)}
                    >
                      {service.name}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">{service.slug}</TableCell>
                    <TableCell className="text-center">{service.duration} min</TableCell>
                    <TableCell className="text-right">R$ {parseFloat(service.default_price).toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={service.requires_login ? 'default' : 'secondary'}>
                        {service.requires_login ? 'Sim' : 'Não'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{service.therapists_count}</TableCell>
                    <TableCell>
                      <ActiveBadge active={service.active} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(service); setDialogOpen(true) }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setToggleTarget(service)}>
                          <Power className={`h-4 w-4 ${service.active ? 'text-red-500' : 'text-green-500'}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ServiceFormDialog
        open={dialogOpen}
        onOpenChange={open => { if (!open) { setDialogOpen(false); setEditing(null) } }}
        service={editing}
        onSave={handleSave}
      />

      <ToggleActiveDialog
        open={!!toggleTarget}
        onOpenChange={open => { if (!open) setToggleTarget(null) }}
        name={toggleTarget?.name}
        active={toggleTarget?.active}
        onConfirm={handleToggleActive}
      />

      <ServiceDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        service={detail}
        onUpdate={(updated) => {
          setDetail(updated)
          setServices(prev => prev.map(s => s.id === updated.id ? { ...s, therapists_count: updated.therapists?.length || 0 } : s))
        }}
      />
    </>
  )
}

// ─── Service Form Dialog ────────────────────────────────────

function ServiceFormDialog({ open, onOpenChange, service, onSave }) {
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(service ? {
        name: service.name || '',
        slug: service.slug || '',
        description: service.description || '',
        default_price: service.default_price || '',
        duration: service.duration || '',
        requires_login: service.requires_login !== undefined ? String(service.requires_login) : 'true',
        position: service.position || 0,
      } : {
        name: '', slug: '', description: '', default_price: '', duration: '',
        requires_login: 'true', position: 0,
      })
    }
  }, [open, service])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name?.trim()) { toast.error('Nome é obrigatório'); return }
    if (!form.default_price) { toast.error('Preço é obrigatório'); return }
    if (!form.duration) { toast.error('Duração é obrigatória'); return }

    setSaving(true)
    const data = {
      ...form,
      default_price: parseFloat(form.default_price),
      duration: parseInt(form.duration),
      requires_login: form.requires_login === 'true',
      position: parseInt(form.position) || 0,
    }
    if (!data.slug?.trim()) delete data.slug

    await onSave(data)
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
          <DialogDescription>
            {service ? 'Atualize os dados do serviço' : 'Preencha os dados para criar um serviço'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service-name">Nome *</Label>
              <Input id="service-name" name="name" value={form.name || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="service-slug">Slug</Label>
              <Input id="service-slug" name="slug" value={form.slug || ''} onChange={handleChange} placeholder="Auto-gerado se vazio" />
            </div>
          </div>
          <div>
            <Label htmlFor="service-description">Descrição</Label>
            <Textarea id="service-description" name="description" value={form.description || ''} onChange={handleChange} rows={3} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="service-price">Preço Padrão (R$) *</Label>
              <Input id="service-price" name="default_price" type="number" step="0.01" min="0.01" value={form.default_price || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="service-duration">Duração (min) *</Label>
              <Input id="service-duration" name="duration" type="number" min="1" max="180" value={form.duration || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="service-position">Posição</Label>
              <Input id="service-position" name="position" type="number" min="0" value={form.position ?? 0} onChange={handleChange} />
            </div>
          </div>
          <div>
            <Label htmlFor="service-requires-login">Requer Login</Label>
            <Select value={form.requires_login || 'true'} onValueChange={val => setForm(prev => ({ ...prev, requires_login: val }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim — apenas clientes logados</SelectItem>
                <SelectItem value="false">Não — público (WhatsApp)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {service ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Service Detail Dialog (therapist assignments) ──────────

function ServiceDetailDialog({ open, onOpenChange, service, onUpdate }) {
  const [allTherapists, setAllTherapists] = useState([])
  const [addingId, setAddingId] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      adminService.getTherapists().then(setAllTherapists).catch(() => {})
      setCustomPrice('')
      setAddingId('')
    }
  }, [open])

  if (!service) return null

  const assignedIds = new Set((service.therapists || []).map(t => t.id))
  const available = allTherapists.filter(t => !assignedIds.has(t.id) && t.active)

  const handleAdd = async () => {
    if (!addingId) return
    setSaving(true)
    try {
      const priceVal = customPrice ? parseFloat(customPrice) : null
      const added = await adminService.addTherapistToService(service.id, parseInt(addingId), priceVal)
      const updated = { ...service, therapists: [...(service.therapists || []), added] }
      onUpdate(updated)
      setAddingId('')
      setCustomPrice('')
      toast.success('Terapeuta adicionado')
    } catch (e) {
      toast.error(e.errors ? e.errors.join(', ') : 'Erro ao adicionar terapeuta')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (therapistId) => {
    try {
      await adminService.removeTherapistFromService(service.id, therapistId)
      const updated = { ...service, therapists: service.therapists.filter(t => t.id !== therapistId) }
      onUpdate(updated)
      toast.success('Terapeuta removido')
    } catch (e) {
      toast.error('Erro ao remover terapeuta')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{service.name} — Terapeutas</DialogTitle>
          <DialogDescription>
            Gerencie os terapeutas que oferecem este serviço. Preço padrão: R$ {parseFloat(service.default_price).toFixed(2)} | {service.duration} min
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Select value={addingId} onValueChange={setAddingId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecionar terapeuta..." />
              </SelectTrigger>
              <SelectContent>
                {available.length === 0 ? (
                  <SelectItem value="_none" disabled>Nenhum disponível</SelectItem>
                ) : (
                  available.map(t => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name} — {t.specialty || 'Sem especialidade'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Preço (R$)"
              value={customPrice}
              onChange={e => setCustomPrice(e.target.value)}
              className="w-28"
            />
            <Button onClick={handleAdd} disabled={!addingId || saving} size="icon">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">Deixe o preço em branco para usar o preço padrão do serviço.</p>

          {(service.therapists || []).length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Nenhum terapeuta vinculado</p>
          ) : (
            <div className="space-y-2">
              {service.therapists.map(t => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">
                      {t.specialty || 'Sem especialidade'} — R$ {parseFloat(t.effective_price).toFixed(2)}
                      {t.custom_price ? ` (personalizado)` : ` (padrão)`}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemove(t.id)}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Questionnaires Tab ──────────────────────────────────────

function QuestionnairesTab() {
  const [questionnaires, setQuestionnaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toggleTarget, setToggleTarget] = useState(null)

  const loadQuestionnaires = async () => {
    try {
      const data = await adminService.getQuestionnaires()
      setQuestionnaires(data)
    } catch (e) {
      toast.error('Erro ao carregar questionários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadQuestionnaires() }, [])

  const filtered = useMemo(() => {
    if (!search) return questionnaires
    const q = search.toLowerCase()
    return questionnaires.filter(qn =>
      qn.title.toLowerCase().includes(q) ||
      qn.slug?.toLowerCase().includes(q) ||
      qn.company_name?.toLowerCase().includes(q)
    )
  }, [questionnaires, search])

  const handleToggleActive = async () => {
    if (!toggleTarget) return
    try {
      const updated = await adminService.toggleQuestionnaireActive(toggleTarget.id)
      setQuestionnaires(prev => prev.map(q => q.id === updated.id ? updated : q))
      toast.success(updated.active ? 'Questionário ativado' : 'Questionário desativado')
    } catch (e) {
      toast.error('Erro ao alterar status')
    } finally {
      setToggleTarget(null)
    }
  }

  if (loading) return <LoadingState />

  return (
    <>
      <div className="flex items-center justify-between gap-4 mt-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar questionários..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState message="Nenhum questionário encontrado" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="text-center">Perguntas</TableHead>
                  <TableHead className="text-center">Respostas</TableHead>
                  <TableHead className="text-center">Anônimo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(q => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.title}</TableCell>
                    <TableCell className="text-gray-500 text-sm font-mono">{q.slug}</TableCell>
                    <TableCell>{q.company_name || <span className="text-gray-400">Global</span>}</TableCell>
                    <TableCell className="text-center">{q.question_count}</TableCell>
                    <TableCell className="text-center">{q.response_count}</TableCell>
                    <TableCell className="text-center">
                      {q.allow_anonymous ? (
                        <Badge className="bg-blue-100 text-blue-800">Sim</Badge>
                      ) : (
                        <span className="text-gray-400">Não</span>
                      )}
                    </TableCell>
                    <TableCell><ActiveBadge active={q.active} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={q.active ? 'Desativar' : 'Ativar'}
                          onClick={() => setToggleTarget(q)}
                        >
                          <Power className={`h-4 w-4 ${q.active ? 'text-red-500' : 'text-green-500'}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ToggleActiveDialog
        open={!!toggleTarget}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        name={toggleTarget?.title}
        active={toggleTarget?.active}
        onConfirm={handleToggleActive}
      />
    </>
  )
}

// ─── Themes Tab ──────────────────────────────────────────────

function ThemesTab() {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toggleTarget, setToggleTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const loadThemes = async () => {
    try {
      const data = await adminService.getThemes()
      setThemes(Array.isArray(data) ? data : [])
    } catch (e) {
      toast.error('Erro ao carregar temas')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadThemes() }, [])

  const handleNew = () => { setEditing(null); setDialogOpen(true) }
  const handleEdit = (theme) => { setEditing(theme); setDialogOpen(true) }

  const handleSave = async (data) => {
    try {
      if (editing) {
        await adminService.updateTheme(editing.id, data)
        toast.success('Tema atualizado')
      } else {
        await adminService.createTheme(data)
        toast.success('Tema criado')
      }
      setDialogOpen(false)
      loadThemes()
    } catch (e) {
      const msg = e.errors?.[0] || e.message || 'Erro ao salvar tema'
      toast.error(msg)
      console.error(e)
    }
  }

  const handleToggleActive = async () => {
    if (!toggleTarget) return
    try {
      await adminService.toggleThemeActive(toggleTarget.id)
      toast.success(toggleTarget.active ? 'Tema desativado' : 'Tema ativado')
      setToggleTarget(null)
      loadThemes()
    } catch (e) {
      toast.error('Erro ao alternar status')
      console.error(e)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await adminService.deleteTheme(deleteTarget.id)
      toast.success('Tema removido')
      setDeleteTarget(null)
      loadThemes()
    } catch (e) {
      toast.error('Erro ao remover tema')
      console.error(e)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Temas de busca</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Temas aparecem no filtro da home. Cada tema agrupa várias tags — o paciente vê poucos temas, o terapeuta usa tags granulares.
              </p>
            </div>
            <Button onClick={handleNew} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Novo tema
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : themes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Nenhum tema cadastrado. Rode <code className="bg-gray-100 px-1 rounded">rake themes:seed</code> para criar os 8 iniciais, ou clique em "Novo tema".
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Ordem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-36 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {themes.map(theme => (
                  <TableRow key={theme.id}>
                    <TableCell className="font-mono text-xs">{theme.display_order}</TableCell>
                    <TableCell>
                      <div className="font-medium">{theme.name}</div>
                      {theme.description && (
                        <div className="text-xs text-gray-500 line-clamp-2">{theme.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(theme.tags || []).slice(0, 5).map(tag => (
                          <span key={tag.id} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {tag.name}
                          </span>
                        ))}
                        {(theme.tags || []).length > 5 && (
                          <span className="text-[10px] text-gray-400 px-1">+{theme.tags.length - 5}</span>
                        )}
                        {(theme.tags || []).length === 0 && (
                          <span className="text-xs text-gray-400 italic">sem tags</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={theme.active ? 'default' : 'secondary'}>
                        {theme.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(theme)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setToggleTarget(theme)}>
                          <Power className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(theme)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ThemeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        theme={editing}
        onSave={handleSave}
      />

      <ToggleActiveDialog
        open={!!toggleTarget}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        name={toggleTarget?.name}
        active={toggleTarget?.active}
        onConfirm={handleToggleActive}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover tema?</AlertDialogTitle>
            <AlertDialogDescription>
              O tema "{deleteTarget?.name}" será removido do filtro da home. As tags associadas não são afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ─── Theme Form Dialog ───────────────────────────────────────

function ThemeFormDialog({ open, onOpenChange, theme, onSave }) {
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [availableTags, setAvailableTags] = useState([])

  useEffect(() => {
    if (open) {
      setForm(theme ? {
        name: theme.name || '',
        description: theme.description || '',
        display_order: theme.display_order ?? 0,
        active: theme.active !== false,
        tag_ids: Array.isArray(theme.tag_ids) ? theme.tag_ids : [],
      } : {
        name: '', description: '', display_order: 0, active: true, tag_ids: [],
      })
    }
  }, [open, theme])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    adminService.getTags()
      .then(tags => { if (!cancelled) setAvailableTags(tags) })
      .catch(() => { if (!cancelled) setAvailableTags([]) })
    return () => { cancelled = true }
  }, [open])

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const toggleTagId = (id) => {
    setForm(prev => {
      const current = prev.tag_ids || []
      const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id]
      return { ...prev, tag_ids: next }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name?.trim()) { toast.error('Nome é obrigatório'); return }
    setSaving(true)
    try {
      const data = { ...form }
      if (data.display_order !== undefined && data.display_order !== '') {
        data.display_order = parseInt(data.display_order) || 0
      }
      await onSave(data)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{theme ? 'Editar Tema' : 'Novo Tema'}</DialogTitle>
          <DialogDescription>
            Temas aparecem no filtro público. Use linguagem de paciente (ex: "Ansiedade e estresse") e mapeie para as tags internas que ele representa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="theme-name">Nome *</Label>
            <Input id="theme-name" name="name" value={form.name || ''} onChange={handleChange} placeholder="Ex: Ansiedade e estresse" />
          </div>
          <div>
            <Label htmlFor="theme-description">Descrição</Label>
            <Textarea id="theme-description" name="description" value={form.description || ''} onChange={handleChange} rows={2} placeholder="Opcional — aparece como tooltip no filtro" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="theme-order">Ordem de exibição</Label>
              <Input id="theme-order" name="display_order" type="number" min="0" value={form.display_order ?? 0} onChange={handleChange} />
            </div>
            <div className="flex items-end pb-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name="active" checked={!!form.active} onChange={handleChange} />
                Ativo (visível no filtro)
              </label>
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-1">Tags internas</p>
            <p className="text-xs text-gray-500 mb-3">Qualquer terapeuta marcado com uma dessas tags entra nesse tema.</p>
            {availableTags.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhuma tag cadastrada.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto">
                {availableTags.map(tag => {
                  const selected = (form.tag_ids || []).includes(tag.id)
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => toggleTagId(tag.id)}
                      className={
                        "px-2.5 py-1 rounded-full text-xs border transition-colors " +
                        (selected
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400")
                      }
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {(form.tag_ids || []).length} tag{(form.tag_ids || []).length === 1 ? '' : 's'} selecionada{(form.tag_ids || []).length === 1 ? '' : 's'}
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {theme ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
