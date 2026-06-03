import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../store/auth'
import { fetchConversation, insertMessage, subscribeConversation } from '../../services/supabase'

export const useChat = (peer) => {
  const user = useAuthStore(s => s.user)
  const me = user?.email
  const [messages, setMessages] = useState([])
  const [initialLoading, setInitialLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const unsubRef = useRef(null)
  const messagesRef = useRef(null)
  const lastServerIdsRef = useRef({ lastId: null, lastAt: null })
  const POLL_MS = 6000

  const loadMessages = useCallback(async ({ background = false } = {}) => {
    if (!me || !peer) {
      setMessages([])
      setInitialLoading(false)
      setRefreshing(false)
      return
    }
    if (messages.length === 0 && !background) setInitialLoading(true)
    else if (background) setRefreshing(true)
    try {
      const { data } = await fetchConversation({ a: me, b: peer, limit: 200 })
      const filtered = (data || [])
        .filter(r => (r.sender_email === me && r.receiver_email === peer) || (r.sender_email === peer && r.receiver_email === me))
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map(r => ({ ...r, status: r.sender_email === me ? 'sent' : 'received' }))
      setMessages(filtered)
      const last = filtered[filtered.length - 1]
      if (last) lastServerIdsRef.current = { lastId: last.id, lastAt: last.created_at }
    } finally {
      setInitialLoading(false)
      setRefreshing(false)
    }
  }, [me, peer])

  useEffect(() => {
    const container = messagesRef.current
    if (container && messages.length > 0) container.scrollTop = container.scrollHeight
  }, [messages.length])

  useEffect(() => { loadMessages() }, [loadMessages])

  useEffect(() => {
    if (!me || !peer) return
    unsubRef.current?.()
    unsubRef.current = subscribeConversation({
      a: me, b: peer,
      onInsert: (row) => {
        setMessages(prev => {
          if (prev.some(m => m.id === row.id)) return prev
          const optimisticIndex = prev.findIndex(m => m._optimistic && m.sender_email === row.sender_email && m.receiver_email === row.receiver_email && m.content === row.content)
          let next
          if (optimisticIndex !== -1) {
            next = [...prev]
            next[optimisticIndex] = { ...row, status: row.sender_email === me ? 'sent' : 'received' }
          } else {
            next = [...prev, { ...row, status: row.sender_email === me ? 'sent' : 'received' }]
          }
          next.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          const last = next[next.length - 1]
          if (last) lastServerIdsRef.current = { lastId: last.id, lastAt: last.created_at }
          return next
        })
      }
    })
    return () => unsubRef.current?.()
  }, [me, peer])

  useEffect(() => {
    if (!me || !peer) return
    const id = setInterval(async () => {
      try {
        const { data } = await fetchConversation({ a: me, b: peer, limit: 5 })
        const filtered = (data || []).filter(r => (r.sender_email === me && r.receiver_email === peer) || (r.sender_email === peer && r.receiver_email === me)).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        const latest = filtered[filtered.length - 1]
        if (!latest) return
        const { lastId } = lastServerIdsRef.current
        if (latest.id !== lastId) loadMessages({ background: true })
      } catch { /* silent */ }
    }, POLL_MS)
    return () => clearInterval(id)
  }, [me, peer, loadMessages])

  const send = useCallback(async (text) => {
    const content = text.trim()
    if (!content || !me || !peer) return
    const optimistic = {
      id: `tmp_${Date.now()}`, sender_email: me, receiver_email: peer,
      content, created_at: new Date().toISOString(), _optimistic: true, status: 'sending'
    }
    setMessages(prev => [...prev, optimistic])
    try {
      const { data, error } = await insertMessage({ sender_email: me, receiver_email: peer, content })
      if (error) throw error
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...data, status: 'sent' } : m))
      if (data) lastServerIdsRef.current = { lastId: data.id, lastAt: data.created_at }
    } catch (error) {
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...m, status: 'error', errorMsg: 'Send failed' } : m))
    }
  }, [me, peer])

  const retry = useCallback(async (tempId) => {
    const msg = messages.find(m => m.id === tempId && m.status === 'error')
    if (!msg) return
    setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'sending' } : m))
    try {
      const { data, error } = await insertMessage({ sender_email: me, receiver_email: peer, content: msg.content })
      if (error) throw error
      setMessages(prev => prev.map(m => m.id === tempId ? { ...data, status: 'sent' } : m))
    } catch { setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'error' } : m)) }
  }, [messages, me, peer])

  return { messages, loading: initialLoading, refreshing, send, retry, messagesRef }
}
