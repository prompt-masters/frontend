import { describe, expect, it } from 'vitest'

import {
  createRoundGameplayState,
  reduceRoundGameplayState,
} from './roundGameplayState'

describe('roundGameplayState', () => {
  it('clears the previous output when a new test starts', () => {
    const state = {
      testCount: 1,
      output: 'Old AI output',
      isStreaming: false,
    }

    const nextState = reduceRoundGameplayState(state, {
      type: 'test_started',
    })

    expect(nextState.output).toBe('')
    expect(nextState.isStreaming).toBe(true)
    expect(nextState.testCount).toBe(2)
  })

  it('appends output chunks progressively', () => {
    let state = createRoundGameplayState(1)

    state = reduceRoundGameplayState(state, {
      type: 'test_started',
    })

    state = reduceRoundGameplayState(state, {
      type: 'output_chunk',
      chunk: 'The customer ',
    })

    expect(state.output).toBe('The customer ')
    expect(state.isStreaming).toBe(true)

    state = reduceRoundGameplayState(state, {
      type: 'output_chunk',
      chunk: 'loved the product.',
    })

    expect(state.output).toBe('The customer loved the product.')
  })

  it('marks streaming complete after output_complete', () => {
    const state = {
      testCount: 2,
      output: 'Complete response',
      isStreaming: true,
    }

    const nextState = reduceRoundGameplayState(state, {
      type: 'output_complete',
    })

    expect(nextState.output).toBe('Complete response')
    expect(nextState.isStreaming).toBe(false)
  })

  it('clears first test output before the second test begins', () => {
    let state = createRoundGameplayState(0)

    state = reduceRoundGameplayState(state, {
      type: 'test_started',
    })

    state = reduceRoundGameplayState(state, {
      type: 'output_chunk',
      chunk: 'First response',
    })

    state = reduceRoundGameplayState(state, {
      type: 'output_complete',
    })

    expect(state.output).toBe('First response')
    expect(state.testCount).toBe(1)

    state = reduceRoundGameplayState(state, {
      type: 'test_started',
    })

    expect(state.output).toBe('')
    expect(state.testCount).toBe(2)
    expect(state.isStreaming).toBe(true)
  })

  it('restores authoritative round state from the server', () => {
    const localState = {
      testCount: 4,
      output: 'Local output',
      isStreaming: true,
    }

    const restoredState = reduceRoundGameplayState(localState, {
      type: 'game_state',
      testCount: 3,
      output: 'Server output',
      isStreaming: false,
    })

    expect(restoredState).toEqual({
      testCount: 3,
      output: 'Server output',
      isStreaming: false,
    })
  })
})
