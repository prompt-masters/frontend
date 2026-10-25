import {
  HELPER_LABELS,
  HELPER_TYPES,
  type HelperType,
} from '@/features/helpers/types'
import useHelpers from '@/features/helpers/useHelpers'

type HelperPanelProps = {
  roundId: string
  // The player's current draft, sent as context for the helper.
  prompt: string
  roundActive: boolean
  testId?: string
}

function HelperPanel({
  roundId,
  prompt,
  roundActive,
  testId,
}: HelperPanelProps) {
  const { overview, balance, pending, result, error, buy } = useHelpers(roundId)
  const hasDraft = prompt.trim().length > 0

  function disabledReason(type: HelperType): string | null {
    const cost = overview?.prices[type]

    if (!roundActive) return 'Helpers are available while the round is active.'
    if (balance === null || cost === undefined)
      return 'Loading helper points...'
    if (pending) return 'Waiting for the AI to answer.'
    if (balance < cost) return 'Not enough helper points.'
    if (type === 'suggestion' && !hasDraft) return 'Write a draft first.'
    if (type === 'review' && !hasDraft && !testId)
      return 'Write a draft or run a test first.'

    return null
  }

  return (
    <section aria-label="AI helpers">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">AI Helpers</h2>

        <p className="text-sm text-slate-400">
          Helper points:{' '}
          <strong aria-label="Helper balance" className="text-white">
            {balance ?? '—'}
          </strong>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {HELPER_TYPES.map((type) => {
          const cost = overview?.prices[type]
          const reason = disabledReason(type)

          return (
            <button
              key={type}
              type="button"
              disabled={reason !== null}
              title={reason ?? undefined}
              aria-busy={pending === type}
              onClick={() => buy(type, { prompt, testId })}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending === type ? 'Thinking...' : HELPER_LABELS[type]}
              {cost !== undefined && (
                <span className="ml-2 text-slate-400">{cost} pts</span>
              )}
            </button>
          )
        })}
      </div>

      {!roundActive && (
        <p className="mt-2 text-xs text-slate-500">
          Helpers are available while the round is active.
        </p>
      )}

      {pending && (
        <p role="status" className="mt-3 text-sm text-slate-400">
          Asking the AI for a {HELPER_LABELS[pending].toLowerCase()}...
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-md border border-red-800 bg-red-950 p-3 text-sm text-red-200"
        >
          <p>{error.message}</p>

          {error.remainingBalance !== null && (
            <p className="mt-1">Helper points: {error.remainingBalance}</p>
          )}
        </div>
      )}

      {result && (
        <div
          aria-label="Helper answer"
          className="mt-3 rounded-md border border-slate-800 bg-slate-950 p-3 text-sm whitespace-pre-wrap text-slate-300"
        >
          <p className="mb-1 text-xs tracking-wider text-slate-500 uppercase">
            {HELPER_LABELS[result.helper_type]} · {result.cost} pts
          </p>
          {result.content}
        </div>
      )}

      {overview && overview.usage.length > 0 && (
        <ul
          aria-label="Helper history"
          className="mt-3 space-y-1 text-xs text-slate-500"
        >
          {overview.usage.map((usage) => (
            <li key={usage.usage_id}>
              {HELPER_LABELS[usage.helper_type]} · {usage.cost} pts ·{' '}
              {usage.status}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default HelperPanel
