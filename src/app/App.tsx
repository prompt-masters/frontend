import ErrorBoundary from '@/components/common/ErrorBoundary'
import { AuthProvider } from '@/features/auth/AuthProvider'
import AppRouter from '@/routes/AppRouter'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
