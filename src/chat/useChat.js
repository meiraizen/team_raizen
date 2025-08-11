import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuthStore, allowedAccounts } from '../store/auth'
import { fetchConversation, insertMessage, subscribeConversation } from './supabaseClient'

export function useContacts() {
  const user = useAuthStore((s) => s.user)
  const contacts = useMemo(() => {
    if (!user) return []
    return allowedAccounts.filter((u) => u.email !== user.email)
  }, [user])
  return { contacts }
}

export function useChat(selectedEmail) {
  const user = useAuthStore((s) => s.user)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const unsubRef = useRef(null)

  const receiver = selectedEmail
  const sender = user?.email

  const sortByTime = (arr) => [...arr].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const load = useCallback(async () => {
    if (!sender || !receiver) return
    setLoading(true)
    setError('')
    const { data, error } = await fetchConversation({ a: sender, b: receiver, limit: 200 })
    if (error) {
      const msg = error.message || String(error)
      const friendly = msg.includes('401') ? 'Unauthorized (401). Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' : msg
      setError(friendly)
    }
    const filtered = Array.isArray(data)
      ? data.filter((r) => (r.sender_email === sender && r.receiver_email === receiver) || (r.sender_email === receiver && r.receiver_email === sender))
      : []
    setMessages(sortByTime(filtered))
    setLoading(false)
  }, [sender, receiver])

  useEffect(() => { setMessages([]); setError(''); if (sender && receiver) load() }, [sender, receiver, load])

  useEffect(() => {
    if (!sender || !receiver) return
    unsubRef.current?.()
    unsubRef.current = subscribeConversation({ a: sender, b: receiver, onInsert: (row) => {
      if ((row.sender_email === sender && row.receiver_email === receiver) || (row.sender_email === receiver && row.receiver_email === sender)) {
        setMessages((prev) => {
          // de-dup by id
          if (prev.some((m) => m.id === row.id)) return prev
          return sortByTime([...prev, row])
        })
      }
    } })
    return () => unsubRef.current?.()
  }, [sender, receiver])

  const send = useCallback(async (content) => {
    const trimmed = content?.trim()
    if (!trimmed) return { error: new Error('Empty message') }
    const optimistic = {
      id: `tmp_${Date.now()}`,
      sender_email: sender,
      receiver_email: receiver,
      content: trimmed,
      created_at: new Date().toISOString(),
      _optimistic: true,
    }
    setMessages((prev) => sortByTime([...prev, optimistic]))
    const { data, error } = await insertMessage({ sender_email: sender, receiver_email: receiver, content: trimmed })
    if (error) {
      const msg = error.message || String(error)
      console.error('[Chat] Send failed:', msg)
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      return { error }
    }
    // Replace optimistic with server row; ignore if realtime already appended actual row
    setMessages((prev) => {
      const withoutTmp = prev.filter((m) => m.id !== optimistic.id)
      if (withoutTmp.some((m) => m.id === data.id)) return sortByTime(withoutTmp)
      return sortByTime([...withoutTmp, data])
    })
    return { data }
  }, [sender, receiver])

  return { messages, loading, error, send, reload: load }
}
