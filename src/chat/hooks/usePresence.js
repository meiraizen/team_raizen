import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuthStore } from '../../store/auth'

export function usePresence() {
  const user = useAuthStore(s => s.user)
  const me = user?.email
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    if (!me) return
    const channel = supabase.channel('presence:chat', {
      config: { presence: { key: me } }
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const emails = Object.keys(state)
        setOnlineUsers(emails.filter(e => e !== me))
      })

    channel.subscribe(status => {
      if (status === 'SUBSCRIBED') {
        channel.track({ online_at: new Date().toISOString() })
      }
    })

    const retrack = () => {
      channel.track({ online_at: new Date().toISOString() })
    }

    window.addEventListener('focus', retrack)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') retrack()
    })

    return () => {
      try { channel.untrack() } catch {}
      try { supabase.removeChannel(channel) } catch {}
      window.removeEventListener('focus', retrack)
    }
  }, [me])

  return onlineUsers
}
