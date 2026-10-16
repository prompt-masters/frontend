import type { WebSocketConnectionStatus } from '@/websocket/useWebSocket'

import {
  areAllPlayersReady,
  isHost,
  type WaitingRoomState,
} from './waitingRoomState'

type WaitingRoomPanelProps = {
  roomCode: string
  currentUserId: string
  state: WaitingRoomState
  connectionStatus: WebSocketConnectionStatus
  isReadySubmitting?: boolean
  isStartSubmitting?: boolean
  onReady: () => void
  onStartGame: () => void
}

function getInitials(username: string): string {
  return username
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function WaitingRoomPanel({
  roomCode,
  currentUserId,
  state,
  connectionStatus,
  isReadySubmitting = false,
  isStartSubmitting = false,
  onReady,
  onStartGame,
}: WaitingRoomPanelProps) {
  const currentPlayer = state.players.find(
    (player) => player.id === currentUserId,
  )

  const currentUserIsHost = isHost(state, currentUserId)
  const allPlayersReady = areAllPlayersReady(state)

  const canStartGame =
    currentUserIsHost &&
    allPlayersReady &&
    connectionStatus === 'connected' &&
    !isStartSubmitting

  const canToggleReady =
    Boolean(currentPlayer) &&
    connectionStatus === 'connected' &&
    !isReadySubmitting

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
              Waiting Room
            </p>

            <h1 className="mt-1 text-2xl font-bold">Game Lobby</h1>
          </div>

          <ConnectionStatus status={connectionStatus} />
        </div>

        <div className="py-6 text-center">
          <p className="text-sm text-slate-400">Room code</p>

          <p className="mt-2 text-4xl font-bold tracking-[0.25em] sm:text-5xl">
            {roomCode}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Share this code with other players.
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Players</h2>

            <span className="text-sm text-slate-400">
              {state.players.length}{' '}
              {state.players.length === 1 ? 'player' : 'players'}
            </span>
          </div>

          {state.players.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-slate-400">
              Waiting for players...
            </div>
          ) : (
            <ul className="space-y-3">
              {state.players.map((player) => {
                const playerIsHost = player.id === state.hostId
                const isCurrentPlayer = player.id === currentUserId

                return (
                  <li
                    key={player.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3"
                  >
                    {player.avatarUrl ? (
                      <img
                        src={player.avatarUrl}
                        alt={`${player.username} avatar`}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold"
                      >
                        {getInitials(player.username)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">
                          {player.username}
                        </p>

                        {playerIsHost && (
                          <span className="rounded-full bg-amber-950 px-2 py-0.5 text-xs font-medium text-amber-300">
                            Host
                          </span>
                        )}

                        {isCurrentPlayer && (
                          <span className="text-xs text-slate-500">You</span>
                        )}
                      </div>
                    </div>

                    <span
                      className={
                        player.ready
                          ? 'rounded-full bg-emerald-950 px-3 py-1 text-xs font-medium text-emerald-300'
                          : 'rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400'
                      }
                    >
                      {player.ready ? 'Ready' : 'Not Ready'}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {currentPlayer && (
            <button
              type="button"
              disabled={!canToggleReady}
              onClick={onReady}
              className="w-full rounded-md border border-slate-700 px-4 py-3 font-semibold hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isReadySubmitting
                ? 'Updating...'
                : currentPlayer.ready
                  ? 'Not Ready'
                  : 'Ready'}
            </button>
          )}

          {currentUserIsHost && (
            <button
              type="button"
              disabled={!canStartGame}
              onClick={onStartGame}
              className="w-full rounded-md bg-white px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isStartSubmitting ? 'Starting Game...' : 'Start Game'}
            </button>
          )}

          {currentUserIsHost &&
            !allPlayersReady &&
            state.players.length > 0 && (
              <p className="text-center text-sm text-slate-400">
                All players must be ready before the game can start.
              </p>
            )}
        </div>
      </div>
    </section>
  )
}

function ConnectionStatus({ status }: { status: WebSocketConnectionStatus }) {
  const labels: Record<WebSocketConnectionStatus, string> = {
    connecting: 'Connecting…',
    connected: 'Connected',
    reconnecting: 'Reconnecting…',
    disconnected: 'Disconnected',
  }

  return (
    <div
      role="status"
      className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-sm"
    >
      <span
        aria-hidden="true"
        className={
          status === 'connected'
            ? 'h-2 w-2 rounded-full bg-emerald-400'
            : status === 'reconnecting' || status === 'connecting'
              ? 'h-2 w-2 rounded-full bg-amber-400'
              : 'h-2 w-2 rounded-full bg-red-400'
        }
      />

      {labels[status]}
    </div>
  )
}

export default WaitingRoomPanel
