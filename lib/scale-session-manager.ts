import { Scale, ScaleType, ScaleSessionState, ScaleSessionSummary } from './types'
import { getAvailableScales, selectRandomScale } from './scale-generator'
import { createScalePracticeSession, addScaleToSession, endScalePracticeSession } from './db'

export async function startSession(
  timeLimit: number,
  enabledScaleTypes: ScaleType[]
): Promise<ScaleSessionState> {
  const availableScales = getAvailableScales(enabledScaleTypes)
  const firstScale = selectRandomScale(availableScales)
  const sessionId = await createScalePracticeSession(timeLimit)

  return {
    sessionId,
    currentScale: firstScale,
    scalesCompleted: 0,
    isActive: true,
    timeLimit,
    availableScales,
  }
}

export async function advanceToNextScale(
  sessionState: ScaleSessionState
): Promise<ScaleSessionState> {
  if (!sessionState.sessionId || !sessionState.currentScale) {
    throw new Error('No active session')
  }

  // Record the current scale
  await addScaleToSession(sessionState.sessionId, sessionState.currentScale.displayName)

  // Select next scale (preventing consecutive duplicates)
  const nextScale = selectRandomScale(sessionState.availableScales, sessionState.currentScale)

  return {
    ...sessionState,
    currentScale: nextScale,
    scalesCompleted: sessionState.scalesCompleted + 1,
  }
}

export async function endSession(
  sessionState: ScaleSessionState
): Promise<ScaleSessionSummary> {
  if (!sessionState.sessionId) {
    throw new Error('No active session')
  }

  // Record the final scale if exists
  if (sessionState.currentScale) {
    await addScaleToSession(sessionState.sessionId, sessionState.currentScale.displayName)
  }

  // Mark session as ended
  await endScalePracticeSession(sessionState.sessionId)

  // Calculate duration (approximate based on scales completed)
  const totalScales = sessionState.scalesCompleted + (sessionState.currentScale ? 1 : 0)
  const durationMinutes = (totalScales * sessionState.timeLimit) / 60

  return {
    sessionId: sessionState.sessionId,
    scalesCompleted: totalScales,
    durationMinutes: Math.round(durationMinutes * 10) / 10,
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
  }
}
