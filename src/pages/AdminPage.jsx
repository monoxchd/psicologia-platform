import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Building2, Users, UserCog, Plus, Search, Edit, Power, Loader2,
  Shield, X, UserPlus
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
            <p className="text-gray-600 text-sm">Gerenciar empresas, terapeutas e clientes</p>
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
      if (editing) {
        const updated = await adminService.updateCompany(editing.id, formData)
        setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c))
        toast.success('Empresa atualizada')
      } else {
        const created = await adminService.createCompany(formData)
        setCompanies(prev => [created, ...prev])
        toast.success('Empresa criada')
      }
      setDialogOpen(false)
      setEditing(null)
    } catch (e) {
      toast.error(e.errors ? e.errors.join(', ') : 'Erro ao salvar empresa')
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

  useEffect(() => {
    if (open) {
      setForm(company ? {
        name: company.name || '',
        description: company.description || '',
        contact_email: company.contact_email || '',
        contact_phone: company.contact_phone || '',
        primary_color: company.primary_color || '#6366f1',
        secondary_color: company.secondary_color || '#8b5cf6',
        employee_count: company.employee_count || '',
      } : {
        name: '', description: '', contact_email: '', contact_phone: '',
        primary_color: '#6366f1', secondary_color: '#8b5cf6', employee_count: '',
      })
    }
  }, [open, company])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name?.trim()) { toast.error('Nome é obrigatório'); return }
    setSaving(true)
    const data = { ...form }
    if (data.employee_count) data.employee_count = parseInt(data.employee_count)
    else delete data.employee_count
    await onSave(data)
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{company ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
          <DialogDescription>
            {company ? 'Atualize os dados da empresa' : 'Preencha os dados para criar uma empresa'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="company-name">Nome *</Label>
            <Input id="company-name" name="name" value={form.name || ''} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="company-description">Descrição</Label>
            <Textarea id="company-description" name="description" value={form.description || ''} onChange={handleChange} rows={2} />
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
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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

  useEffect(() => {
    if (open) {
      setForm(therapist ? {
        email: therapist.email || '',
        name: therapist.name || '',
        specialty: therapist.specialty || '',
        experience_years: therapist.experience_years || '',
        bio: therapist.bio || '',
        crp_number: therapist.crp_number || '',
        credits_per_minute: therapist.credits_per_minute || '',
        personal_site_url: therapist.personal_site_url || '',
        calendly_url: therapist.calendly_url || '',
        password: '',
        password_confirmation: '',
      } : {
        email: '', name: '', specialty: '', experience_years: '', bio: '',
        crp_number: '', credits_per_minute: '', personal_site_url: '', calendly_url: '',
        password: '', password_confirmation: '',
      })
    }
  }, [open, therapist])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name?.trim()) { toast.error('Nome é obrigatório'); return }
    if (!form.email?.trim()) { toast.error('Email é obrigatório'); return }
    if (!therapist && !form.password) { toast.error('Senha é obrigatória para novo terapeuta'); return }
    if (form.password && form.password !== form.password_confirmation) {
      toast.error('Senhas não conferem'); return
    }

    setSaving(true)
    const data = { ...form }
    if (data.experience_years) data.experience_years = parseInt(data.experience_years)
    if (data.credits_per_minute) data.credits_per_minute = parseFloat(data.credits_per_minute)
    if (!data.password) { delete data.password; delete data.password_confirmation }
    await onSave(data)
    setSaving(false)
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
              <Label htmlFor="therapist-credits">Valor por sessão (R$)</Label>
              <Input id="therapist-credits" name="credits_per_minute" type="number" min="0" step="0.01" value={form.credits_per_minute || ''} onChange={handleChange} />
            </div>
          </div>
          <div>
            <Label htmlFor="therapist-bio">Biografia</Label>
            <Textarea id="therapist-bio" name="bio" value={form.bio || ''} onChange={handleChange} rows={2} />
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
