import React, { useMemo, useState } from 'react'
import './Chat.css'
import ContactList from './components/ContactList'
import MessageList from './components/MessageList'
import MessageInput from './components/MessageInput'
import { useAuthStore } from '../store/auth'
import { useChat } from './useChat'

export default function ChatView() {
  const me = useAuthStore((s)=>s.user)
  const [peer, setPeer] = useState('')
  const { messages, loading, error, send } = useChat(peer)

  const title = useMemo(() => {
    if (!peer) return 'Select a contact'
    return peer
  }, [peer])

  return (
    <section className="chatApp">
      <div className="chatApp__container">
        <ContactList selected={peer} onSelect={setPeer} />
        <div className="chat chatApp__panel" style={{ flex: 1 }}>
          <div className="chatApp__convTitle">{title}</div>
          {loading && (
            <div className="chatApp__loaderWrapper">
              <div className="chatApp__loaderText">Loading...</div>
              <div className="chatApp__loader" />
            </div>
          )}
          {!loading && (
            <>
              <MessageList me={me?.email} items={messages} />
              <MessageInput onSend={send} disabled={!peer || !me?.email} autoFocus={!!peer} />
            </>
          )}
          {error && <div style={{ color: '#ff8a80', padding: '8px 0' }}>{error}</div>}
        </div>
      </div>
    </section>
  )
}
