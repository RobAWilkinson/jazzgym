'use client'

import { useState, useEffect, useCallback } from 'react'
import { PracticeSession, PracticeStats, SessionDetails } from '@/lib/types'
import {
  getPracticeHistory,
  getPracticeStats,
  getSessionDetails,
  deleteSession,
  clearAllHistory,
} from '@/lib/db'

export function usePracticeHistory() {
  const [history, setHistory] = useState<PracticeSession[]>([])
  const [stats, setStats] = useState<PracticeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load history and stats
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [historyData, statsData] = await Promise.all([
        getPracticeHistory(),
        getPracticeStats(),
      ])

      setHistory(historyData)
      setStats(statsData)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to load practice history:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load on mount
  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Delete a single session
  const remove = useCallback(async (sessionId: number): Promise<boolean> => {
    try {
      setError(null)
      await deleteSession(sessionId)

      // Refresh history and stats
      await loadHistory()
      return true
    } catch (err) {
      setError(err as Error)
      console.error('Failed to delete session:', err)
      return false
    }
  }, [loadHistory])

  // Clear all history
  const clearAll = useCallback(async (): Promise<boolean> => {
    try {
      setError(null)
      await clearAllHistory()

      // Refresh history and stats
      await loadHistory()
      return true
    } catch (err) {
      setError(err as Error)
      console.error('Failed to clear history:', err)
      return false
    }
  }, [loadHistory])

  // Get details for a specific session
  const getDetails = useCallback(async (sessionId: number): Promise<SessionDetails | null> => {
    try {
      return await getSessionDetails(sessionId)
    } catch (err) {
      console.error('Failed to get session details:', err)
      return null
    }
  }, [])

  return {
    history,
    stats,
    loading,
    error,
    deleteSession: remove,
    clearAllHistory: clearAll,
    getSessionDetails: getDetails,
    refresh: loadHistory,
  }
}
