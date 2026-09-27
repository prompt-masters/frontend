import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import RoundGameplayPanel from './RoundGameplayPanel'
import type { ActiveRound } from './types'

const activeRound: ActiveRound = {
  id: 'round-1',
  roundNumber: 1,
  challenge: 'Write a prompt that summarizes a customer review.',
  constraints: [
    {
      id: 'constraint-1',
      label: 'Keep the response under 100 words.',
    },
    {
      id: 'constraint-2',
      label: 'Preserve the customer sentiment.',
    },
  ],
  deadline: '2026-09-03T20:01:30.000Z',
  testCount: 3,
  points: 100,
  prompt: '',
  status: 'active',
}

describe('RoundGameplayPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-03T20:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the challenge, constraints, tests, points, and server timer', () => {
    render(
      <RoundGameplayPanel
        round={activeRound}
        output=""
        isStreaming={false}
        onTest={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(
      screen.getByText('Write a prompt that summarizes a customer review.'),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Keep the response under 100 words\./),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Preserve the customer sentiment\./),
    ).toBeInTheDocument()

    expect(screen.getByRole('timer')).toHaveTextContent('01:30')
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('shows the 10-second warning based on the server deadline', () => {
    render(
      <RoundGameplayPanel
        round={{
          ...activeRound,
          deadline: '2026-09-03T20:00:12.000Z',
        }}
        output=""
        isStreaming={false}
        onTest={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByRole('timer')).toHaveTextContent('00:10')
    expect(screen.getByText('Time running out!')).toBeInTheDocument()
  })

  it('sends the current prompt when Test Prompt is clicked', () => {
    const onTest = vi.fn()

    render(
      <RoundGameplayPanel
        round={activeRound}
        output=""
        isStreaming={false}
        onTest={onTest}
        onSubmit={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByLabelText('Prompt editor'), {
      target: {
        value: 'Summarize this review clearly.',
      },
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: /test prompt/i,
      }),
    )

    expect(onTest).toHaveBeenCalledWith('Summarize this review clearly.')
  })

  it('renders AI output progressively while streaming', () => {
    const { rerender } = render(
      <RoundGameplayPanel
        round={activeRound}
        output="The customer"
        isStreaming
        onTest={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('AI output')).toHaveTextContent('The customer')

    expect(screen.getByRole('status')).toHaveTextContent('streaming...')

    rerender(
      <RoundGameplayPanel
        round={activeRound}
        output="The customer loved the product."
        isStreaming={false}
        onTest={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('AI output')).toHaveTextContent(
      'The customer loved the product.',
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('sends the current prompt when Submit Final is clicked', () => {
    const onSubmit = vi.fn()

    render(
      <RoundGameplayPanel
        round={activeRound}
        output=""
        isStreaming={false}
        onTest={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    fireEvent.change(screen.getByLabelText('Prompt editor'), {
      target: {
        value: 'My final prompt',
      },
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: /submit final/i,
      }),
    )

    expect(onSubmit).toHaveBeenCalledWith('My final prompt')
  })

  it('locks the editor while the final prompt is submitting', () => {
    render(
      <RoundGameplayPanel
        round={{
          ...activeRound,
          prompt: 'Final prompt',
        }}
        output=""
        isStreaming={false}
        isSubmitting
        onTest={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Prompt editor')).toBeDisabled()

    expect(
      screen.getByRole('button', {
        name: /submitting/i,
      }),
    ).toBeDisabled()
  })

  it('shows the waiting state after the player submits', () => {
    render(
      <RoundGameplayPanel
        round={{
          ...activeRound,
          status: 'submitted',
          prompt: 'Final prompt',
        }}
        output=""
        isStreaming={false}
        onTest={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Prompt submitted')).toBeInTheDocument()

    expect(
      screen.getByText('Waiting for the other players to finish this round.'),
    ).toBeInTheDocument()

    expect(screen.queryByLabelText('Prompt editor')).not.toBeInTheDocument()
  })

  it('calls the expiration handler when the server deadline reaches zero', () => {
    const onExpire = vi.fn()

    render(
      <RoundGameplayPanel
        round={{
          ...activeRound,
          deadline: '2026-09-03T20:00:02.000Z',
        }}
        output=""
        isStreaming={false}
        onTest={vi.fn()}
        onSubmit={vi.fn()}
        onExpire={onExpire}
      />,
    )

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(onExpire).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('timer')).toHaveTextContent('00:00')
    expect(screen.getByLabelText('Prompt editor')).toBeDisabled()
  })
})
