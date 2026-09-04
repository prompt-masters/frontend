import { describe, expect, it } from 'vitest'

import {
  initialRoundSessionState,
  reduceRoundSessionState,
} from './roundSessionState'
import type { ActiveRound } from './types'

const round: ActiveRound = {
  id: 'round-1',
  roundNumber: 1,
  challenge: 'Create the best summarization prompt.',
  constraints: [
    {
      id: 'constraint-1',
      label: 'Keep the answer concise.',
    },
  ],
  deadline: '2026-09-03T20:01:30.000Z',
  testCount: 0,
  points: 100,
  prompt: '',
  status: 'active',
}

describe('roundSessionState', () => {
  it('loads a new round from round_start', () => {
    const state = reduceRoundSessionState(initialRoundSessionState, {
      type: 'round_start',
      round,
    })

    expect(state.round).toEqual(round)
    expect(state.output).toBe('')
    expect(state.isStreaming).toBe(false)
  })

  it('clears old output when a new test starts', () => {
    let state = reduceRoundSessionState(initialRoundSessionState, {
      type: 'round_start',
      round,
    })

    state = {
      ...state,
      output: 'Old response',
    }

    state = reduceRoundSessionState(state, {
      type: 'test_started',
    })

    expect(state.output).toBe('')
    expect(state.isStreaming).toBe(true)
    expect(state.round?.testCount).toBe(1)
  })

  it('renders output chunks progressively', () => {
    let state = reduceRoundSessionState(initialRoundSessionState, {
      type: 'round_start',
      round,
    })

    state = reduceRoundSessionState(state, {
      type: 'output_chunk',
      chunk: 'Hello ',
    })

    state = reduceRoundSessionState(state, {
      type: 'output_chunk',
      chunk: 'world',
    })

    expect(state.output).toBe('Hello world')
    expect(state.isStreaming).toBe(true)

    state = reduceRoundSessionState(state, {
      type: 'output_complete',
    })

    expect(state.isStreaming).toBe(false)
  })

  it('restores authoritative round state after reconnect', () => {
    const staleState = {
      round: {
        ...round,
        testCount: 5,
      },
      output: 'Stale local output',
      isStreaming: true,
    }

    const authoritativeRound: ActiveRound = {
      ...round,
      testCount: 2,
      prompt: 'Prompt restored by server',
    }

    const restoredState = reduceRoundSessionState(staleState, {
      type: 'game_state',
      round: authoritativeRound,
      output: 'Authoritative server output',
      isStreaming: false,
    })

    expect(restoredState.round).toEqual(authoritativeRound)
    expect(restoredState.round?.testCount).toBe(2)
    expect(restoredState.output).toBe('Authoritative server output')
    expect(restoredState.isStreaming).toBe(false)
  })

  it('marks the round submitted and stores the final prompt', () => {
    const activeState = reduceRoundSessionState(initialRoundSessionState, {
      type: 'round_start',
      round,
    })

    const submittedState = reduceRoundSessionState(activeState, {
      type: 'submitted',
      prompt: 'My final prompt',
    })

    expect(submittedState.round?.status).toBe('submitted')
    expect(submittedState.round?.prompt).toBe('My final prompt')
  })
})
