import { Link, useParams } from 'react-router-dom'

function WaitingRoomPage() {
  const { roomCode } = useParams()

  return (
    <section className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center sm:p-8">
        <p className="text-sm font-medium tracking-wider text-slate-400 uppercase">
          Waiting Room
        </p>

        <h1 className="mt-2 text-2xl font-bold">Game Lobby</h1>

        <p className="mt-6 text-sm text-slate-400">Room code</p>

        <p className="mt-2 text-4xl font-bold tracking-[0.25em]">
          {roomCode ?? '------'}
        </p>

        <p className="mt-6 text-slate-400">
          Waiting for players and game data from the server.
        </p>

        <Link
          to="/"
          className="mt-8 inline-block rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Back to home
        </Link>
      </div>
    </section>
  )
}

export default WaitingRoomPage
