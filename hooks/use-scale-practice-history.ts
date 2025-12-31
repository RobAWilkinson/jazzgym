'use client'

import { useState, useEffect, useCallback } from 'react'
import { ScalePracticeSession, ScalePracticeStats, ScaleSessionDetails } from '@/lib/types'
import {
  getScalePracticeHistory,
  getScalePracticeStats,
  getScaleSessionDetails,
  deleteScaleSession,
  clearAllScaleHistory,
} from '@/lib/db'

export function useScalePracticeHistory() {
  const [history, setHistory] = useState<ScalePracticeSession[]>([])
  const [stats, setStats] = useState<ScalePracticeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load history and stats
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [historyData, statsData] = await Promise.all([
        getScalePracticeHistory(),
        getScalePracticeStats(),
      ])

      setHistory(historyData)
      setStats(statsData)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to load scale practice history:', err)
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
      await deleteScaleSession(sessionId)

      // Refresh history and stats
      await loadHistory()
      return true
    } catch (err) {
      setError(err as Error)
      console.error('Failed to delete scale session:', err)
      return false
    }
  }, [loadHistory])

  // Clear all history
  const clearAll = useCallback(async (): Promise<boolean> => {
    try {
      setError(null)
      await clearAllScaleHistory()

      // Refresh history and stats
      await loadHistory()
      return true
    } catch (err) {
      setError(err as Error)
      console.error('Failed to clear scale history:', err)
      return false
    }
  }, [loadHistory])

  // Get details for a specific session
  const getDetails = useCallback(async (sessionId: number): Promise<ScaleSessionDetails | null> => {
    try {
      return await getScaleSessionDetails(sessionId)
    } catch (err) {
      console.error('Failed to get scale session details:', err)
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
