export const MODULES = {
  BILLBOOK: 'billbook',
  STUDENTS_INFO: 'students_info',
  ATTENDANCE: 'attendance',
  CHAT: 'chat',
  CERTIFICATES: 'certificates',
  ONLINEDOJO: 'onlinedojo',
  STUDENT_REGISTRATION: 'student_registration',
  EDIT_STUDENT: 'edit_student',
  DELETE_STUDENT: 'delete_student',
  USER_MANAGEMENT: 'user_management',
  RECEIPT_DOWNLOAD: 'receipt_download',
}

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
}

export function hasPermission(permissions, moduleKey, action = 'can_view') {
  if (!permissions) return false
  const mod = permissions[moduleKey]
  if (!mod) return false
  return mod[action] === true
}

export function buildPermissionsMap(permsArray) {
  const map = {}
  if (!permsArray) return map
  for (const p of permsArray) {
    map[p.module_key] = {
      can_view: p.can_view,
      can_create: p.can_create,
      can_edit: p.can_edit,
      can_delete: p.can_delete,
    }
  }
  return map
}

export function getModuleLabel(moduleKey) {
  const labels = {
    billbook: 'Bill Book',
    students_info: 'Students Info',
    attendance: 'Attendance',
    chat: 'Chat',
    certificates: 'Verify Certificate',
    onlinedojo: 'Online Dojo',
    student_registration: 'Student Registration',
    edit_student: 'Edit Student Details',
    delete_student: 'Delete Student',
    user_management: 'User Management',
    receipt_download: 'Receipt Download',
  }
  return labels[moduleKey] || moduleKey
}
