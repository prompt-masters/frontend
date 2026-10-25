import { useCallback, useEffect, useRef, useState } from 'react'

import {
  buyHelper,
  describeHelperError,
  getHelperOverview,
  type HelperError,
  newIdempotencyKey,
} from '@/features/helpers/api'
import type {
  HelperInput,
  HelperOverview,
  HelperResult,
  HelperType,
} from '@/features/helpers/types'

// useHelpers loads a round's helpers and buys them. The balance only ever
// changes to a value the server returned: nothing is deducted up front.
function useHelpers(roundId: string) {
  const [overview, setOverview] = useState<HelperOverview | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [pending, setPending] = useState<HelperType | null>(null)
  const [result, setResult] = useState<HelperResult | null>(null)
  const [error, setError] = useState<HelperError | null>(null)

  // The key of a request that may not have reached the server, reused when
  // the same helper is asked for again so a retry is not charged twice.
  const retryKey = useRef<{ type: HelperType; key: string } | null>(null)

  const refresh = useCallback(async () => {
    const next = await getHelperOverview(roundId)

    setOverview(next)
    setBalance(next.balance)
  }, [roundId])

  useEffect(() => {
    let cancelled = false

    getHelperOverview(roundId)
      .then((next) => {
        if (!cancelled) {
          setOverview(next)
          setBalance(next.balance)
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(describeHelperError(loadError))
        }
      })

    return () => {
      cancelled = true
    }
  }, [roundId])

  const buy = useCallback(
    async (type: HelperType, input: HelperInput) => {
      if (pending) {
        return
      }

      const key =
        retryKey.current?.type === type
          ? retryKey.current.key
          : newIdempotencyKey()

      setPending(type)
      setError(null)
      setResult(null)

      try {
        const delivered = await buyHelper(roundId, type, input, key)

        retryKey.current = null
        setResult(delivered)
        setBalance(delivered.remaining_balance)
      } catch (buyError) {
        const info = describeHelperError(buyError)

        retryKey.current = info.reachedServer ? null : { type, key }
        setError(info)

        if (info.remainingBalance !== null) {
          setBalance(info.remainingBalance)
        }
      } finally {
        setPending(null)
      }

      // The history and balance as stored, refunds included.
      await refresh().catch(() => {})
    },
    [pending, refresh, roundId],
  )

  return { overview, balance, pending, result, error, buy }
}

export default useHelpers
