import { memo } from 'react'

const ChatHeader = memo(({ selectedContact, loading, onBack, isMobile, isOnline }) => (
  <div className="chat-header">
    {isMobile && (
      <button className="mobile-back" onClick={onBack}>
        ←
      </button>
    )}
    {selectedContact ? (
      <>
        <div className="chat-avatar">
          {selectedContact.name[0].toUpperCase()}
        </div>
        <div className="chat-info">
          <h3>{selectedContact.name}</h3>
          <p className="chat-status">
            {loading ? 'Loading...' : (isOnline ? 'Online' : 'Offline')}
          </p>
        </div>
      </>
    ) : (
      <div className="chat-info">
        <h3>Select a conversation</h3>
        <p className="chat-status">Choose someone to start messaging</p>
      </div>
    )}
  </div>
))

export default ChatHeader