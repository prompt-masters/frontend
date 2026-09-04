export type RoundStatus = 'active' | 'submitted' | 'completed'

export type RoundConstraint = {
  id: string
  label: string
}

export type ActiveRound = {
  id: string
  roundNumber: number
  challenge: string
  constraints: RoundConstraint[]
  deadline: string
  testCount: number
  points: number
  prompt: string
  status: RoundStatus
}

export type RoundStreamingState = {
  output: string
  isStreaming: boolean
}

export type RoundOutputEvent =
  | {
      type: 'output_chunk'
      chunk: string
    }
  | {
      type: 'output_complete'
    }

export function reduceRoundOutput(
  state: RoundStreamingState,
  event: RoundOutputEvent,
): RoundStreamingState {
  switch (event.type) {
    case 'output_chunk':
      return {
        output: state.output + event.chunk,
        isStreaming: true,
      }

    case 'output_complete':
      return {
        ...state,
        isStreaming: false,
      }

    default:
      return state
  }
}

export function startNewTest(): RoundStreamingState {
  return {
    output: '',
    isStreaming: true,
  }
}
