import { type FormEvent, useState } from 'react'

import type { ActiveRound } from './types'
import useServerDeadlineTimer from './useServerDeadlineTimer'

type RoundGameplayPanelProps = {
  round: ActiveRound
  output: string
  isStreaming: boolean
  isTesting?: boolean
  isSubmitting?: boolean
  onTest: (prompt: string) => void
  onSubmit: (prompt: string) => void
  onExpire?: () => void
  onHint?: () => void
  onReview?: () => void
}

function RoundGameplayPanel({
  round,
  output,
  isStreaming,
  isTesting = false,
  isSubmitting = false,
  onTest,
  onSubmit,
  onExpire,
  onHint,
  onReview,
}: RoundGameplayPanelProps) {
  const [prompt, setPrompt] = useState(round.prompt)

  const timer = useServerDeadlineTimer({
    deadline: round.deadline,
    onExpire,
  })

  const editorLocked =
    round.status !== 'active' || isSubmitting || timer.isExpired

  function handleTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (editorLocked || isTesting || prompt.trim().length === 0) {
      return
    }

    onTest(prompt)
  }

  function handleSubmit() {
    if (editorLocked || isSubmitting || prompt.trim().length === 0) {
      return
    }

    onSubmit(prompt)
  }

  if (round.status === 'submitted') {
    return (
      <section className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
          <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
            Round {round.roundNumber}
          </p>

          <h1 className="mt-3 text-2xl font-bold">Prompt submitted</h1>

          <p className="mt-3 text-slate-400">
            Waiting for the other players to finish this round.
          </p>

          <div className="mt-6 text-sm text-slate-500">
            Tests: {round.testCount} · Points: {round.points}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <header className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
              Round {round.roundNumber}
            </p>

            <h1 className="mt-1 text-2xl font-bold">{round.challenge}</h1>

            {round.constraints.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-300">
                  Constraints
                </p>

                <ul className="mt-2 space-y-1 text-sm text-slate-400">
                  {round.constraints.map((constraint) => (
                    <li key={constraint.id}>• {constraint.label}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div
            role="timer"
            aria-label="Round timer"
            className={
              timer.isWarning
                ? 'shrink-0 rounded-lg border border-red-700 bg-red-950 px-4 py-3 text-center text-red-200'
                : 'shrink-0 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-center'
            }
          >
            <p className="text-xs tracking-wider text-slate-400 uppercase">
              Timer
            </p>

            <p className="mt-1 font-mono text-2xl font-bold">
              {timer.formattedTime}
            </p>

            {timer.isWarning && (
              <p className="mt-1 text-xs font-semibold">Time running out!</p>
            )}
          </div>
        </header>

        <form onSubmit={handleTest} className="grid lg:grid-cols-2">
          <div className="border-b border-slate-800 p-5 lg:border-r lg:border-b-0">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Prompt Editor</h2>

              {editorLocked && (
                <span className="text-xs text-slate-500">Locked</span>
              )}
            </div>

            <textarea
              aria-label="Prompt editor"
              value={prompt}
              disabled={editorLocked}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Write your prompt here..."
              className="min-h-72 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm outline-none focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={editorLocked || isTesting || prompt.trim().length === 0}
              className="mt-3 w-full rounded-md border border-slate-700 px-4 py-2 font-semibold hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isTesting ? 'Testing...' : 'Test Prompt'}
            </button>
          </div>

          <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">AI Output</h2>

              {isStreaming && (
                <span role="status" className="text-xs text-slate-400">
                  streaming...
                </span>
              )}
            </div>

            <div
              aria-label="AI output"
              className="min-h-72 rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm whitespace-pre-wrap text-slate-300"
            >
              {output || (
                <span className="text-slate-600">
                  Test your prompt to see the AI response.
                </span>
              )}
            </div>
          </div>
        </form>

        <footer className="border-t border-slate-800 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-6 text-sm">
              <span>
                Tests: <strong className="text-white">{round.testCount}</strong>
              </span>

              <span>
                Points: <strong className="text-white">{round.points}</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onHint}
                disabled={!onHint || editorLocked}
                className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hint
              </button>

              <button
                type="button"
                onClick={onReview}
                disabled={!onReview || editorLocked}
                className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Review
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  editorLocked || isSubmitting || prompt.trim().length === 0
                }
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Final'}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </section>
  )
}

export default RoundGameplayPanel
