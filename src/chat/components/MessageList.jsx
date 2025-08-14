import { memo, useMemo } from 'react'

const MessageBubble = memo(({ message, isOwn }) => {
  const time = useMemo(() => 
    new Date(message.created_at).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }), [message.created_at]
  )

  return (
    <div className={`msg-wrapper ${isOwn ? 'msg-own' : 'msg-other'}`}>
      <div className={`msg-bubble ${isOwn ? 'msg-bubble-own' : 'msg-bubble-other'}`}>
        <div className="msg-text">{message.content}</div>
        <div className="msg-time">{time}</div>
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

const MessageList = memo(({ peer, loading, messages, user, messagesRef, selectedContactName }) => {
  if (!peer) {
    return <EmptyState type="select" />
  }
  
  if (loading) {
    return <EmptyState type="loading" />
  }
  
  if (messages.length === 0) {
    return <EmptyState type="empty" selectedContactName={selectedContactName} />
  }
  
  return (
    <>
      {messages.map(message => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.sender_email === user?.email}
        />
      ))}
    </>
  )
})

export default MessageList
