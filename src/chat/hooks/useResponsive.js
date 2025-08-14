import { useCallback, useEffect, useState } from 'react'

export const useResponsive = (peer) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [showSidebar, setShowSidebar] = useState(!isMobile)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      setShowSidebar(!mobile || !peer)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [peer])

  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev)
  }, [])

  return { isMobile, showSidebar, setShowSidebar, toggleSidebar }
}