import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { ApiError } from '@/api/client'
import { useAuth } from '@/features/auth/useAuth'

type LocationState = {
  from?: {
    pathname?: string
  }
  message?: string
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const data = error.data as { error?: string } | null

    if (data?.error) {
      return data.error
    }
  }

  return 'Unable to sign in. Please try again.'
}

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as LocationState | null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Email and password are required.')
      return
    }

    setIsSubmitting(true)

    try {
      await login({
        email: email.trim(),
        password,
      })

      const destination = state?.from?.pathname ?? '/profile'
      navigate(destination, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg sm:p-8">
        <h1 className="text-2xl font-bold">Sign in</h1>

        <p className="mt-2 text-sm text-slate-400">
          Sign in to continue to PromptArena.
        </p>

        {state?.message && (
          <div className="mt-4 rounded-md border border-emerald-800 bg-emerald-950 p-3 text-sm text-emerald-200">
            {state.message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-md border border-red-800 bg-red-950 p-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-white px-4 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Need an account?{' '}
          <Link to="/register" className="font-medium text-white underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
