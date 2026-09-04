import { describe, expect, it } from 'vitest'

import {
  reduceWaitingRoomEvent,
  type WaitingRoomEvent,
} from './waitingRoomEvents'
import type { WaitingRoomState } from './waitingRoomState'

const initialState: WaitingRoomState = {
  hostId: 'host-1',
  players: [
    {
      id: 'host-1',
      username: 'Host',
      avatarUrl: null,
      ready: true,
    },
  ],
}

describe('reduceWaitingRoomEvent', () => {
  it('adds a joined player', () => {
    const event: WaitingRoomEvent = {
      type: 'player_joined',
      player: {
        id: 'player-1',
        username: 'Player',
        avatarUrl: null,
        ready: false,
      },
    }

    const nextState = reduceWaitingRoomEvent(initialState, event)

    expect(nextState.players).toHaveLength(2)
    expect(nextState.players[1]?.id).toBe('player-1')
  })

  it('does not duplicate repeated player_joined events', () => {
    const event: WaitingRoomEvent = {
      type: 'player_joined',
      player: {
        id: 'player-1',
        username: 'Player',
        avatarUrl: null,
        ready: false,
      },
    }

    const afterFirstEvent = reduceWaitingRoomEvent(initialState, event)

    const afterDuplicateEvent = reduceWaitingRoomEvent(afterFirstEvent, event)

    expect(afterDuplicateEvent.players).toHaveLength(2)
  })

  it('removes a player after player_left', () => {
    const state: WaitingRoomState = {
      ...initialState,
      players: [
        ...initialState.players,
        {
          id: 'player-1',
          username: 'Player',
          avatarUrl: null,
          ready: false,
        },
      ],
    }

    const nextState = reduceWaitingRoomEvent(state, {
      type: 'player_left',
      playerId: 'player-1',
    })

    expect(nextState.players).toHaveLength(1)
    expect(nextState.players.some((player) => player.id === 'player-1')).toBe(
      false,
    )
  })

  it('syncs ready status after player_ready', () => {
    const state: WaitingRoomState = {
      ...initialState,
      players: [
        ...initialState.players,
        {
          id: 'player-1',
          username: 'Player',
          avatarUrl: null,
          ready: false,
        },
      ],
    }

    const nextState = reduceWaitingRoomEvent(state, {
      type: 'player_ready',
      playerId: 'player-1',
      ready: true,
    })

    expect(
      nextState.players.find((player) => player.id === 'player-1')?.ready,
    ).toBe(true)
  })

  it('replaces local state with authoritative game_state', () => {
    const nextState = reduceWaitingRoomEvent(initialState, {
      type: 'game_state',
      hostId: 'host-2',
      players: [
        {
          id: 'host-2',
          username: 'New Host',
          avatarUrl: null,
          ready: true,
        },
        {
          id: 'player-2',
          username: 'Second Player',
          avatarUrl: null,
          ready: true,
        },
      ],
    })

    expect(nextState.hostId).toBe('host-2')
    expect(nextState.players).toHaveLength(2)
    expect(nextState.players[1]?.ready).toBe(true)
  })
})
