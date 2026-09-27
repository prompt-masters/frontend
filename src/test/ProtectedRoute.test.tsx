import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import ProtectedRoute from '@/routes/ProtectedRoute'

vi.mock('@/features/auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '@/features/auth/useAuth'

const mockedUseAuth = vi.mocked(useAuth)

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<div>Profile page</div>} />
          </Route>

          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders protected content for authenticated users', () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        username: 'khanh',
        email: 'khanh@example.com',
        avatar_url: null,
        elo_rating: 1200,
        created_at: '2026-09-03T00:00:00Z',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<div>Profile page</div>} />
          </Route>

          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Profile page')).toBeInTheDocument()
  })
})
