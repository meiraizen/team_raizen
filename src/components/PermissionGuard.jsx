import React from 'react'
import { Navigate } from 'react-router-dom'
import { usePermissions } from '../hooks/usePermissions'

export default function PermissionGuard({ moduleKey, children, fallback }) {
  const { canView } = usePermissions()

  if (canView(moduleKey)) {
    return children
  }

  if (fallback === 'redirect') {
    return <Navigate to="/home" replace />
  }

  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <p className="text-lg text-muted-foreground">
        You do not have permission to access this module.
      </p>
    </div>
  )
}
