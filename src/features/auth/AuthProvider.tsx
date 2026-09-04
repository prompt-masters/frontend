import { type ReactNode, useEffect, useState } from 'react'

import { getCurrentUser, login as loginRequest } from '@/features/auth/api'
import { AuthContext } from '@/features/auth/context'
import type { LoginInput, User } from '@/features/auth/types'
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/stores/authToken'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      const token = getAccessToken()

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await getCurrentUser()
        setUser(response.data)
      } catch {
        clearAccessToken()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    void restoreSession()
  }, [])

  useEffect(() => {
    function handleUnauthorized() {
      clearAccessToken()
      setUser(null)
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  async function login(input: LoginInput) {
    const response = await loginRequest(input)

    setAccessToken(response.data.token)
    setUser(response.data.user)
  }

  function logout() {
    clearAccessToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
