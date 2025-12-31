'use client'

import { useState, useEffect, useCallback } from 'react'
import { ScalePreferences, ScaleType } from '@/lib/types'
import { loadScalePreferences, updateScalePreferences } from '@/lib/db'

export function useScalePreferences() {
  const [preferences, setPreferences] = useState<ScalePreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load preferences on mount
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        setLoading(true)
        setError(null)
        const prefs = await loadScalePreferences()
        setPreferences(prefs)
      } catch (err) {
        setError(err as Error)
        console.error('Failed to load scale preferences:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPrefs()
  }, [])

  // Update preferences with optimistic updates
  const update = useCallback(async (updates: Partial<Omit<ScalePreferences, 'id'>>): Promise<boolean> => {
    if (!preferences) return false

    try {
      setError(null)

      // Optimistic update
      const updatedPrefs = { ...preferences, ...updates }
      setPreferences(updatedPrefs)

      // Persist to database
      await updateScalePreferences(updates)
      return true
    } catch (err) {
      setError(err as Error)
      console.error('Failed to update scale preferences:', err)

      // Rollback optimistic update on error
      // Reload from database to get correct state
      try {
        const prefs = await loadScalePreferences()
        setPreferences(prefs)
      } catch (reloadErr) {
        console.error('Failed to reload scale preferences after error:', reloadErr)
      }

      return false
    }
  }, [preferences])

  // Update time limit
  const updateTimeLimit = useCallback(async (timeLimit: number): Promise<boolean> => {
    return await update({ timeLimit })
  }, [update])

  // Update enabled scale types
  const updateEnabledScaleTypes = useCallback(async (enabledScaleTypes: ScaleType[]): Promise<boolean> => {
    return await update({ enabledScaleTypes })
  }, [update])

  return {
    preferences,
    loading,
    error,
    updatePreferences: update,
    updateTimeLimit,
    updateEnabledScaleTypes,
  }
}
