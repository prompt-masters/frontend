import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-slate-400">Page not found.</p>

      <Link to="/" className="mt-4 underline">
        Return home
      </Link>
    </section>
  )
}

export default NotFoundPage
