import React, { useEffect, useMemo, useRef } from 'react'

export default function MessageList({ me, items }) {
  const ref = useRef(null)

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }, [items])

  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [sorted])

  return (
    <div ref={ref} className="chatApp__convTimeline">
      {sorted.map((m) => {
        const left = m.sender_email !== me
        const cls = left ? 'chatApp__convMessageItem--left' : 'chatApp__convMessageItem--right'
        return (
          <div key={m.id} className={`chatApp__convMessageItem ${cls} clearfix`}>
            <img className="chatApp__convMessageAvatar" alt="avatar" src={`https://api.dicebear.com/9.x/initials/svg?seed=${left ? m.sender_email : me}`} />
            <div className="chatApp__convMessageValue">{m.content}</div>
          </div>
        )
      })}
      {sorted.length === 0 && (<div style={{ color: '#888', textAlign: 'center', padding: 12 }}>No messages yet</div>)}
    </div>
  )
}
