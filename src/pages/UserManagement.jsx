import React, { useState, useEffect, useCallback } from 'react'
import {
  Box, Container, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel,
  Checkbox, FormControlLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Alert, Snackbar, Switch,
  Tooltip, CircularProgress, Avatar, Divider, Grid
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import RestoreIcon from '@mui/icons-material/Restore'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import PersonIcon from '@mui/icons-material/Person'
import { usePermissions } from '../hooks/usePermissions'
import { useAuthStore } from '../store/auth'
import { supabase, getAllProfiles, createProfile, updateProfile, getAllRoles, setUserRole, removeUserRole, getAllModules, getUserModulePermissions, setUserModulePermission } from '../services/supabase'
import { logAudit, logPermissionChange } from '../services/audit'
import { getModuleLabel } from '../services/permissions'
import ConfirmDelete from '../components/ConfirmDelete'

export default function UserManagement() {
  const { isSuperAdmin } = usePermissions()

  if (!isSuperAdmin) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Access Denied. Only Super Admin can manage users.</Typography>
      </Container>
    )
  }

  return <UserManagementPanel />
}

function UserManagementPanel() {
  const [profiles, setProfiles] = useState([])
  const [roles, setRoles] = useState([])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [showInactive, setShowInactive] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const user = useAuthStore(s => s.user)
  const refreshPermissions = useAuthStore(s => s.refreshPermissions)

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const [profilesRes, rolesRes, modulesRes] = await Promise.all([
      getAllProfiles(),
      getAllRoles(),
      getAllModules(),
    ])
    if (profilesRes.error) console.error('[UserMgmt] profiles error:', profilesRes.error)
    if (rolesRes.error) console.error('[UserMgmt] roles error:', rolesRes.error)
    if (modulesRes.error) console.error('[UserMgmt] modules error:', modulesRes.error)
    if (profilesRes.data) setProfiles(profilesRes.data)
    if (rolesRes.data) setRoles(rolesRes.data); else setLoadError('Failed to load roles. Check Supabase permissions.')
    if (modulesRes.data) setModules(modulesRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  // ─── Add or Reactivate User ──────────────────────────────
  const handleAddUser = async (formData) => {
    // Check if profile already exists (e.g., deactivated user)
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', formData.email)
      .maybeSingle()

    if (existing) {
      // Reactivate and update name
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ is_active: true, full_name: formData.full_name })
        .eq('email', formData.email)
      if (updateErr) { showSnackbar(updateErr.message, 'error'); return }

      if (formData.role_id) {
        await setUserRole({ email: formData.email, role_id: formData.role_id, granted_by: user?.email })
      }

      await logAudit({
        action: 'REACTIVATE', entityType: 'user', entityId: formData.email,
        changes: { before: { is_active: false }, after: { is_active: true } },
        metadata: { reactivated_by: user?.email },
      })

      showSnackbar(`User ${formData.email} reactivated!`)
    } else {
      // Create new profile
      const { error } = await createProfile({
        email: formData.email, full_name: formData.full_name, created_by: user?.email,
      })
      if (error) { showSnackbar(error.message, 'error'); return }

      if (formData.role_id) {
        await setUserRole({ email: formData.email, role_id: formData.role_id, granted_by: user?.email })
      }

      await logAudit({
        action: 'CREATE', entityType: 'user', entityId: formData.email,
        changes: { before: null, after: { email: formData.email, full_name: formData.full_name, role_id: formData.role_id } },
        metadata: { created_by: user?.email },
      })

      showSnackbar(`User ${formData.email} added!`)
    }

    setAddDialogOpen(false)
    loadData()
  }

  // ─── Delete (Deactivate) User ────────────────────────────
  const handleDeleteUser = async () => {
    if (!deleteConfirm) return
    await supabase.from('profiles').update({ is_active: false }).eq('email', deleteConfirm.email)
    await logAudit({
      action: 'DELETE', entityType: 'user', entityId: deleteConfirm.email,
      changes: { before: { email: deleteConfirm.email }, after: null },
      metadata: { deleted_by: user?.email },
    })
    showSnackbar(`User ${deleteConfirm.email} deactivated.`)
    setDeleteConfirm(null)
    loadData()
  }

  // ─── Reactivate User ─────────────────────────────────────
  const handleReactivateUser = async (profile) => {
    await supabase.from('profiles').update({ is_active: true }).eq('email', profile.email)
    await logAudit({
      action: 'REACTIVATE', entityType: 'user', entityId: profile.email,
      changes: { before: { is_active: false }, after: { is_active: true } },
      metadata: { reactivated_by: user?.email },
    })
    showSnackbar(`User ${profile.email} reactivated successfully.`)
    loadData()
  }

  // ─── Edit Permissions ────────────────────────────────────
  const handleEditPermissions = async (profile) => {
    const { data: userPerms } = await getUserModulePermissions(profile.email)
    const permsMap = {}
    if (userPerms) {
      userPerms.forEach(p => { permsMap[p.module_key] = p })
    }
    setSelectedProfile({
      ...profile,
      currentPerms: permsMap,
      selectedRole: null,
      editName: profile.full_name,
    })
    // Load current role (via RPC to bypass RLS)
    const { data: roleData } = await supabase.rpc('get_user_role', { user_email: profile.email })
    if (roleData && roleData.length > 0) {
      setSelectedProfile(prev => ({ ...prev, selectedRole: roleData[0].role_id }))
    }
    setEditDialogOpen(true)
  }

  const handleSavePermissions = async () => {
    if (!selectedProfile) return
    const profile = selectedProfile

    // Update name if changed
    if (profile.editName && profile.editName !== profile.full_name) {
      const { error: nameErr } = await updateProfile(profile.email, { full_name: profile.editName })
      if (nameErr) { showSnackbar('Failed to update name: ' + nameErr.message, 'error'); return }
    }

    // Update role
    if (profile.selectedRole) {
      const { data: existing } = await supabase.from('user_roles').select('role_id').eq('email', profile.email)
      if (existing && existing.length > 0) {
        const { error: delErr } = await supabase.from('user_roles').delete().eq('email', profile.email)
        if (delErr) { showSnackbar('Failed to update role: ' + delErr.message, 'error'); return }
      }
      const { error: roleErr } = await setUserRole({ email: profile.email, role_id: profile.selectedRole, granted_by: user?.email })
      if (roleErr) { showSnackbar('Failed to assign role: ' + roleErr.message, 'error'); return }
    }

    await logAudit({
      action: 'UPDATE', entityType: 'user_role', entityId: profile.email,
      changes: { role_id: profile.selectedRole, full_name: profile.editName },
      metadata: { updated_by: user?.email },
    })

    showSnackbar(`User ${profile.email} updated successfully.`)
    setEditDialogOpen(false)
    setSelectedProfile(null)
    loadData()
    if (profile.email === user?.email) refreshPermissions()
  }

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId)
    return role ? role.name : 'Unknown'
  }

  const getRoleChipColor = (roleName) => {
    switch (roleName) {
      case 'super_admin': return 'error'
      case 'admin': return 'primary'
      case 'instructor': return 'warning'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>User Management</Typography>
          <Typography variant="body2" color="text.secondary">Manage users, roles, and permissions</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)}>
          Add User
        </Button>
      </Box>

      {loadError && (
        <Alert severity="warning" sx={{ mb: 2 }}>{loadError}</Alert>
      )}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <FormControlLabel
          control={<Switch size="small" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} />}
          label="Show inactive users"
        />
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(showInactive ? profiles : profiles.filter(p => p.is_active)).length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No users found</TableCell></TableRow>
            ) : (showInactive ? profiles : profiles.filter(p => p.is_active)).map((profile) => (
              <TableRow key={profile.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                      {profile.full_name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>{profile.full_name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{profile.email}</TableCell>
                <TableCell>
                  <Chip
                    icon={profile.email === user?.email ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                    label={profile.user_role || '—'}
                    size="small"
                    color={getRoleChipColor(profile.user_role)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip label={profile.is_active ? 'Active' : 'Inactive'} color={profile.is_active ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {profile.is_active && (
                      <Tooltip title="Edit Permissions">
                        <IconButton size="small" onClick={() => handleEditPermissions(profile)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {profile.email !== user?.email && profile.is_active && (
                      <Tooltip title="Deactivate User">
                        <IconButton size="small" color="error" onClick={() => setDeleteConfirm(profile)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {!profile.is_active && (
                      <Tooltip title="Reactivate User">
                        <IconButton size="small" color="success" onClick={() => handleReactivateUser(profile)}>
                          <RestoreIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Add User Dialog ── */}
      <AddUserDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddUser}
        roles={roles}
      />

      {/* ── Edit Permissions Dialog ── */}
      {selectedProfile && (
        <EditPermissionsDialog
          open={editDialogOpen}
          onClose={() => { setEditDialogOpen(false); setSelectedProfile(null) }}
          onSave={handleSavePermissions}
          profile={selectedProfile}
          setProfile={setSelectedProfile}
          modules={modules}
          roles={roles}
          currentUser={user}
        />
      )}

      {/* ── Delete Confirmation ── */}
      <ConfirmDelete
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteUser}
        itemName={deleteConfirm?.email || ''}
        itemType="user"
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  )
}

// ─── Add User Dialog ──────────────────────────────────────
function AddUserDialog({ open, onClose, onSave, roles }) {
  const [form, setForm] = useState({ email: '', full_name: '', role_id: '' })
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!form.email || !form.full_name) {
      setError('Email and Full Name are required')
      return
    }
    if (!form.email.includes('@')) {
      setError('Invalid email format')
      return
    }
    onSave(form)
    setForm({ email: '', full_name: '', role_id: '' })
    setError('')
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Full Name" fullWidth value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
          />
          <TextField label="Email" type="email" fullWidth value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={form.role_id} label="Role"
              onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}
            >
              {roles.length === 0 && (
                <MenuItem disabled value="">No roles available</MenuItem>
              )}
              {roles.map(role => (
                <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary">
            The user will receive an OTP via email to their registered email address.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Add User</Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Edit Permissions Dialog ──────────────────────────────
function EditPermissionsDialog({ open, onClose, onSave, profile, setProfile, modules, roles, currentUser }) {
  const [userPerms, setUserPerms] = useState({})

  useEffect(() => {
    loadUserPerms()
  }, [profile.email])

  const loadUserPerms = async () => {
    const { data: roleData } = await supabase.rpc('get_user_role', { user_email: profile.email })
    if (roleData && roleData.length > 0) {
      setProfile(prev => ({ ...prev, selectedRole: roleData[0].role_id }))
    }
    const { data: permsData } = await supabase.from('user_module_permissions').select('*').eq('email', profile.email)
    const map = {}
    if (permsData) {
      permsData.forEach(p => { map[p.module_key] = { can_view: p.can_view, can_create: p.can_create, can_edit: p.can_edit, can_delete: p.can_delete } })
    }
    setUserPerms(map)
  }

  const togglePerm = async (moduleKey, field) => {
    const current = userPerms[moduleKey] || { can_view: false, can_create: false, can_edit: false, can_delete: false }
    const updated = { ...current, [field]: !current[field] }
    const newPerms = { ...userPerms, [moduleKey]: updated }
    setUserPerms(newPerms)

    await setUserModulePermission({
      email: profile.email, module_key: moduleKey,
      can_view: updated.can_view, can_create: updated.can_create,
      can_edit: updated.can_edit, can_delete: updated.can_delete,
      granted_by: currentUser?.email,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{profile.editName?.charAt(0) || profile.full_name?.charAt(0)}</Avatar>
          {profile.editName || profile.full_name} — Edit User
        </Box>
        <Typography variant="caption" color="text.secondary">{profile.email}</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>User Details</Typography>
          <TextField
            label="Full Name" fullWidth size="small" value={profile.editName || ''}
            onChange={e => setProfile(prev => ({ ...prev, editName: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle2" gutterBottom>Role Assignment</Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select
              value={profile.selectedRole || ''}
              label="Role"
              onChange={e => setProfile(prev => ({ ...prev, selectedRole: e.target.value }))}
            >
              {roles.length === 0 && (
                <MenuItem disabled value="">No roles available</MenuItem>
              )}
              {roles.map(role => (
                <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" gutterBottom>Module Permissions</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Toggle individual module permissions. These override role-based defaults.
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Module</strong></TableCell>
                <TableCell align="center"><strong>View</strong></TableCell>
                <TableCell align="center"><strong>Create</strong></TableCell>
                <TableCell align="center"><strong>Edit</strong></TableCell>
                <TableCell align="center"><strong>Delete</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {modules.map(mod => {
                const p = userPerms[mod.module_key] || {}
                return (
                  <TableRow key={mod.module_key} hover>
                    <TableCell>
                      <Typography variant="body2">{getModuleLabel(mod.module_key)}</Typography>
                    </TableCell>
                    {['can_view', 'can_create', 'can_edit', 'can_delete'].map(field => (
                      <TableCell key={field} align="center">
                        <Switch
                          size="small"
                          checked={p[field] || false}
                          onChange={() => togglePerm(mod.module_key, field)}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onSave}>Save Changes</Button>
      </DialogActions>
    </Dialog>
  )
}
