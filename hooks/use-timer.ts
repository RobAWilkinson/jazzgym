'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface UseTimerReturn {
  timeLeft: number
  isRunning: boolean
  pause: () => void
  resume: () => void
  reset: (newTime?: number) => void
}

export function useTimer(
  initialSeconds: number,
  onComplete: () => void
): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onCompleteRef = useRef(onComplete)

  // Keep onComplete ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!isRunning) return

    if (timeLeft <= 0) {
      onCompleteRef.current()
      setIsRunning(false)
      return
    }

    // Use 100ms precision for smooth countdown
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 0.1
        return next > 0 ? next : 0
      })
    }, 100)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timeLeft, isRunning])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const resume = useCallback(() => {
    setIsRunning(true)
  }, [])

  const reset = useCallback((newTime?: number) => {
    setTimeLeft(newTime ?? initialSeconds)
    setIsRunning(true)
  }, [initialSeconds])

  // Return rounded seconds for display
  return {
    timeLeft: Math.ceil(timeLeft),
    isRunning,
    pause,
    resume,
    reset,
  }
}
