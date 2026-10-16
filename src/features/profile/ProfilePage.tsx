import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/useAuth'

function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  if (!user) {
    return null
  }

  return (
    <section className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="mt-1 text-slate-400">@{user.username}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800"
          >
            Logout
          </button>
        </div>

        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Email</dt>
            <dd className="mt-1 break-all">{user.email}</dd>
          </div>

          <div>
            <dt className="text-sm text-slate-500">ELO rating</dt>
            <dd className="mt-1">{user.elo_rating}</dd>
          </div>

          <div>
            <dt className="text-sm text-slate-500">Member since</dt>
            <dd className="mt-1">
              {new Date(user.created_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

export default ProfilePage
