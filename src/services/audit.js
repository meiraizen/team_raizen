import { supabase } from './supabase'

export async function logAudit({ action, entityType, entityId, changes, metadata = {} }) {
  try {
    const stored = localStorage.getItem('auth_user')
    const user = stored ? JSON.parse(stored) : null
    const role = localStorage.getItem('auth_user_role') || 'unknown'

    await supabase.from('audit_logs').insert({
      actor_email: user?.email || 'system',
      actor_role: role,
      action,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      changes: changes || null,
      ip_address: metadata.ip || null,
      user_agent: navigator.userAgent,
      metadata: metadata || null,
    })
  } catch (err) {
    console.warn('[Audit] Failed to log:', err.message)
  }
}

export async function logLoginHistory({ email, success, failure_reason }) {
  try {
    await supabase.from('login_history').insert({
      email,
      ip_address: null,
      user_agent: navigator.userAgent,
      login_method: 'otp',
      success,
      failure_reason: failure_reason || null,
    })
  } catch (err) {
    console.warn('[Audit] Failed to log login:', err.message)
  }
}

export async function logPermissionChange({ actor_email, target_email, module_key, changes }) {
  await logAudit({
    action: 'PERMISSION_CHANGE',
    entityType: 'permission',
    entityId: `${target_email}:${module_key || 'role'}`,
    changes,
    metadata: { actor_email, target_email, module_key },
  })
}
