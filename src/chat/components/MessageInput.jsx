import { memo, useCallback } from 'react'

const MessageInput = memo(({ 
  input, 
  setInput, 
  onSend, 
  disabled, 
  placeholder = 'Type a message...' 
}) => {
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }, [onSend])

  const handleSend = useCallback(() => {
    if (input.trim() && !disabled) {
      onSend()
    }
  }, [input, disabled, onSend])

  return (
    <div className="input-container">
      <div className="input-wrapper">
        <textarea
          className="message-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
        />
        <button
          className="send-button"
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          title="Send message"
        >
          ➤
        </button>
      </div>
    </div>
  )
})

export default MessageInput
