'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChordFilter } from '@/components/chord-filter'
import { usePreferences } from '@/hooks/use-preferences'
import { ChordType } from '@/lib/types'

export default function SettingsPage() {
  const router = useRouter()
  const { preferences, loading, error, updatePreferences } = usePreferences()

  const [timeLimit, setTimeLimit] = useState<number>(10)
  const [enabledChordTypes, setEnabledChordTypes] = useState<ChordType[]>([])
  const [hasChanges, setHasChanges] = useState(false)

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
    // Validation
    if (timeLimit < 3 || timeLimit > 60) {
      toast.error('Time limit must be between 3 and 60 seconds')
      return
    }

    if (enabledChordTypes.length === 0) {
      toast.error('At least one chord type must be selected')
      return
    }

    const success = await updatePreferences({
      timeLimit,
      enabledChordTypes,
    })

    if (success) {
      toast.success('Settings saved successfully!')
      setHasChanges(false)
    } else {
      toast.error('Failed to save preferences. Please try again.')
    }
  }

  const handleCancel = () => {
    // Reset to current preferences
    if (preferences) {
      setTimeLimit(preferences.timeLimit)
      setEnabledChordTypes(preferences.enabledChordTypes)
      setHasChanges(false)
    }
  }

  const handleBack = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-96" />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>
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
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
            <Button variant="outline" onClick={handleBack} className="w-full sm:w-auto min-h-[44px]">
              Back to Practice
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={!hasChanges}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                className="min-h-[44px]"
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
