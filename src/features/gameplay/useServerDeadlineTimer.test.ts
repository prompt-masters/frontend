import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import useServerDeadlineTimer from './useServerDeadlineTimer'

describe('useServerDeadlineTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-03T20:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('derives remaining time from the server deadline', () => {
    const { result } = renderHook(() =>
      useServerDeadlineTimer({
        deadline: '2026-09-03T20:01:30.000Z',
      }),
    )

    expect(result.current.remainingSeconds).toBe(90)
    expect(result.current.formattedTime).toBe('01:30')
    expect(result.current.isWarning).toBe(false)
  })

  it('shows the warning when 10 seconds remain', () => {
    const { result } = renderHook(() =>
      useServerDeadlineTimer({
        deadline: '2026-09-03T20:00:12.000Z',
      }),
    )

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.remainingSeconds).toBe(10)
    expect(result.current.formattedTime).toBe('00:10')
    expect(result.current.isWarning).toBe(true)
  })

  it('counts down using the server deadline', () => {
    const { result } = renderHook(() =>
      useServerDeadlineTimer({
        deadline: '2026-09-03T20:00:30.000Z',
      }),
    )

    expect(result.current.remainingSeconds).toBe(30)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.remainingSeconds).toBe(25)
  })

  it('calls onExpire once when the deadline reaches zero', () => {
    const onExpire = vi.fn()

    const { result } = renderHook(() =>
      useServerDeadlineTimer({
        deadline: '2026-09-03T20:00:02.000Z',
        onExpire,
      }),
    )

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.remainingSeconds).toBe(0)
    expect(result.current.isExpired).toBe(true)
    expect(onExpire).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(onExpire).toHaveBeenCalledTimes(1)
  })
})
