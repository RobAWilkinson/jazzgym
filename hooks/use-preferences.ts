'use client'

import { useState, useEffect, useCallback } from 'react'
import { Preferences, ChordType } from '@/lib/types'
import { getPreferences, updatePreferences } from '@/lib/db'

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true)
        setError(null)
        const prefs = await getPreferences()
        setPreferences(prefs)
      } catch (err) {
        setError(err as Error)
        console.error('Failed to load preferences:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [])

  // Update preferences with optimistic updates
  const update = useCallback(async (updates: Partial<Preferences>): Promise<boolean> => {
    if (!preferences) return false

    try {
      setError(null)

      // Optimistic update
      const updatedPrefs = { ...preferences, ...updates }
      setPreferences(updatedPrefs)

      // Persist to database
      await updatePreferences(updates)
      return true
    } catch (err) {
      setError(err as Error)
      console.error('Failed to update preferences:', err)

      // Rollback optimistic update on error
      // Reload from database to get correct state
      try {
        const prefs = await getPreferences()
        setPreferences(prefs)
      } catch (reloadErr) {
        console.error('Failed to reload preferences after error:', reloadErr)
      }

      return false
    }
  }, [preferences])

  // Update time limit
  const updateTimeLimit = useCallback(async (timeLimit: number): Promise<boolean> => {
    return await update({ timeLimit })
  }, [update])

  // Update enabled chord types
  const updateEnabledChordTypes = useCallback(async (enabledChordTypes: ChordType[]): Promise<boolean> => {
    return await update({ enabledChordTypes })
  }, [update])

  return {
    preferences,
    loading,
    error,
    updatePreferences: update,
    updateTimeLimit,
    updateEnabledChordTypes,
  }
}
