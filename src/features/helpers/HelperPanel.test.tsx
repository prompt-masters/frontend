import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/api/client'
import * as api from '@/features/helpers/api'
import HelperPanel from '@/features/helpers/HelperPanel'
import type { HelperOverview, HelperResult } from '@/features/helpers/types'

vi.mock('@/features/helpers/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/helpers/api')>()),
  getHelperOverview: vi.fn(),
  buyHelper: vi.fn(),
  newIdempotencyKey: vi.fn(),
}))

const getHelperOverview = vi.mocked(api.getHelperOverview)
const buyHelper = vi.mocked(api.buyHelper)
const newIdempotencyKey = vi.mocked(api.newIdempotencyKey)

const prices = { hint: 10, suggestion: 10, review: 15 }

function overview(balance: number, usage: HelperOverview['usage'] = []) {
  return { balance, prices, usage }
}

function delivered(
  helper_type: HelperResult['helper_type'],
  remaining_balance: number,
): HelperResult {
  return {
    usage_id: `u-${helper_type}`,
    helper_type,
    cost: prices[helper_type],
    content: `Your ${helper_type}.`,
    remaining_balance,
  }
}

async function renderPanel(
  props: Partial<Parameters<typeof HelperPanel>[0]> = {},
) {
  render(
    <HelperPanel roundId="round-1" prompt="my draft" roundActive {...props} />,
  )
  await screen.findByText(/Hint/)
  await act(async () => {})
}

const button = (name: RegExp) => screen.getByRole('button', { name })
const balance = () => screen.getByLabelText('Helper balance')

describe('HelperPanel', () => {
  let keys = 0

  beforeEach(() => {
    keys = 0
    newIdempotencyKey.mockImplementation(() => `key-${++keys}`)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('shows the balance and each helper with its cost', async () => {
    getHelperOverview.mockResolvedValue(overview(100))

    await renderPanel()

    expect(getHelperOverview).toHaveBeenCalledWith('round-1')
    expect(balance()).toHaveTextContent('100')
    expect(button(/Hint\s*10 pts/)).toBeEnabled()
    expect(button(/Suggestion\s*10 pts/)).toBeEnabled()
    expect(button(/Review\s*15 pts/)).toBeEnabled()
  })

  it('disables a helper the balance cannot pay for', async () => {
    getHelperOverview.mockResolvedValue(overview(12))

    await renderPanel()

    expect(button(/Review/)).toBeDisabled()
    expect(button(/Review/)).toHaveAttribute(
      'title',
      'Not enough helper points.',
    )
    expect(button(/Hint/)).toBeEnabled()
  })

  it('disables every helper when the round is not active', async () => {
    getHelperOverview.mockResolvedValue(overview(100))

    await renderPanel({ roundActive: false })

    for (const name of [/Hint/, /Suggestion/, /Review/]) {
      expect(button(name)).toBeDisabled()
    }
    expect(
      screen.getByText('Helpers are available while the round is active.'),
    ).toBeInTheDocument()
  })

  it('needs a draft for a suggestion and a draft or test for a review', async () => {
    getHelperOverview.mockResolvedValue(overview(100))

    await renderPanel({ prompt: '  ' })

    expect(button(/Suggestion/)).toBeDisabled()
    expect(button(/Review/)).toBeDisabled()
    expect(button(/Hint/)).toBeEnabled()
  })

  it('shows a loading state and only changes the balance to what the server returns', async () => {
    getHelperOverview.mockResolvedValueOnce(overview(100))
    let answer!: (r: HelperResult) => void
    buyHelper.mockReturnValue(new Promise((resolve) => (answer = resolve)))

    await renderPanel()
    fireEvent.click(button(/Hint/))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Asking the AI for a hint...',
    )
    expect(button(/Thinking/)).toHaveAttribute('aria-busy', 'true')
    expect(button(/Review/)).toBeDisabled()
    // Nothing is deducted before the server answers.
    expect(balance()).toHaveTextContent('100')
    expect(buyHelper).toHaveBeenCalledWith(
      'round-1',
      'hint',
      { prompt: 'my draft', testId: undefined },
      'key-1',
    )

    getHelperOverview.mockResolvedValue(
      overview(90, [
        {
          usage_id: 'u-hint',
          helper_type: 'hint',
          cost: 10,
          status: 'delivered',
          content: 'Your hint.',
          error_code: null,
          created_at: 1,
        },
      ]),
    )
    await act(async () => answer(delivered('hint', 90)))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Helper answer')).toHaveTextContent(
      'Your hint.',
    )
    expect(balance()).toHaveTextContent('90')
    expect(screen.getByLabelText('Helper history')).toHaveTextContent(
      'Hint · 10 pts · delivered',
    )
  })

  it('shows the error and the balance the server returned', async () => {
    getHelperOverview.mockResolvedValue(overview(100))
    buyHelper.mockRejectedValue(
      new ApiError(502, 'failed', {
        error: 'HELPER_FAILED',
        error_code: 'OVERLOADED',
        refunded: true,
        remaining_balance: 100,
      }),
    )

    await renderPanel()
    await act(async () => fireEvent.click(button(/Review/)))

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(
      'The AI could not answer. Your points were refunded.',
    )
    expect(alert).toHaveTextContent('Helper points: 100')
    expect(balance()).toHaveTextContent('100')
  })

  it('shows an insufficient balance refusal with the server balance', async () => {
    getHelperOverview.mockResolvedValueOnce(overview(20))
    getHelperOverview.mockResolvedValue(overview(5))
    buyHelper.mockRejectedValue(
      new ApiError(402, 'refused', {
        error_code: 'INSUFFICIENT_BALANCE',
        remaining_balance: 5,
        cost: 15,
      }),
    )

    await renderPanel()
    await act(async () => fireEvent.click(button(/Review/)))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Not enough helper points.',
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Helper points: 5')
    expect(balance()).toHaveTextContent('5')
    expect(button(/Hint/)).toBeDisabled()
  })

  it('retries with the same Idempotency-Key only when the server was not reached', async () => {
    getHelperOverview.mockResolvedValue(overview(100))
    buyHelper
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(
        new ApiError(502, 'failed', {
          error: 'HELPER_FAILED',
          remaining_balance: 100,
        }),
      )
      .mockResolvedValueOnce(delivered('hint', 90))

    await renderPanel()
    for (let i = 0; i < 3; i++) {
      await act(async () => fireEvent.click(button(/Hint/)))
    }

    expect(buyHelper.mock.calls.map((call) => call[3])).toEqual([
      'key-1', // network failure
      'key-1', // the retry reuses it
      'key-2', // the server answered, so the next purchase is new
    ])
  })
})
