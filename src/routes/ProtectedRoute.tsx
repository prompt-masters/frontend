import { Navigate, Outlet, useLocation } from 'react-router-dom'

import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAuth } from '@/features/auth/useAuth'

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingSpinner label="Restoring session..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
