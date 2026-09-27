import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import useWebSocket from '@/websocket/useWebSocket'

class MockWebSocket {
  static OPEN = 1
  static CLOSED = 3
  static instances: MockWebSocket[] = []

  url: string
  readyState = 0
  sentMessages: string[] = []

  onopen: (() => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: (() => void) | null = null
  onclose: (() => void) | null = null

  constructor(url: string | URL) {
    this.url = url.toString()
    MockWebSocket.instances.push(this)
  }

  send(message: string) {
    this.sentMessages.push(message)
  }

  close() {
    this.readyState = MockWebSocket.CLOSED

    if (this.onclose) {
      this.onclose()
    }
  }

  open() {
    this.readyState = MockWebSocket.OPEN

    if (this.onopen) {
      this.onopen()
    }
  }

  receive(message: unknown) {
    if (this.onmessage) {
      this.onmessage({
        data: JSON.stringify(message),
      } as MessageEvent)
    }
  }

  disconnect() {
    this.readyState = MockWebSocket.CLOSED

    if (this.onclose) {
      this.onclose()
    }
  }
}

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    MockWebSocket.instances = []

    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('connects, receives messages, and sends messages', () => {
    const onMessage = vi.fn()

    const { result } = renderHook(() =>
      useWebSocket({
        url: 'ws://localhost/lobby/123456',
        onMessage,
      }),
    )

    expect(MockWebSocket.instances).toHaveLength(1)

    const socket = MockWebSocket.instances[0]

    if (!socket) {
      throw new Error('Expected WebSocket instance')
    }

    act(() => {
      socket.open()
    })

    expect(result.current.status).toBe('connected')
    expect(result.current.reconnectAttempts).toBe(0)

    act(() => {
      socket.receive({
        type: 'game_state',
      })
    })

    expect(onMessage).toHaveBeenCalledWith({
      type: 'game_state',
    })

    act(() => {
      result.current.sendMessage({
        type: 'ready',
      })
    })

    expect(socket.sentMessages).toEqual([
      JSON.stringify({
        type: 'ready',
      }),
    ])
  })

  it('reconnects using exponential backoff', () => {
    const { result } = renderHook(() =>
      useWebSocket({
        url: 'ws://localhost/lobby/123456',
        onMessage: vi.fn(),
        baseReconnectDelayMs: 100,
        maxReconnectDelayMs: 1000,
      }),
    )

    const firstSocket = MockWebSocket.instances[0]

    if (!firstSocket) {
      throw new Error('Expected first WebSocket instance')
    }

    act(() => {
      firstSocket.open()
    })

    expect(result.current.status).toBe('connected')

    act(() => {
      firstSocket.disconnect()
    })

    expect(result.current.status).toBe('reconnecting')
    expect(result.current.reconnectAttempts).toBe(1)

    act(() => {
      vi.advanceTimersByTime(99)
    })

    expect(MockWebSocket.instances).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(MockWebSocket.instances).toHaveLength(2)

    const secondSocket = MockWebSocket.instances[1]

    if (!secondSocket) {
      throw new Error('Expected second WebSocket instance')
    }

    act(() => {
      secondSocket.disconnect()
    })

    expect(result.current.reconnectAttempts).toBe(2)

    act(() => {
      vi.advanceTimersByTime(199)
    })

    expect(MockWebSocket.instances).toHaveLength(2)

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(MockWebSocket.instances).toHaveLength(3)

    const thirdSocket = MockWebSocket.instances[2]

    if (!thirdSocket) {
      throw new Error('Expected third WebSocket instance')
    }

    act(() => {
      thirdSocket.open()
    })

    expect(result.current.status).toBe('connected')
    expect(result.current.reconnectAttempts).toBe(0)
  })

  it('stops reconnecting after the hook unmounts', () => {
    const { unmount } = renderHook(() =>
      useWebSocket({
        url: 'ws://localhost/lobby/123456',
        onMessage: vi.fn(),
        baseReconnectDelayMs: 100,
      }),
    )

    const socket = MockWebSocket.instances[0]

    if (!socket) {
      throw new Error('Expected WebSocket instance')
    }

    act(() => {
      socket.open()
      socket.disconnect()
    })

    expect(MockWebSocket.instances).toHaveLength(1)

    unmount()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(MockWebSocket.instances).toHaveLength(1)
  })

  it('returns false when sending while disconnected', () => {
    const { result } = renderHook(() =>
      useWebSocket({
        url: 'ws://localhost/lobby/123456',
        onMessage: vi.fn(),
      }),
    )

    let sent = true

    act(() => {
      sent = result.current.sendMessage({
        type: 'ready',
      })
    })

    expect(sent).toBe(false)
  })
})
