import type { ActiveRound } from './types'

export type RoundSessionState = {
  round: ActiveRound | null
  output: string
  isStreaming: boolean
}

export type RoundSessionEvent =
  | {
      type: 'round_start'
      round: ActiveRound
    }
  | {
      type: 'game_state'
      round: ActiveRound
      output: string
      isStreaming: boolean
    }
  | {
      type: 'test_started'
    }
  | {
      type: 'output_chunk'
      chunk: string
    }
  | {
      type: 'output_complete'
    }
  | {
      type: 'submitted'
      prompt: string
    }

export const initialRoundSessionState: RoundSessionState = {
  round: null,
  output: '',
  isStreaming: false,
}

export function reduceRoundSessionState(
  state: RoundSessionState,
  event: RoundSessionEvent,
): RoundSessionState {
  switch (event.type) {
    case 'round_start':
      return {
        round: event.round,
        output: '',
        isStreaming: false,
      }

    case 'game_state':
      return {
        round: event.round,
        output: event.output,
        isStreaming: event.isStreaming,
      }

    case 'test_started': {
      if (!state.round) {
        return state
      }

      return {
        round: {
          ...state.round,
          testCount: state.round.testCount + 1,
        },
        output: '',
        isStreaming: true,
      }
    }

    case 'output_chunk':
      return {
        ...state,
        output: state.output + event.chunk,
        isStreaming: true,
      }

    case 'output_complete':
      return {
        ...state,
        isStreaming: false,
      }

    case 'submitted':
      if (!state.round) {
        return state
      }

      return {
        ...state,
        round: {
          ...state.round,
          prompt: event.prompt,
          status: 'submitted',
        },
      }

    default:
      return state
  }
}
