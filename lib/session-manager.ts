import { Chord, ChordType, SessionState, SessionSummary } from './types'
import { getAvailableChords, selectRandomChord } from './chord-generator'
import { createPracticeSession, addChordToSession, endPracticeSession } from './db'

export async function startSession(
  timeLimit: number,
  enabledChordTypes: ChordType[]
): Promise<SessionState> {
  const availableChords = getAvailableChords(enabledChordTypes)
  const firstChord = selectRandomChord(availableChords)
  const sessionId = await createPracticeSession(timeLimit)

  return {
    sessionId,
    currentChord: firstChord,
    chordsCompleted: 0,
    isActive: true,
    timeLimit,
    availableChords,
  }
}

export async function advanceToNextChord(
  sessionState: SessionState
): Promise<SessionState> {
  if (!sessionState.sessionId || !sessionState.currentChord) {
    throw new Error('No active session')
  }

  // Record the current chord
  await addChordToSession(sessionState.sessionId, sessionState.currentChord.displayName)

  // Select next chord
  const nextChord = selectRandomChord(sessionState.availableChords)

  return {
    ...sessionState,
    currentChord: nextChord,
    chordsCompleted: sessionState.chordsCompleted + 1,
  }
}

export async function endSession(
  sessionState: SessionState
): Promise<SessionSummary> {
  if (!sessionState.sessionId) {
    throw new Error('No active session')
  }

  // Record the final chord if exists
  if (sessionState.currentChord) {
    await addChordToSession(sessionState.sessionId, sessionState.currentChord.displayName)
  }

  // Mark session as ended
  await endPracticeSession(sessionState.sessionId)

  // Calculate duration (approximate based on chords completed)
  const totalChords = sessionState.chordsCompleted + (sessionState.currentChord ? 1 : 0)
  const durationMinutes = (totalChords * sessionState.timeLimit) / 60

  return {
    sessionId: sessionState.sessionId,
    chordsCompleted: totalChords,
    durationMinutes: Math.round(durationMinutes * 10) / 10,
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
  }
}
