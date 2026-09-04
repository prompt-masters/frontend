import { describe, expect, it } from 'vitest'

import {
  addOrUpdatePlayer,
  areAllPlayersReady,
  removePlayer,
  setAuthoritativeGameState,
  updatePlayerReady,
  type WaitingRoomState,
} from './waitingRoomState'

describe('waitingRoomState', () => {
  it('does not duplicate a player when the same player joins twice', () => {
    const initialState: WaitingRoomState = {
      hostId: 'host-1',
      players: [],
    }

    const player = {
      id: 'player-1',
      username: 'Khanh',
      avatarUrl: null,
      ready: false,
    }

    const afterFirstJoin = addOrUpdatePlayer(initialState, player)
    const afterSecondJoin = addOrUpdatePlayer(afterFirstJoin, player)

    expect(afterSecondJoin.players).toHaveLength(1)
    expect(afterSecondJoin.players[0]).toEqual(player)
  })

  it('updates an existing player instead of duplicating them', () => {
    const initialState: WaitingRoomState = {
      hostId: 'host-1',
      players: [
        {
          id: 'player-1',
          username: 'Khanh',
          avatarUrl: null,
          ready: false,
        },
      ],
    }

    const nextState = addOrUpdatePlayer(initialState, {
      id: 'player-1',
      username: 'Khanh Updated',
      avatarUrl: null,
      ready: true,
    })

    expect(nextState.players).toHaveLength(1)
    expect(nextState.players[0]?.username).toBe('Khanh Updated')
    expect(nextState.players[0]?.ready).toBe(true)
  })

  it('removes a player who leaves the lobby', () => {
    const initialState: WaitingRoomState = {
      hostId: 'host-1',
      players: [
        {
          id: 'host-1',
          username: 'Host',
          avatarUrl: null,
          ready: true,
        },
        {
          id: 'player-1',
          username: 'Player',
          avatarUrl: null,
          ready: false,
        },
      ],
    }

    const nextState = removePlayer(initialState, 'player-1')

    expect(nextState.players).toHaveLength(1)
    expect(nextState.players[0]?.id).toBe('host-1')
  })

  it('updates ready status for a player', () => {
    const initialState: WaitingRoomState = {
      hostId: 'host-1',
      players: [
        {
          id: 'player-1',
          username: 'Player',
          avatarUrl: null,
          ready: false,
        },
      ],
    }

    const nextState = updatePlayerReady(initialState, 'player-1', true)

    expect(nextState.players[0]?.ready).toBe(true)
  })

  it('reports that all players are ready only when every player is ready', () => {
    const notReadyState: WaitingRoomState = {
      hostId: 'host-1',
      players: [
        {
          id: 'host-1',
          username: 'Host',
          avatarUrl: null,
          ready: true,
        },
        {
          id: 'player-1',
          username: 'Player',
          avatarUrl: null,
          ready: false,
        },
      ],
    }

    expect(areAllPlayersReady(notReadyState)).toBe(false)

    const readyState = updatePlayerReady(notReadyState, 'player-1', true)

    expect(areAllPlayersReady(readyState)).toBe(true)
  })

  it('deduplicates players when authoritative game state is restored', () => {
    const state = setAuthoritativeGameState('host-1', [
      {
        id: 'player-1',
        username: 'Old Name',
        avatarUrl: null,
        ready: false,
      },
      {
        id: 'player-1',
        username: 'Updated Name',
        avatarUrl: null,
        ready: true,
      },
    ])

    expect(state.players).toHaveLength(1)
    expect(state.players[0]?.username).toBe('Updated Name')
    expect(state.players[0]?.ready).toBe(true)
  })
})
