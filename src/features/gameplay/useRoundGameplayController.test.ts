import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import useRoundGameplayController from './useRoundGameplayController'

describe('useRoundGameplayController', () => {
  it('starts a new test after the test request succeeds', async () => {
    const onTestRequest = vi.fn().mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useRoundGameplayController({
        initialTestCount: 1,
        initialOutput: 'Old output',
        onTestRequest,
        onSubmitRequest: vi.fn(),
      }),
    )

    await act(async () => {
      await result.current.testPrompt('My prompt')
    })

    expect(onTestRequest).toHaveBeenCalledWith('My prompt')
    expect(result.current.testCount).toBe(2)
    expect(result.current.output).toBe('')
    expect(result.current.isStreaming).toBe(true)
  })

  it('appends streaming chunks from server events', () => {
    const { result } = renderHook(() =>
      useRoundGameplayController({
        initialTestCount: 1,
        onTestRequest: vi.fn(),
        onSubmitRequest: vi.fn(),
      }),
    )

    act(() => {
      result.current.handleServerEvent({
        type: 'output_chunk',
        chunk: 'Hello ',
      })

      result.current.handleServerEvent({
        type: 'output_chunk',
        chunk: 'world',
      })
    })

    expect(result.current.output).toBe('Hello world')
    expect(result.current.isStreaming).toBe(true)

    act(() => {
      result.current.handleServerEvent({
        type: 'output_complete',
      })
    })

    expect(result.current.isStreaming).toBe(false)
  })

  it('restores authoritative state after reconnect', () => {
    const { result } = renderHook(() =>
      useRoundGameplayController({
        initialTestCount: 4,
        initialOutput: 'Local output',
        onTestRequest: vi.fn(),
        onSubmitRequest: vi.fn(),
      }),
    )

    act(() => {
      result.current.handleServerEvent({
        type: 'game_state',
        testCount: 2,
        output: 'Server output',
        isStreaming: false,
      })
    })

    expect(result.current.testCount).toBe(2)
    expect(result.current.output).toBe('Server output')
    expect(result.current.isStreaming).toBe(false)
  })

  it('does not update test state when the request fails', async () => {
    const onTestRequest = vi.fn().mockRejectedValue(new Error('Request failed'))

    const { result } = renderHook(() =>
      useRoundGameplayController({
        initialTestCount: 1,
        initialOutput: 'Previous output',
        onTestRequest,
        onSubmitRequest: vi.fn(),
      }),
    )

    await act(async () => {
      await result.current.testPrompt('Bad prompt')
    })

    expect(result.current.testCount).toBe(1)
    expect(result.current.output).toBe('Previous output')
    expect(result.current.error).toBe(
      'Unable to test the prompt. Please try again.',
    )
  })

  it('submits the final prompt through the provided callback', async () => {
    const onSubmitRequest = vi.fn().mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useRoundGameplayController({
        initialTestCount: 0,
        onTestRequest: vi.fn(),
        onSubmitRequest,
      }),
    )

    await act(async () => {
      await result.current.submitPrompt('Final prompt')
    })

    expect(onSubmitRequest).toHaveBeenCalledWith('Final prompt')
    expect(result.current.isSubmitting).toBe(true)
  })
})
