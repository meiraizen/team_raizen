import { memo, useMemo } from 'react'

const MessageBubble = memo(({ message, isOwn, onRetry }) => {
  const time = useMemo(() => 
    new Date(message.created_at).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }), [message.created_at]
  )

  const renderStatus = () => {
    if (!isOwn) return null
    switch (message.status) {
      case 'sending': return <span className="msg-status sending">…</span>
      case 'sent': return <span className="msg-status sent">✓</span>
      case 'received': return <span className="msg-status received">✓✓</span>
      case 'error': return <span className="msg-status error" onClick={() => onRetry?.(message.id)}>!</span>
      default: return null
    }
  }

  return (
    <div className={`msg-wrapper ${isOwn ? 'msg-own' : 'msg-other'}`}>
      <div className={`msg-bubble ${isOwn ? 'msg-bubble-own' : 'msg-bubble-other'}`}>
        <div className="msg-text">{message.content}</div>
        <div className="msg-meta">
          <span className="msg-time">{time}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  )
})

const EmptyState = memo(({ type, selectedContactName }) => {
  if (type === 'select') {
    return (
      <div className="empty-state">
        <div className="empty-icon">💬</div>
        <div className="empty-text">Select a contact to start messaging</div>
        <div className="empty-subtext">Choose from your contacts on the left</div>
      </div>
    )
  }
  
  if (type === 'loading') {
    return <div className="loading-state">Loading messages...</div>
  }
  
  return (
    <div className="empty-state">
      <div className="empty-icon">👋</div>
      <div className="empty-text">No messages yet</div>
      <div className="empty-subtext">
        Start the conversation{selectedContactName ? ` with ${selectedContactName}` : ''}
      </div>
    </div>
  )
})

const MessageList = memo(({ peer, loading, messages, user, selectedContactName, retry, refreshing }) => {
  if (!peer) return <EmptyState type="select" />
  // Only show loading placeholder if we have no messages yet
  if (loading && messages.length === 0) return <EmptyState type="loading" />
  if (!loading && messages.length === 0) return <EmptyState type="empty" selectedContactName={selectedContactName} />
  // Optional subtle indicator (kept minimal, comment out if not needed)
  // {refreshing && <div style={{textAlign:'center', fontSize:10, opacity:.5}}>Syncing…</div>}
  return (
    <>
      {messages.map(message => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.sender_email === user?.email}
          onRetry={retry}
        />
      ))}
    </>
  )
})

export default MessageList
