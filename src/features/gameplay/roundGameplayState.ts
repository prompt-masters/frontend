export type RoundGameplayState = {
  testCount: number
  output: string
  isStreaming: boolean
}

export type RoundGameplayEvent =
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
      type: 'game_state'
      testCount: number
      output: string
      isStreaming: boolean
    }

export function createRoundGameplayState(
  testCount: number,
  output = '',
): RoundGameplayState {
  return {
    testCount,
    output,
    isStreaming: false,
  }
}

export function reduceRoundGameplayState(
  state: RoundGameplayState,
  event: RoundGameplayEvent,
): RoundGameplayState {
  switch (event.type) {
    case 'test_started':
      return {
        ...state,
        testCount: state.testCount + 1,
        output: '',
        isStreaming: true,
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

    case 'game_state':
      return {
        testCount: event.testCount,
        output: event.output,
        isStreaming: event.isStreaming,
      }

    default:
      return state
  }
}
