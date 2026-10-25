import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/api/client'
import {
  buyHelper,
  describeHelperError,
  getHelperOverview,
} from '@/features/helpers/api'
import { clearAccessToken, setAccessToken } from '@/stores/authToken'

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('helpers api', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    setAccessToken('token-123')
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
    clearAccessToken()
  })

  it('loads the balance, prices and history of a round', async () => {
    const overview = {
      balance: 90,
      prices: { hint: 10, suggestion: 10, review: 15 },
      usage: [],
    }
    fetchMock.mockResolvedValue(jsonResponse(200, { data: overview }))

    await expect(getHelperOverview('round-1')).resolves.toEqual(overview)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/rounds/round-1/helpers')
    expect(new Headers(init?.headers).get('Authorization')).toBe(
      'Bearer token-123',
    )
  })

  it('buys a helper with the draft and an Idempotency-Key header', async () => {
    const result = {
      usage_id: 'u1',
      helper_type: 'review',
      cost: 15,
      content: 'Tighten the constraints.',
      remaining_balance: 85,
    }
    fetchMock.mockResolvedValue(jsonResponse(200, { data: result }))

    await expect(
      buyHelper(
        'round-1',
        'review',
        { prompt: 'my draft', testId: 't1' },
        'key-1',
      ),
    ).resolves.toEqual(result)

    const [url, init] = fetchMock.mock.calls[0]
    const headers = new Headers(init?.headers)
    expect(url).toBe('/api/v1/rounds/round-1/helpers/review')
    expect(init?.method).toBe('POST')
    expect(headers.get('Idempotency-Key')).toBe('key-1')
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(JSON.parse(String(init?.body))).toEqual({
      prompt: 'my draft',
      test_id: 't1',
    })
  })

  it('sends an empty prompt and no test_id when none is given', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { data: {} }))

    await buyHelper('round-1', 'hint', {}, 'key-2')

    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      prompt: '',
    })
  })

  it('rejects with the server body so the balance can be shown', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(402, {
        error: 'Not enough helper points.',
        error_code: 'INSUFFICIENT_BALANCE',
        remaining_balance: 5,
        cost: 15,
      }),
    )

    const error = await buyHelper('round-1', 'review', {}, 'k').catch(
      (e: unknown) => e,
    )

    expect(error).toBeInstanceOf(ApiError)
    expect(describeHelperError(error)).toEqual({
      message: 'Not enough helper points.',
      remainingBalance: 5,
      reachedServer: true,
    })
  })
})

describe('describeHelperError', () => {
  it('reports a refunded AI failure with the unchanged balance', () => {
    const error = new ApiError(502, 'failed', {
      error: 'HELPER_FAILED',
      error_code: 'OVERLOADED',
      refunded: true,
      remaining_balance: 90,
    })

    expect(describeHelperError(error)).toEqual({
      message: 'The AI could not answer. Your points were refunded.',
      remainingBalance: 90,
      reachedServer: true,
    })
  })

  it('names a timeout', () => {
    const error = new ApiError(504, 'failed', {
      error: 'HELPER_FAILED',
      error_code: 'TIMEOUT',
      remaining_balance: 90,
    })

    expect(describeHelperError(error).message).toMatch(/took too long/)
  })

  it('maps known error codes and validation fields', () => {
    expect(
      describeHelperError(
        new ApiError(409, 'x', { error_code: 'ROUND_NOT_ACTIVE' }),
      ),
    ).toEqual({
      message: 'This round is not active.',
      remainingBalance: null,
      reachedServer: true,
    })

    expect(
      describeHelperError(
        new ApiError(400, 'x', {
          error: 'Validation failed',
          fields: { prompt: 'a suggestion needs your current draft' },
        }),
      ).message,
    ).toBe('a suggestion needs your current draft')
  })

  it('treats a network failure as not having reached the server', () => {
    expect(describeHelperError(new TypeError('Failed to fetch'))).toEqual({
      message: 'Could not reach the server. Please try again.',
      remainingBalance: null,
      reachedServer: false,
    })
  })
})
