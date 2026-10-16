import { useCallback, useEffect, useRef, useState } from 'react'

export type WebSocketConnectionStatus =
  'connecting' | 'connected' | 'reconnecting' | 'disconnected'

type UseWebSocketOptions<TMessage> = {
  url: string | null
  onMessage: (message: TMessage) => void
  baseReconnectDelayMs?: number
  maxReconnectDelayMs?: number
}

type UseWebSocketResult = {
  status: WebSocketConnectionStatus
  reconnectAttempts: number
  sendMessage: (message: unknown) => boolean
}

type ConnectionState = {
  url: string | null
  status: WebSocketConnectionStatus
}

function useWebSocket<TMessage = unknown>({
  url,
  onMessage,
  baseReconnectDelayMs = 1000,
  maxReconnectDelayMs = 30000,
}: UseWebSocketOptions<TMessage>): UseWebSocketResult {
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const onMessageRef = useRef(onMessage)

  const [connection, setConnection] = useState<ConnectionState>({
    url,
    status: url ? 'connecting' : 'disconnected',
  })

  const [reconnectAttempts, setReconnectAttempts] = useState(0)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    if (!url) {
      return
    }

    const socketUrl = url
    let disposed = false

    function connect() {
      if (disposed) {
        return
      }

      const socket = new WebSocket(socketUrl)
      socketRef.current = socket

      socket.onopen = () => {
        if (disposed) {
          return
        }

        reconnectAttemptsRef.current = 0
        setReconnectAttempts(0)
        setConnection({
          url: socketUrl,
          status: 'connected',
        })
      }

      socket.onmessage = (event) => {
        if (disposed) {
          return
        }

        try {
          const message = JSON.parse(event.data as string) as TMessage
          onMessageRef.current(message)
        } catch {
          // Ignore malformed messages until the backend event contract is known.
        }
      }

      socket.onerror = () => {
        socket.close()
      }

      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null
        }

        if (disposed) {
          return
        }

        reconnectAttemptsRef.current += 1

        const attempt = reconnectAttemptsRef.current

        setReconnectAttempts(attempt)
        setConnection({
          url: socketUrl,
          status: 'reconnecting',
        })

        const delay = Math.min(
          baseReconnectDelayMs * 2 ** (attempt - 1),
          maxReconnectDelayMs,
        )

        reconnectTimerRef.current = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      disposed = true
      reconnectAttemptsRef.current = 0

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }

      const socket = socketRef.current
      socketRef.current = null

      if (socket) {
        socket.close()
      }
    }
  }, [url, baseReconnectDelayMs, maxReconnectDelayMs])

  const sendMessage = useCallback((message: unknown) => {
    const socket = socketRef.current

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false
    }

    socket.send(JSON.stringify(message))
    return true
  }, [])

  const status: WebSocketConnectionStatus = !url
    ? 'disconnected'
    : connection.url === url
      ? connection.status
      : 'connecting'

  return {
    status,
    reconnectAttempts: connection.url === url ? reconnectAttempts : 0,
    sendMessage,
  }
}

export default useWebSocket
