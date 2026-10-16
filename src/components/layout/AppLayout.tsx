import { NavLink, Outlet } from 'react-router-dom'

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <NavLink to="/" className="text-xl font-bold">
            PromptArena
          </NavLink>

          <nav className="flex gap-4 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? 'font-semibold text-white'
                  : 'text-slate-400 hover:text-white'
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive
                  ? 'font-semibold text-white'
                  : 'text-slate-400 hover:text-white'
              }
            >
              Profile
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 px-4 py-4 text-center text-sm text-slate-500">
        PromptArena
      </footer>
    </div>
  )
}

export default AppLayout
