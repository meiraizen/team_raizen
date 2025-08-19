import { memo, useMemo } from 'react'

const MessageBubble = memo(({ message, isOwn, onRetry }) => {
  const timeLabel = useMemo(() => {
    const dt = new Date(message.created_at)
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMsg = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
    const diffDays = Math.floor((startOfToday - startOfMsg) / 86400000)
    const timePart = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 0) return `Today ${timePart}`
    if (diffDays === 1) return `Yesterday ${timePart}`
    return `${dt.toLocaleDateString()} ${timePart}`
  }, [message.created_at])

  const linkifiedContent = useMemo(() => {
    const text = message.content || ''
    const parts = []
    const urlRegex = /((https?:\/\/|www\.)[^\s<]+)(?![^<]*>)/gi
    let lastIndex = 0, match
    while ((match = urlRegex.exec(text)) !== null) {
      const start = match.index
      if (start > lastIndex) parts.push(text.slice(lastIndex, start))
      let rawUrl = match[0]
      // strip simple trailing punctuation
      const trailingPuncMatch = rawUrl.match(/[),.!?]+$/)
      let trailing = ''
      if (trailingPuncMatch) {
        trailing = trailingPuncMatch[0]
        rawUrl = rawUrl.slice(0, -trailing.length)
      }
      const href = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`
      parts.push(
        <a 
          key={`lnk-${parts.length}`} 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="msg-link"
        >
          {rawUrl}
        </a>
      )
      if (trailing) parts.push(trailing)
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex))
    // handle line breaks
    const withBreaks = []
    parts.forEach((p, idx) => {
      if (typeof p === 'string') {
        const lines = p.split('\n')
        lines.forEach((line, i) => {
          if (line) withBreaks.push(line)
          if (i < lines.length - 1) withBreaks.push(<br key={`br-${idx}-${i}`} />)
        })
      } else {
        withBreaks.push(p)
      }
    })
    return withBreaks
  }, [message.content])

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
        <div className="msg-text">{linkifiedContent}</div>
        <div className="msg-meta">
          <span className="msg-time">{timeLabel}</span>
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
