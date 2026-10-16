import HostGameForm from '@/features/game/HostGameForm'
import JoinGameForm from '@/features/lobby/JoinGameForm'

function HomePage() {
  return (
    <section>
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
          Prompt Engineering Competition
        </p>

        <h1 className="mt-2 text-3xl font-bold sm:text-5xl">
          Welcome to PromptArena
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          Host a new competition or join an existing room.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <HostGameForm />
        <JoinGameForm />
      </div>
    </section>
  )
}

export default HomePage
