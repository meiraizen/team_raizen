import { memo, useMemo } from 'react'
import { useAuthStore, allowedAccounts } from '../../store/auth'

const ContactItem = memo(({ contact, isActive, onClick, lastMessage, isOnline }) => (
  <div 
    className={`contact-item ${isActive ? 'contact-active' : ''}`}
    onClick={onClick}
  >
    <div className="contact-avatar">
      <div className="avatar-circle">
        {contact.name[0].toUpperCase()}
      </div>
      <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
    </div>
    <div className="contact-info">
      <div className="contact-name">{contact.name}</div>
      <div className="contact-preview">
        {lastMessage || 'Start a conversation'}
      </div>
    </div>
  </div>
))

const ContactList = memo(({ peer, onSelectContact, getLastMessage, searchTerm = '', onlineUsers = [] }) => {
  const user = useAuthStore(s => s.user)
  
  const contacts = useMemo(
    () => allowedAccounts.filter(c => c.email !== user?.email),
    [user?.email]
  )

  // Search across all contacts (not only online)
  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts
    const term = searchTerm.toLowerCase()
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(term) ||
      contact.email.toLowerCase().includes(term)
    )
  }, [contacts, searchTerm])

  if (filteredContacts.length === 0) {
    return (
      <div className="contacts-list">
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <div className="no-results-text">No contacts found</div>
          <div className="no-results-subtext">Try a different search term</div>
        </div>
      </div>
    )
  }

  return (
    <div className="contacts-list">
      {filteredContacts.map(contact => {
        const isOnline = onlineUsers.includes(contact.email)
        return (
          <ContactItem
            key={contact.email}
            contact={contact}
            isActive={peer === contact.email}
            onClick={() => onSelectContact(contact.email)}
            lastMessage={getLastMessage(contact.email)}
            isOnline={isOnline}
          />
        )
      })}
    </div>
  )
})


export default ContactList
