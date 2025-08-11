import React, { useEffect, useRef, useState } from 'react'

export default function MessageInput({ onSend, disabled, autoFocus }) {
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [autoFocus])

  const submit = async (e) => {
    e?.preventDefault?.()
    const v = value.trim()
    if (!v || sending || disabled) return
    setSending(true)
    const { error } = await onSend?.(v)
    if (!error) setValue('')
    setSending(false)
  }

  const placeholder = disabled ? 'Select a contact to start chatting' : 'Type a message'

  return (
    <form onSubmit={submit} className="chatApp__convSendMessage clearfix">
      <input
        ref={inputRef}
        className="chatApp__convInput"
        placeholder={placeholder}
        value={value}
        onChange={(e)=>setValue(e.target.value)}
        disabled={sending}
      />
      <button type="submit" className={`chatApp__convButton ${sending ? 'chatApp__convButton--loading' : ''}`} disabled={sending || disabled} aria-label="Send">
        {!sending && (
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
        )}
      </button>
    </form>
  )
}
