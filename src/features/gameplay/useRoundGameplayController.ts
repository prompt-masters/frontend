import { useCallback, useReducer, useState } from 'react'

import {
  createRoundGameplayState,
  reduceRoundGameplayState,
  type RoundGameplayEvent,
} from './roundGameplayState'

type UseRoundGameplayControllerOptions = {
  initialTestCount: number
  initialOutput?: string
  onTestRequest: (prompt: string) => Promise<void>
  onSubmitRequest: (prompt: string) => Promise<void>
}

function useRoundGameplayController({
  initialTestCount,
  initialOutput = '',
  onTestRequest,
  onSubmitRequest,
}: UseRoundGameplayControllerOptions) {
  const [state, dispatch] = useReducer(
    reduceRoundGameplayState,
    createRoundGameplayState(initialTestCount, initialOutput),
  )

  const [isTesting, setIsTesting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const testPrompt = useCallback(
    async (prompt: string) => {
      if (isTesting || isSubmitting) {
        return
      }

      setError('')
      setIsTesting(true)

      try {
        await onTestRequest(prompt)

        dispatch({
          type: 'test_started',
        })
      } catch {
        setError('Unable to test the prompt. Please try again.')
      } finally {
        setIsTesting(false)
      }
    },
    [isSubmitting, isTesting, onTestRequest],
  )

  const submitPrompt = useCallback(
    async (prompt: string) => {
      if (isTesting || isSubmitting) {
        return
      }

      setError('')
      setIsSubmitting(true)

      try {
        await onSubmitRequest(prompt)
      } catch {
        setError('Unable to submit the prompt. Please try again.')
        setIsSubmitting(false)
      }
    },
    [isSubmitting, isTesting, onSubmitRequest],
  )

  const handleServerEvent = useCallback((event: RoundGameplayEvent) => {
    dispatch(event)
  }, [])

  return {
    output: state.output,
    testCount: state.testCount,
    isStreaming: state.isStreaming,
    isTesting,
    isSubmitting,
    error,
    testPrompt,
    submitPrompt,
    handleServerEvent,
  }
}

export default useRoundGameplayController
