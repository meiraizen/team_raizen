import React, { useMemo, useState } from 'react'
import { useContacts } from '../useChat'

export default function ContactList({ selected, onSelect }) {
  const { contacts } = useContacts()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return contacts
    return contacts.filter(c => c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term))
  }, [contacts, q])

  return (
    <aside className="contacts">
      <div className="contacts__header">Contacts</div>
      <div className="contacts__search">
        <input placeholder="Search" value={q} onChange={(e)=>setQ(e.target.value)} />
      </div>
      <div className="contacts__list">
        {filtered.map((c) => {
          const active = selected === c.email
          const initials = (c.name?.[0] || '?').toUpperCase()
          return (
            <div key={c.email} className={`contactItem ${active ? 'active' : ''}`} onClick={()=>onSelect?.(c.email)}>
              <div className="contactItem__avatar">{initials}</div>
              <div className="contactItem__meta">
                <div className="contactItem__name">{c.name}</div>
                <div className="contactItem__email">{c.email}</div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 16, color: '#aeb4c1' }}>No contacts</div>
        )}
      </div>
    </aside>
  )
}
