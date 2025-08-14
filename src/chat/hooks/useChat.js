import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../store/auth'
import { fetchConversation, insertMessage, subscribeConversation } from '../supabaseClient'

export const useChat = (peer) => {
  const user = useAuthStore(s => s.user)
  const me = user?.email
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const unsubRef = useRef(null)
  const messagesRef = useRef(null)

  const loadMessages = useCallback(async () => {
    if (!me || !peer) { 
      setMessages([])
      return 
    }
    setLoading(true)
    try {
      const { data } = await fetchConversation({ a: me, b: peer, limit: 200 })
      const filtered = (data || [])
        .filter(r => (r.sender_email === me && r.receiver_email === peer) || 
                    (r.sender_email === peer && r.receiver_email === me))
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      setMessages(filtered)
    } finally {
      setLoading(false)
    }
  }, [me, peer])

  // Optimized auto-scroll - only trigger on message count change
  useEffect(() => {
    const container = messagesRef.current
    if (container && messages.length > 0) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages.length])

  useEffect(() => { loadMessages() }, [loadMessages])

  useEffect(() => {
    if (!me || !peer) return
    
    unsubRef.current?.()
    unsubRef.current = subscribeConversation({ 
      a: me, 
      b: peer, 
      onInsert: (row) => {
        if ((row.sender_email === me && row.receiver_email === peer) || 
            (row.sender_email === peer && row.receiver_email === me)) {
          setMessages(prev => {
            if (prev.some(m => m.id === row.id)) return prev
            return [...prev, row].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          })
        }
      }
    })
    
    return () => unsubRef.current?.()
  }, [me, peer])

  const send = useCallback(async (text) => {
    const content = text.trim()
    if (!content || !me || !peer) return
    
    const optimistic = {
      id: `tmp_${Date.now()}`,
      sender_email: me,
      receiver_email: peer,
      content,
      created_at: new Date().toISOString(),
      _optimistic: true
    }
    
    setMessages(prev => [...prev, optimistic])
    
    try {
      const { data, error } = await insertMessage({ 
        sender_email: me, 
        receiver_email: peer, 
        content 
      })
      
      if (error) throw error
      
      setMessages(prev => prev.map(m => m.id === optimistic.id ? data : m))
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      console.error('Send failed:', error)
    }
  }, [me, peer])

  return { messages, loading, send, messagesRef }
}