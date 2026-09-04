function HomePage() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-2xl text-center">
        <p className="mb-3 text-sm font-semibold tracking-wider text-slate-400 uppercase">
          Prompt Engineering Competition
        </p>

        <h1 className="text-3xl font-bold sm:text-5xl">
          Welcome to PromptArena
        </h1>

        <p className="mt-4 text-base text-slate-400 sm:text-lg">
          Compete, improve your prompts, and climb the leaderboard.
        </p>
      </div>
    </section>
  )
}

export default HomePage
