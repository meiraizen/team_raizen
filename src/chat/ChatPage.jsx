import { useCallback, useMemo, useState } from 'react'
import { useAuthStore, allowedAccounts } from '../store/auth'
import { useNavigate } from 'react-router-dom'

// Components
import Sidebar from './components/ChatSidebar'
import ContactList from './components/ContactList'
import ChatHeader from './components/ChatHeader'
import MessageList from './components/MessageList'
import MessageInput from './components/MessageInput'

// Hooks
import { useChat } from './hooks/useChat'
import { useResponsive } from './hooks/useResponsive'
import { usePresence } from './hooks/usePresence'

export default function ChatPage() {
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()
  const [peer, setPeer] = useState('')
  const [input, setInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  
  const { messages, loading, send, messagesRef, retry, refreshing } = useChat(peer)
  const { isMobile, showSidebar, setShowSidebar } = useResponsive(peer)
  const onlineUsers = usePresence()

  // Memoized values to prevent unnecessary recalculations
  const contacts = useMemo(() => 
    allowedAccounts.filter(c => c.email !== user?.email), 
    [user?.email]
  )

  const selectedContact = useMemo(() => 
    contacts.find(c => c.email === peer), 
    [contacts, peer]
  )

  const isSelectedOnline = selectedContact ? onlineUsers.includes(selectedContact.email) : false

  // Optimized handlers with useCallback
  const handleSend = useCallback(() => {
    if (input.trim()) {
      send(input.trim())
      setInput('')
    }
  }, [input, send])

  const selectContact = useCallback((email) => {
    setPeer(email)
    if (isMobile) setShowSidebar(false)
  }, [isMobile, setShowSidebar])

  const goBack = useCallback(() => {
    if (isMobile && peer) {
      setPeer('')
      setShowSidebar(true)
    } else {
      navigate('/home')
    }
  }, [isMobile, peer, setShowSidebar, navigate])

  // Get last message for a contact - memoized function
  const getLastMessage = useCallback((contactEmail) => {
    if (peer === contactEmail && messages.length > 0) {
      return messages[messages.length - 1].content
    }
    return ''
  }, [peer, messages])

  // Handle search functionality
  const handleSearch = useCallback((term) => {
    setSearchTerm(term)
  }, [])

  // Early return for better performance
  if (!user) {
    return <div className="error-state">Please log in to use chat</div>
  }

  return (
    <>
      <style>{`
        .chat-app {
          height: calc(100vh - 140px);
          display: flex;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Sidebar */
        .sidebar {
          width: 320px;
          background: #fafafa;
          border-right: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 16px 20px;
          background: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .back-button {
          background: none;
          border: 1px solid #ddd;
          color: #666;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }

        .back-button:hover {
          background: #eee;
        }

        .sidebar-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: #333;
        }

        .search-bar {
          padding: 12px 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .search-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input {
          width: 100%;
          padding: 8px 12px;
          padding-right: 32px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          outline: none;
        }

        .search-input:focus {
          border-color: #007bff;
        }

        .search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .search-clear:hover {
          background: #f0f0f0;
          color: #333;
        }

        .contacts-list {
          flex: 1;
          overflow-y: auto;
        }

        .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          color: #666;
        }

        .no-results-icon {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .no-results-text {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .no-results-subtext {
          font-size: 12px;
          opacity: 0.7;
        }

        .contact-item {
          padding: 12px 20px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .contact-item:hover {
          background: #f8f8f8;
        }

        .contact-active {
          background: #e3f2fd;
          border-right: 3px solid #007bff;
        }

        .contact-avatar {
          position: relative;
          width: 40px;            /* ensure fixed size */
          height: 40px;
          flex-shrink: 0;         /* prevent shrinking */
        }

        .avatar-circle {
          width: 100%;            /* fill container */
          height: 100%;
          border-radius: 50% !important; /* enforce circle */
          background: #007bff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 500;
          font-size: 16px;
          overflow: hidden;       /* clip anything overflow */
          border: 1px solid rgba(0,0,0,0.05); /* subtle edge for visibility */
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          position: absolute;
            bottom: 0;
            right: 0;
          border: 2px solid #fff;
          background: #bbb; /* offline */
        }
        .status-dot.online {
          background: #34c759; /* green online */
        }

        .contact-info {
          flex: 1;
          min-width: 0;
        }

        .contact-name {
          font-weight: 500;
          font-size: 14px;
          color: #333;
          margin-bottom: 2px;
        }

        .contact-preview {
          font-size: 12px;
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Chat Area */
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .chat-header {
          padding: 16px 20px;
          background: #f9f9f9;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mobile-back {
          background: none;
          border: none;
          color: #007bff;
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
          display: none;
        }

        .chat-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #007bff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 500;
          font-size: 14px;
        }

        .chat-info h3 {
          margin: 0 0 2px 0;
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .chat-status {
          font-size: 12px;
          color: #666;
          margin: 0;
        }

        /* Messages */
        .messages-container {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #fff;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #666;
          text-align: center;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .empty-text {
          font-size: 14px;
          margin-bottom: 4px;
        }

        .empty-subtext {
          font-size: 12px;
          opacity: 0.7;
        }

        .msg-wrapper {
          display: flex;
          margin-bottom: 4px;
        }

        .msg-own {
          justify-content: flex-end;
        }

        .msg-other {
          justify-content: flex-start;
        }

        .msg-bubble {
          max-width: 70%;
          padding: 8px 12px;
          border-radius: 16px;
          word-wrap: break-word;
        }

        .msg-bubble-own {
          background: #007bff;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .msg-bubble-other {
          background: #f5f5f5;
          color: #333;
          border-bottom-left-radius: 4px;
        }

        .msg-text {
          font-size: 14px;
          line-height: 1.4;
          margin-bottom: 2px;
        }

        .msg-time {
          font-size: 10px;
          opacity: 0.7;
          text-align: right;
        }
        /* Added message status styles */
        .msg-meta {
          display: flex;
          gap: 4px;
          align-items: center;
          justify-content: flex-end;
          font-size: 10px;
          opacity: 0.7;
          margin-top: 2px;
        }
        .msg-status {
          font-size: 10px;
        }
        .msg-status.sending { opacity: 0.5; }
        .msg-status.sent { color: #e0f2ff; }
        .msg-status.received { color: #e0f2ff; }
        .msg-status.error { color: #dc3545; cursor: pointer; font-weight: 600; }
        .msg-status.error:hover { text-decoration: underline; }

        /* Links inside messages */
        .msg-link,
        .msg-link:visited {
          color: black;
        }
        .msg-link:hover {
          text-decoration: underline;
          opacity: 0.9;
        }
        .msg-link:focus {
          outline: 2px solid rgba(0, 0, 0, 0.4);
          outline-offset: 2px;
        }

        /* Input Area */
        .input-container {
          padding: 16px 20px;
          background: #f9f9f9;
          border-top: 1px solid #e0e0e0;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        .message-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 14px;
          outline: none;
          resize: none;
          min-height: 20px;
          max-height: 80px;
          font-family: inherit;
        }

        .message-input:focus {
          border-color: #007bff;
        }

        .send-button {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 50%;
          background: #007bff;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .send-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .send-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .loading-state {
          text-align: center;
          color: #666;
          padding: 20px;
          font-size: 14px;
        }

        .error-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #dc3545;
          font-size: 14px;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            position: absolute;
            z-index: 10;
            height: 100%;
            transition: transform 0.2s ease;
          }
          .sidebar.closed {
            transform: translateX(-100%);
            pointer-events: none;
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .chat-main {
            width: 100%;
          }
          .mobile-back {
            display: block;
          }
          .messages-container {
            padding: 12px;
          }
          .input-container {
            padding: 12px 16px;
          }
        }
      `}</style>

      <div className="chat-app">
        <Sidebar onBack={goBack} showSidebar={showSidebar} onSearch={handleSearch}>
          <ContactList
            peer={peer}
            onSelectContact={selectContact}
            getLastMessage={getLastMessage}
            searchTerm={searchTerm}
            onlineUsers={onlineUsers}
          />
        </Sidebar>

        <div className="chat-main">
          <ChatHeader
            selectedContact={selectedContact}
            loading={loading}
            onBack={goBack}
            isMobile={isMobile}
            isOnline={isSelectedOnline}
          />

          <div className="messages-container" ref={messagesRef}>
            <MessageList
              peer={peer}
              loading={loading}
              messages={messages}
              user={user}
              messagesRef={messagesRef}
              selectedContactName={selectedContact?.name}
              retry={retry}
              refreshing={refreshing} // added (silent)
            />
          </div>

          <MessageInput
            input={input}
            setInput={setInput}
            onSend={handleSend}
            disabled={!peer}
            placeholder={peer ? 'Type a message...' : 'Select a contact to start messaging'}
          />
        </div>
      </div>
    </>
  )
}