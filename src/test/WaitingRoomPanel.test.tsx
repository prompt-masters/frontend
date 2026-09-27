import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import WaitingRoomPanel from '@/features/lobby/WaitingRoomPanel'
import type { WaitingRoomState } from '@/features/lobby/waitingRoomState'

const waitingRoomState: WaitingRoomState = {
  hostId: 'host-1',
  players: [
    {
      id: 'host-1',
      username: 'Host Player',
      avatarUrl: null,
      ready: true,
    },
    {
      id: 'player-1',
      username: 'Second Player',
      avatarUrl: null,
      ready: false,
    },
  ],
}

describe('WaitingRoomPanel', () => {
  it('shows room code and players', () => {
    render(
      <WaitingRoomPanel
        roomCode="123456"
        currentUserId="host-1"
        state={waitingRoomState}
        connectionStatus="connected"
        onReady={vi.fn()}
        onStartGame={vi.fn()}
      />,
    )

    expect(screen.getByText('123456')).toBeInTheDocument()
    expect(screen.getByText('Host Player')).toBeInTheDocument()
    expect(screen.getByText('Second Player')).toBeInTheDocument()
  })

  it('shows Start Game only to the host', () => {
    const { rerender } = render(
      <WaitingRoomPanel
        roomCode="123456"
        currentUserId="host-1"
        state={waitingRoomState}
        connectionStatus="connected"
        onReady={vi.fn()}
        onStartGame={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: /start game/i }),
    ).toBeInTheDocument()

    rerender(
      <WaitingRoomPanel
        roomCode="123456"
        currentUserId="player-1"
        state={waitingRoomState}
        connectionStatus="connected"
        onReady={vi.fn()}
        onStartGame={vi.fn()}
      />,
    )

    expect(
      screen.queryByRole('button', { name: /start game/i }),
    ).not.toBeInTheDocument()
  })

  it('disables Start Game until all players are ready', () => {
    const { rerender } = render(
      <WaitingRoomPanel
        roomCode="123456"
        currentUserId="host-1"
        state={waitingRoomState}
        connectionStatus="connected"
        onReady={vi.fn()}
        onStartGame={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /start game/i })).toBeDisabled()

    const allReadyState: WaitingRoomState = {
      ...waitingRoomState,
      players: waitingRoomState.players.map((player) => ({
        ...player,
        ready: true,
      })),
    }

    rerender(
      <WaitingRoomPanel
        roomCode="123456"
        currentUserId="host-1"
        state={allReadyState}
        connectionStatus="connected"
        onReady={vi.fn()}
        onStartGame={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /start game/i })).toBeEnabled()
  })

  it('shows Reconnecting when the WebSocket connection is lost', () => {
    render(
      <WaitingRoomPanel
        roomCode="123456"
        currentUserId="player-1"
        state={waitingRoomState}
        connectionStatus="reconnecting"
        onReady={vi.fn()}
        onStartGame={vi.fn()}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Reconnecting…')
  })

  it('calls the ready handler when Ready is clicked', () => {
    const onReady = vi.fn()

    render(
      <WaitingRoomPanel
        roomCode="123456"
        currentUserId="player-1"
        state={waitingRoomState}
        connectionStatus="connected"
        onReady={onReady}
        onStartGame={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /^ready$/i }))

    expect(onReady).toHaveBeenCalledTimes(1)
  })
})
