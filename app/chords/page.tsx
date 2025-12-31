'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChordDisplay } from '@/components/chord-display'
import { CountdownTimer } from '@/components/countdown-timer'
import { SessionSummary } from '@/components/session-summary'
import { usePracticeSession } from '@/hooks/use-practice-session'
import { useTimer } from '@/hooks/use-timer'
import { getPreferences } from '@/lib/db'
import type { Preferences, SessionSummary as SessionSummaryType } from '@/lib/types'

export default function ChordPracticePage() {
  const { session, loading, startPractice, advanceChord, endPractice } = usePracticeSession()
  const [preferences, setPreferences] = useState<Preferences | null>(null)
  const [summary, setSummary] = useState<SessionSummaryType | null>(null)
  const [showSummary, setShowSummary] = useState(false)

  // Load preferences on mount
  useEffect(() => {
    getPreferences().then(setPreferences).catch(console.error)
  }, [])

  // Timer for auto-advancing chords
  const { timeLeft, reset: resetTimer } = useTimer(
    session?.timeLimit ?? 10,
    () => {
      if (session) {
        advanceChord()
      }
    }
  )

  // Reset timer when chord changes
  useEffect(() => {
    if (session?.currentChord) {
      resetTimer(session.timeLimit)
    }
  }, [session?.currentChord, session?.timeLimit, resetTimer])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent shortcuts if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        if (session) {
          advanceChord()
        } else if (preferences) {
          handleStartSession()
        }
      } else if (event.key === 'Escape' && session) {
        event.preventDefault()
        handleEndSession()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [session, preferences, advanceChord])

  const handleStartSession = async () => {
    if (!preferences) return

    await startPractice(preferences.timeLimit, preferences.enabledChordTypes)
  }

  const handleEndSession = async () => {
    const result = await endPractice()
    if (result) {
      setSummary(result)
      setShowSummary(true)
    }
  }

  if (loading && !session) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-48 bg-muted rounded"></div>
            <div className="h-10 w-32 bg-muted rounded"></div>
          </div>
          <p className="text-muted-foreground" role="status" aria-live="polite">Loading practice session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {!session ? (
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Ready to Practice Chords?</h2>
              <p className="text-muted-foreground">
                Start a practice session to work on your jazz chord recognition
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleStartSession}
              disabled={!preferences}
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 min-h-[56px]"
            >
              Start Practice
            </Button>
            {preferences && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Time limit: {preferences.timeLimit}s per chord</p>
                <p className="text-xs">Press Space or Enter to start</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-6">
              <ChordDisplay chordName={session.currentChord?.displayName ?? ''} />
              <CountdownTimer
                timeLeft={timeLeft}
                totalTime={session.timeLimit}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={advanceChord}
                disabled={loading}
                className="w-full sm:w-auto min-h-[44px]"
              >
                Next Chord
              </Button>
              <Button
                variant="destructive"
                onClick={handleEndSession}
                disabled={loading}
                className="w-full sm:w-auto min-h-[44px]"
              >
                End Session
              </Button>
            </div>

            <div className="text-center text-muted-foreground space-y-2">
              <p>Chords completed: {session.chordsCompleted}</p>
              <p className="text-xs">
                Keyboard shortcuts: Space/Enter = Next • Esc = End Session
              </p>
            </div>
          </>
        )}

        <SessionSummary
          summary={summary}
          open={showSummary}
          onClose={() => setShowSummary(false)}
        />
      </div>
    </div>
  )
}
