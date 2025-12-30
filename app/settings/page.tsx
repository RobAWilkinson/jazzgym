'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { ChordFilter } from '@/components/chord-filter'
import { usePreferences } from '@/hooks/use-preferences'
import { ChordType } from '@/lib/types'

export default function SettingsPage() {
  const router = useRouter()
  const { preferences, loading, error, updatePreferences } = usePreferences()

  const [timeLimit, setTimeLimit] = useState<number>(10)
  const [enabledChordTypes, setEnabledChordTypes] = useState<ChordType[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Initialize form values from preferences
  useEffect(() => {
    if (preferences) {
      setTimeLimit(preferences.timeLimit)
      setEnabledChordTypes(preferences.enabledChordTypes)
    }
  }, [preferences])

  // Track changes
  useEffect(() => {
    if (preferences) {
      const hasTimeChange = timeLimit !== preferences.timeLimit
      const hasChordTypesChange = JSON.stringify(enabledChordTypes.sort()) !== JSON.stringify([...preferences.enabledChordTypes].sort())
      setHasChanges(hasTimeChange || hasChordTypesChange)
    }
  }, [timeLimit, enabledChordTypes, preferences])

  const handleSave = async () => {
    setSaveError(null)
    setSaveSuccess(false)

    // Validation
    if (timeLimit < 3 || timeLimit > 60) {
      setSaveError('Time limit must be between 3 and 60 seconds')
      return
    }

    if (enabledChordTypes.length === 0) {
      setSaveError('At least one chord type must be selected')
      return
    }

    const success = await updatePreferences({
      timeLimit,
      enabledChordTypes,
    })

    if (success) {
      setSaveSuccess(true)
      setHasChanges(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } else {
      setSaveError('Failed to save preferences. Please try again.')
    }
  }

  const handleCancel = () => {
    // Reset to current preferences
    if (preferences) {
      setTimeLimit(preferences.timeLimit)
      setEnabledChordTypes(preferences.enabledChordTypes)
      setHasChanges(false)
      setSaveError(null)
    }
  }

  const handleBack = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading preferences...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading preferences: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Customize your practice session preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Practice Session Settings</CardTitle>
            <CardDescription>
              Configure the default time limit and chord types for your practice sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Time Limit */}
            <div className="space-y-2">
              <Label htmlFor="time-limit">
                Time Limit per Chord (seconds)
              </Label>
              <Input
                id="time-limit"
                type="number"
                min={3}
                max={60}
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 10)}
                className="w-32"
              />
              <p className="text-sm text-muted-foreground">
                Choose between 3 and 60 seconds per chord
              </p>
            </div>

            {/* Chord Filter */}
            <div className="space-y-2">
              <Label>Enabled Chord Types</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Select which chord types to include in your practice sessions
              </p>
              <ChordFilter
                selectedTypes={enabledChordTypes}
                onChange={setEnabledChordTypes}
              />
            </div>

            {/* Error/Success Messages */}
            {saveError && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="p-3 rounded-md bg-green-100 text-green-800 text-sm">
                Settings saved successfully!
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back to Practice
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={!hasChanges}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
              >
                Save Changes
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
