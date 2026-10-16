export type WaitingRoomPlayer = {
  id: string
  username: string
  avatarUrl: string | null
  ready: boolean
}

export type WaitingRoomState = {
  hostId: string | null
  players: WaitingRoomPlayer[]
}

export const initialWaitingRoomState: WaitingRoomState = {
  hostId: null,
  players: [],
}

function upsertPlayer(
  players: WaitingRoomPlayer[],
  player: WaitingRoomPlayer,
): WaitingRoomPlayer[] {
  const existingIndex = players.findIndex(
    (existingPlayer) => existingPlayer.id === player.id,
  )

  if (existingIndex === -1) {
    return [...players, player]
  }

  return players.map((existingPlayer) =>
    existingPlayer.id === player.id
      ? {
          ...existingPlayer,
          ...player,
        }
      : existingPlayer,
  )
}

export function setAuthoritativeGameState(
  hostId: string,
  players: WaitingRoomPlayer[],
): WaitingRoomState {
  const uniquePlayers = players.reduce<WaitingRoomPlayer[]>(
    (result, player) => upsertPlayer(result, player),
    [],
  )

  return {
    hostId,
    players: uniquePlayers,
  }
}

export function addOrUpdatePlayer(
  state: WaitingRoomState,
  player: WaitingRoomPlayer,
): WaitingRoomState {
  return {
    ...state,
    players: upsertPlayer(state.players, player),
  }
}

export function removePlayer(
  state: WaitingRoomState,
  playerId: string,
): WaitingRoomState {
  return {
    ...state,
    players: state.players.filter((player) => player.id !== playerId),
  }
}

export function updatePlayerReady(
  state: WaitingRoomState,
  playerId: string,
  ready: boolean,
): WaitingRoomState {
  return {
    ...state,
    players: state.players.map((player) =>
      player.id === playerId
        ? {
            ...player,
            ready,
          }
        : player,
    ),
  }
}

export function areAllPlayersReady(state: WaitingRoomState): boolean {
  return (
    state.players.length > 0 && state.players.every((player) => player.ready)
  )
}

export function isHost(
  state: WaitingRoomState,
  userId: string | undefined,
): boolean {
  return Boolean(userId && state.hostId === userId)
}
