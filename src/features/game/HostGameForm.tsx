import { type FormEvent, useState } from 'react'

import type { Difficulty, GameConfig } from '@/features/game/types'

type HostGameFormProps = {
  onStart?: (config: GameConfig) => Promise<void>
}

function HostGameForm({ onStart }: HostGameFormProps) {
  const [rounds, setRounds] = useState(5)
  const [timePerRound, setTimePerRound] = useState(60)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [category, setCategory] = useState('general')
  const [aiModel, setAiModel] = useState('default')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setError('')

    if (!onStart) {
      setError('Game creation will be available when PA-31 API is ready.')
      return
    }

    const config: GameConfig = {
      rounds,
      timePerRound,
      difficulty,
      category,
      aiModel,
    }

    setIsSubmitting(true)

    try {
      await onStart(config)
    } catch {
      setError('Unable to create the game. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-6"
    >
      <div>
        <h2 className="text-xl font-bold">Host Game</h2>
        <p className="mt-1 text-sm text-slate-400">
          Configure a new PromptArena lobby.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-amber-800 bg-amber-950 p-3 text-sm text-amber-200"
        >
          {error}
        </p>
      )}

      <div>
        <label htmlFor="rounds" className="text-sm font-medium">
          Rounds
        </label>
        <select
          id="rounds"
          value={rounds}
          onChange={(event) => setRounds(Number(event.target.value))}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
        >
          {[3, 5, 7, 10].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="timePerRound" className="text-sm font-medium">
          Time per round
        </label>
        <select
          id="timePerRound"
          value={timePerRound}
          onChange={(event) => setTimePerRound(Number(event.target.value))}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
        >
          {[30, 60, 90, 120].map((value) => (
            <option key={value} value={value}>
              {value} seconds
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="difficulty" className="text-sm font-medium">
          Difficulty
        </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value as Difficulty)}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div>
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
        >
          <option value="general">General</option>
          <option value="creative">Creative</option>
          <option value="coding">Coding</option>
          <option value="business">Business</option>
        </select>
      </div>

      <div>
        <label htmlFor="aiModel" className="text-sm font-medium">
          AI Model
        </label>
        <select
          id="aiModel"
          value={aiModel}
          onChange={(event) => setAiModel(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
        >
          <option value="default">Default</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-white px-4 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Creating lobby...' : 'Start Lobby'}
      </button>
    </form>
  )
}

export default HostGameForm
