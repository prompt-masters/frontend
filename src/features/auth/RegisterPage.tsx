import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ApiError } from '@/api/client'
import { register } from '@/features/auth/api'

type FieldErrors = Record<string, string>

type BackendError = {
  error?: string
  fields?: FieldErrors
}

function RegisterPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setFieldErrors({})

    const errors: FieldErrors = {}

    if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.'
    }

    if (!email.trim()) {
      errors.email = 'Email is required.'
    }

    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
      })

      navigate('/login', {
        replace: true,
        state: {
          message:
            'Registration successful. Please verify your email before signing in.',
        },
      })
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as BackendError | null

        if (data?.fields) {
          setFieldErrors(data.fields)
        }

        if (data?.error) {
          setError(data.error)
        } else {
          setError('Unable to register. Please try again.')
        }
      } else {
        setError('Unable to register. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg sm:p-8">
        <h1 className="text-2xl font-bold">Create account</h1>

        <p className="mt-2 text-sm text-slate-400">
          Register to start competing in PromptArena.
        </p>

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
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>

            <input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-slate-400"
            />

            {fieldErrors.username && (
              <p className="mt-1 text-sm text-red-300">
                {fieldErrors.username}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-slate-400"
            />

            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-300">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-slate-400"
            />

            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-300">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-white px-4 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-white underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
