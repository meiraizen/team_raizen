import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!url || !anon) {
  console.warn('[Supabase] Environment variables missing. Check .env file.')
}

export const supabase = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})

// ─── Profiles ──────────────────────────────────────────────
export async function getProfile(email) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single()
  return { data, error }
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function createProfile({ email, full_name, created_by }) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ email, full_name, created_by }])
    .select()
    .single()
  return { data, error }
}

export async function updateProfile(email, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('email', email)
    .select()
    .single()
  return { data, error }
}

// ─── Roles ─────────────────────────────────────────────────
export async function getAllRoles() {
  const { data, error } = await supabase
    .rpc('get_all_roles')
  return { data, error }
}

// ─── User Roles ────────────────────────────────────────────
export async function getUserRoles(email) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*, roles(*)')
    .eq('email', email)
  return { data, error }
}

export async function setUserRole({ email, role_id, granted_by }) {
  const { data, error } = await supabase
    .from('user_roles')
    .upsert([{ email, role_id, granted_by }], { onConflict: 'email, role_id' })
    .select()
    .single()
  return { data, error }
}

export async function removeUserRole(email, role_id) {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('email', email)
    .eq('role_id', role_id)
  return { error }
}

// ─── Role-Module Permissions ───────────────────────────────
export async function getRolePermissions(role_id) {
  const { data, error } = await supabase
    .from('role_module_permissions')
    .select('*')
    .eq('role_id', role_id)
  return { data, error }
}

export async function setRolePermission({ role_id, module_key, can_view, can_create, can_edit, can_delete, granted_by }) {
  const { data, error } = await supabase
    .from('role_module_permissions')
    .upsert([{ role_id, module_key, can_view, can_create, can_edit, can_delete, granted_by }], { onConflict: 'role_id, module_key' })
    .select()
    .single()
  return { data, error }
}

// ─── User-Module Permissions ───────────────────────────────
export async function getUserModulePermissions(email) {
  const { data, error } = await supabase
    .from('user_module_permissions')
    .select('*')
    .eq('email', email)
  return { data, error }
}

export async function setUserModulePermission({ email, module_key, can_view, can_create, can_edit, can_delete, granted_by }) {
  const { data, error } = await supabase
    .from('user_module_permissions')
    .upsert([{ email, module_key, can_view, can_create, can_edit, can_delete, granted_by }], { onConflict: 'email, module_key' })
    .select()
    .single()
  return { data, error }
}

// ─── Permissions (combined) ────────────────────────────────
export async function getUserPermissions(email) {
  const { data, error } = await supabase
    .rpc('get_user_permissions', { user_email: email })
  return { data, error }
}

export async function getUserRole(email) {
  const { data, error } = await supabase
    .rpc('get_user_role', { user_email: email })
  return { data, error }
}

// ─── All Modules ───────────────────────────────────────────
export async function getAllModules() {
  const { data, error } = await supabase
    .rpc('get_all_modules')
  return { data, error }
}

// ─── Students ──────────────────────────────────────────────
export async function getStudents(filters = {}) {
  let query = supabase.from('students').select('*, batches(*)').eq('is_active', true)
  if (filters.belt_level) query = query.eq('belt_level', filters.belt_level)
  if (filters.gender) query = query.eq('gender', filters.gender)
  if (filters.batch_id) query = query.eq('batch_id', filters.batch_id)
  if (filters.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,id.eq.${filters.search}`)
  }
  query = query.order('created_at', { ascending: false })
  const { data, error } = await query
  return { data, error }
}

export async function getStudent(id) {
  const { data, error } = await supabase
    .from('students')
    .select('*, batches(*)')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function createStudent(studentData) {
  const { data, error } = await supabase
    .from('students')
    .insert([studentData])
    .select()
    .single()
  return { data, error }
}

export async function updateStudent(id, updates) {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deleteStudent(id) {
  const { data, error } = await supabase
    .from('students')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

// ─── Batches ───────────────────────────────────────────────
export async function getBatches() {
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('is_active', true)
    .order('batch_name', { ascending: true })
  return { data, error }
}

export async function createBatch(batchData) {
  const { data, error } = await supabase
    .from('batches')
    .insert([batchData])
    .select()
    .single()
  return { data, error }
}

// ─── Delete Batch ───────────────────────────────────────────
export async function deleteBatch(batchId) {
  const { data, error } = await supabase
    .from('batches')
    .update({ is_active: false })
    .eq('id', batchId)
    .select()
    .single()
  return { data, error }
}

// ─── Attendance ────────────────────────────────────────────
export async function getAttendance({ batch_id, date }) {
  let query = supabase.from('attendance').select('*, students(full_name)')
  if (batch_id) query = query.eq('batch_id', batch_id)
  if (date) query = query.eq('date', date)
  const { data, error } = await query
  return { data, error }
}

export async function upsertAttendance(records) {
  const { data, error } = await supabase
    .from('attendance')
    .upsert(records, { onConflict: 'student_id, batch_id, date' })
    .select()
  return { data, error }
}

// ─── Receipts ──────────────────────────────────────────────
export async function getReceipts(filters = {}) {
  let query = supabase.from('receipts').select('*').order('created_at', { ascending: false })
  if (filters.student_name) query = query.ilike('student_name', `%${filters.student_name}%`)
  if (filters.receipt_no) query = query.ilike('receipt_no', `%${filters.receipt_no}%`)
  if (filters.paid_to) query = query.eq('paid_to', filters.paid_to)
  if (filters.batch) query = query.eq('batch', filters.batch)
  const { data, error } = await query
  return { data, error }
}

export async function getNextReceiptNo() {
  const { data, error } = await supabase
    .from('receipts')
    .select('receipt_no')
    .order('receipt_no', { ascending: false })
    .limit(1)
  if (!error && data && data.length > 0) {
    const last = parseInt(data[0].receipt_no, 10)
    return isNaN(last) ? '1' : String(last + 1)
  }
  return '1'
}

export async function createReceipt(receiptData) {
  const { data, error } = await supabase
    .from('receipts')
    .insert([receiptData])
    .select()
    .single()
  return { data, error }
}

// ─── Certificates ──────────────────────────────────────────
export async function getCertificates(search) {
  let query = supabase.from('certificates').select('*')
  if (search) {
    query = query.or(`student_name.ilike.%${search}%,certificate_hash.ilike.%${search}%`)
  }
  const { data, error } = await query
  return { data, error }
}

// ─── Messages ──────────────────────────────────────────────
export async function insertMessage({ sender_email, receiver_email, content }) {
  if (!sender_email || !receiver_email || !content?.trim()) {
    return { error: new Error('Invalid payload') }
  }
  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender_email, receiver_email, content }])
    .select('*')
    .single()
  return { data, error }
}

export async function fetchConversation({ a, b, limit = 100 }) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .in('sender_email', [a, b])
    .in('receiver_email', [a, b])
    .order('created_at', { ascending: true })
    .limit(limit)
  return { data, error }
}

export function subscribeConversation({ a, b, onInsert }) {
  const channel = supabase
    .channel(`messages_convo_${a}_${b}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      const row = payload.new
      if ((row.sender_email === a && row.receiver_email === b) || (row.sender_email === b && row.receiver_email === a)) {
        onInsert?.(row)
      }
    })
    .subscribe()
  return () => { try { supabase.removeChannel(channel) } catch {} }
}

// ─── Tournaments ───────────────────────────────────────────
export async function getTournaments(student_id) {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('student_id', student_id)
    .order('tournament_date', { ascending: false })
  return { data, error }
}

export async function createTournament(tournamentData) {
  const { data, error } = await supabase
    .from('tournaments')
    .insert([tournamentData])
    .select()
    .single()
  return { data, error }
}

// ─── Course Progress ───────────────────────────────────────
export async function getCourseProgress(email) {
  const { data, error } = await supabase
    .from('user_course_progress')
    .select('*')
    .eq('email', email)
  return { data, error }
}

export async function markVideoComplete(email, subtopic_id) {
  const { data, error } = await supabase
    .from('user_course_progress')
    .upsert([{ email, subtopic_id, completed: true, completed_at: new Date().toISOString() }], { onConflict: 'email, subtopic_id' })
    .select()
    .single()
  return { data, error }
}
