import {
  addOrUpdatePlayer,
  removePlayer,
  setAuthoritativeGameState,
  updatePlayerReady,
  type WaitingRoomPlayer,
  type WaitingRoomState,
} from './waitingRoomState'

/**
 * These are normalized frontend events.
 *
 * When the backend WebSocket contract is available, raw server messages
 * should be mapped into these events before updating UI state.
 */
export type WaitingRoomEvent =
  | {
      type: 'player_joined'
      player: WaitingRoomPlayer
    }
  | {
      type: 'player_left'
      playerId: string
    }
  | {
      type: 'player_ready'
      playerId: string
      ready: boolean
    }
  | {
      type: 'game_state'
      hostId: string
      players: WaitingRoomPlayer[]
    }

export function reduceWaitingRoomEvent(
  state: WaitingRoomState,
  event: WaitingRoomEvent,
): WaitingRoomState {
  switch (event.type) {
    case 'player_joined':
      return addOrUpdatePlayer(state, event.player)

    case 'player_left':
      return removePlayer(state, event.playerId)

    case 'player_ready':
      return updatePlayerReady(state, event.playerId, event.ready)

    case 'game_state':
      return setAuthoritativeGameState(event.hostId, event.players)

    default:
      return state
  }
}
