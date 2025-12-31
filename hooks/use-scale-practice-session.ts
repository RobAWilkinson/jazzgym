'use client'

import { useState, useCallback } from 'react'
import { ScaleSessionState, ScaleSessionSummary, ScaleType } from '@/lib/types'
import { startSession, advanceToNextScale, endSession } from '@/lib/scale-session-manager'

export function useScalePracticeSession() {
  const [session, setSession] = useState<ScaleSessionState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const startPractice = useCallback(async (timeLimit: number, enabledTypes: ScaleType[]) => {
    try {
      setLoading(true)
      setError(null)
      const newSession = await startSession(timeLimit, enabledTypes)
      setSession(newSession)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to start scale session:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const advanceScale = useCallback(async () => {
    if (!session) return

    try {
      setLoading(true)
      setError(null)
      const updatedSession = await advanceToNextScale(session)
      setSession(updatedSession)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to advance scale:', err)
    } finally {
      setLoading(false)
    }
  }, [session])

  const endPractice = useCallback(async (): Promise<ScaleSessionSummary | null> => {
    if (!session) return null

    try {
      setLoading(true)
      setError(null)
      const summary = await endSession(session)
      setSession(null)
      return summary
    } catch (err) {
      setError(err as Error)
      console.error('Failed to end scale session:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [session])

  return {
    session,
    loading,
    error,
    startPractice,
    advanceScale,
    endPractice,
  }
}
