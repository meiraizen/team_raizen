import { useAuthStore } from '../store/auth'
import { hasPermission } from '../services/permissions'

export function usePermissions() {
  const user = useAuthStore((s) => s.user)
  const permissions = useAuthStore((s) => s.permissions)
  const userRole = useAuthStore((s) => s.userRole)

  const isSuperAdmin = userRole === 'super_admin'
  const isAdmin = userRole === 'admin' || isSuperAdmin
  const isInstructor = userRole === 'instructor' || isAdmin

  return {
    canView: (moduleKey) => isSuperAdmin || hasPermission(permissions, moduleKey, 'can_view'),
    canCreate: (moduleKey) => isSuperAdmin || hasPermission(permissions, moduleKey, 'can_create'),
    canEdit: (moduleKey) => isSuperAdmin || hasPermission(permissions, moduleKey, 'can_edit'),
    canDelete: (moduleKey) => isSuperAdmin || hasPermission(permissions, moduleKey, 'can_delete'),
    isSuperAdmin,
    isAdmin,
    isInstructor,
    user,
    userRole,
    permissions,
  }
}
