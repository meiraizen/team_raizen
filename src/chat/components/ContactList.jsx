import { memo, useMemo } from 'react'
import { useAuthStore, allowedAccounts } from '../../store/auth'

const ContactItem = memo(({ contact, isActive, onClick, lastMessage }) => (
  <div 
    className={`contact-item ${isActive ? 'contact-active' : ''}`}
    onClick={onClick}
  >
    <div className="contact-avatar">
      <div className="avatar-circle">
        {contact.name[0].toUpperCase()}
      </div>
      <div className="online-indicator"></div>
    </div>
    <div className="contact-info">
      <div className="contact-name">{contact.name}</div>
      <div className="contact-preview">
        {lastMessage || 'Start a conversation'}
      </div>
    </div>
  </div>
))

const ContactList = memo(({ peer, onSelectContact, getLastMessage, searchTerm = '' }) => {
  const user = useAuthStore(s => s.user)
  
  const contacts = useMemo(() => 
    allowedAccounts.filter(c => c.email !== user?.email), 
    [user?.email]
  )

  // Filter contacts based on search term
  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts
    
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [contacts, searchTerm])

  if (filteredContacts.length === 0 && searchTerm.trim()) {
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
      {filteredContacts.map(contact => (
        <ContactItem
          key={contact.email}
          contact={contact}
          isActive={peer === contact.email}
          onClick={() => onSelectContact(contact.email)}
          lastMessage={getLastMessage(contact.email)}
        />
      ))}
    </div>
  )
})

export default ContactList
