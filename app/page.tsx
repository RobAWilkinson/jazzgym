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

export default function Home() {
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
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {!session ? (
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Ready to Practice?</h2>
              <p className="text-muted-foreground">
                Start a practice session to work on your jazz chord recognition
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleStartSession}
              disabled={!preferences}
              className="text-lg px-8 py-6"
            >
              Start Practice
            </Button>
            {preferences && (
              <p className="text-sm text-muted-foreground">
                Time limit: {preferences.timeLimit}s per chord
              </p>
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

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={advanceChord}
                disabled={loading}
              >
                Next Chord
              </Button>
              <Button
                variant="destructive"
                onClick={handleEndSession}
                disabled={loading}
              >
                End Session
              </Button>
            </div>

            <div className="text-center text-muted-foreground">
              <p>Chords completed: {session.chordsCompleted}</p>
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
