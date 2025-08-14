import { memo, useState, useCallback } from 'react'

const Sidebar = memo(({ 
  onBack, 
  showSidebar, 
  children,
  onSearch 
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch?.(value)
  }, [onSearch])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    onSearch?.('')
  }, [onSearch])

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1 className="sidebar-title">Messages</h1>
      </div>
      

      {/* search Option */}
      {/* <div className="search-bar">
        <div className="search-container">
          <input 
            className="search-input" 
            placeholder="Search Sensei's" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button 
              className="search-clear" 
              onClick={clearSearch}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div> */}

      {children}
    </div>
  )
})

export default Sidebar