// Minimal Supabase client setup for chat only (no Supabase Auth)
import { createClient } from '@supabase/supabase-js'

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}
const url = typeof env.VITE_SUPABASE_URL === 'string' ? env.VITE_SUPABASE_URL : ''
const anon = typeof env.VITE_SUPABASE_ANON_KEY === 'string' ? env.VITE_SUPABASE_ANON_KEY : ''

// Avoid logging sensitive data to console
if (!url || !anon) {
  // Optional: generic hint without exposing values
  console.warn('[Chat] Supabase environment variables missing. Ensure .env is set and dev server restarted.')
}

export const supabase = createClient(String(url), String(anon), {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})

// Data helpers
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
  const channel = supabase.channel(`messages_${a}_${b}`)
    // listen to messages sent by a
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_email=eq.${a}` }, (payload) => {
      const row = payload.new
      if ((row.sender_email === a && row.receiver_email === b) || (row.sender_email === b && row.receiver_email === a)) {
        onInsert?.(row)
      }
    })
    // listen to messages sent by b
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_email=eq.${b}` }, (payload) => {
      const row = payload.new
      if ((row.sender_email === a && row.receiver_email === b) || (row.sender_email === b && row.receiver_email === a)) {
        onInsert?.(row)
      }
    })
    .subscribe()

  return () => {
    try { supabase.removeChannel(channel) } catch {}
  }
}
