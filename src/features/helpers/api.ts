import { ApiError, apiRequest } from '@/api/client'
import type {
  HelperInput,
  HelperOverview,
  HelperResult,
  HelperType,
} from '@/features/helpers/types'

type Envelope<T> = {
  data: T
}

function helpersPath(roundId: string) {
  return `/api/v1/rounds/${encodeURIComponent(roundId)}/helpers`
}

export async function getHelperOverview(roundId: string) {
  const response = await apiRequest<Envelope<HelperOverview>>(
    helpersPath(roundId),
  )

  return response.data
}

// buyHelper spends points on a helper. Retrying with the same idempotency
// key is never charged twice: the server answers with the first outcome.
export async function buyHelper(
  roundId: string,
  type: HelperType,
  input: HelperInput,
  idempotencyKey: string,
) {
  const response = await apiRequest<Envelope<HelperResult>>(
    `${helpersPath(roundId)}/${type}`,
    {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({
        prompt: input.prompt ?? '',
        ...(input.testId ? { test_id: input.testId } : {}),
      }),
    },
  )

  return response.data
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID()
}

export type HelperError = {
  message: string
  // The balance the server reported with the error, if it did.
  remainingBalance: number | null
  // False when the request may never have reached the server, so retrying
  // with the same idempotency key is safe and needed.
  reachedServer: boolean
}

type ErrorBody = {
  error?: string
  error_code?: string
  remaining_balance?: number
  fields?: Record<string, string>
}

const ERROR_MESSAGES: Record<string, string> = {
  INSUFFICIENT_BALANCE: 'Not enough helper points.',
  TIMEOUT: 'The AI took too long to answer. Your points were refunded.',
  ROUND_NOT_ACTIVE: 'This round is not active.',
  ROUND_ENDED:
    'The round ended before the AI answered. Your points were refunded.',
  ALREADY_SUBMITTED: 'You have already submitted this round.',
  IN_PROGRESS: 'That request is still running. Try again in a moment.',
  AI_UNAVAILABLE: 'Helpers are not available right now.',
}

export function describeHelperError(error: unknown): HelperError {
  if (!(error instanceof ApiError)) {
    return {
      message: 'Could not reach the server. Please try again.',
      remainingBalance: null,
      reachedServer: false,
    }
  }

  const body = (error.data ?? {}) as ErrorBody
  const remainingBalance =
    typeof body.remaining_balance === 'number' ? body.remaining_balance : null

  let message = 'Something went wrong. Please try again.'

  if (body.error_code && ERROR_MESSAGES[body.error_code]) {
    message = ERROR_MESSAGES[body.error_code]
  } else if (body.error === 'HELPER_FAILED') {
    message = 'The AI could not answer. Your points were refunded.'
  } else if (body.fields) {
    message = Object.values(body.fields).join(' ')
  } else if (body.error) {
    message = body.error
  }

  return { message, remainingBalance, reachedServer: true }
}
