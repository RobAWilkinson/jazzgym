'use client'

import { useState, useCallback } from 'react'
import { SessionState, SessionSummary, ChordType } from '@/lib/types'
import { startSession, advanceToNextChord, endSession } from '@/lib/session-manager'

export function usePracticeSession() {
  const [session, setSession] = useState<SessionState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const startPractice = useCallback(async (timeLimit: number, enabledTypes: ChordType[]) => {
    try {
      setLoading(true)
      setError(null)
      const newSession = await startSession(timeLimit, enabledTypes)
      setSession(newSession)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to start session:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const advanceChord = useCallback(async () => {
    if (!session) return

    try {
      setLoading(true)
      setError(null)
      const updatedSession = await advanceToNextChord(session)
      setSession(updatedSession)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to advance chord:', err)
    } finally {
      setLoading(false)
    }
  }, [session])

  const endPractice = useCallback(async (): Promise<SessionSummary | null> => {
    if (!session) return null

    try {
      setLoading(true)
      setError(null)
      const summary = await endSession(session)
      setSession(null)
      return summary
    } catch (err) {
      setError(err as Error)
      console.error('Failed to end session:', err)
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
    advanceChord,
    endPractice,
  }
}
