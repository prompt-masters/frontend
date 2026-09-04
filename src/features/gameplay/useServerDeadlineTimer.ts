import { useEffect, useRef, useState } from 'react'

type UseServerDeadlineTimerOptions = {
  deadline: string
  onExpire?: () => void
}

type ServerDeadlineTimer = {
  remainingSeconds: number
  formattedTime: string
  isWarning: boolean
  isExpired: boolean
}

function getDeadlineMilliseconds(deadline: string): number | null {
  const value = new Date(deadline).getTime()

  return Number.isNaN(value) ? null : value
}

function getRemainingSeconds(
  deadlineMilliseconds: number | null,
  now: number,
): number {
  if (deadlineMilliseconds === null) {
    return 0
  }

  return Math.max(0, Math.ceil((deadlineMilliseconds - now) / 1000))
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0',
  )}`
}

function useServerDeadlineTimer({
  deadline,
  onExpire,
}: UseServerDeadlineTimerOptions): ServerDeadlineTimer {
  const [now, setNow] = useState(() => Date.now())
  const expiredDeadlineRef = useRef<string | null>(null)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 250)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  const deadlineMilliseconds = getDeadlineMilliseconds(deadline)

  const remainingSeconds = getRemainingSeconds(deadlineMilliseconds, now)

  const isExpired = deadlineMilliseconds !== null && remainingSeconds === 0

  useEffect(() => {
    if (!isExpired) {
      return
    }

    if (expiredDeadlineRef.current === deadline) {
      return
    }

    expiredDeadlineRef.current = deadline
    onExpireRef.current?.()
  }, [deadline, isExpired])

  return {
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
    isWarning: remainingSeconds > 0 && remainingSeconds <= 10,
    isExpired,
  }
}

export default useServerDeadlineTimer
