// Core type definitions for JazzGym Chord Flashcards

// Chord type categories for filtering
export type ChordType =
  | 'Major'
  | 'Minor'
  | 'Dominant'
  | 'Diminished'
  | 'Augmented'
  | 'Suspended'
  | 'Extended'

// All possible chord roots (12 chromatic notes with enharmonic equivalents)
export type ChordRoot =
  | 'C' | 'C#' | 'Db'
  | 'D' | 'D#' | 'Eb'
  | 'E'
  | 'F' | 'F#' | 'Gb'
  | 'G' | 'G#' | 'Ab'
  | 'A' | 'A#' | 'Bb'
  | 'B'

// Chord qualities/extensions
export type ChordQuality =
  // Triads
  | 'maj' | 'min' | 'm'
  // Seventh chords
  | 'maj7' | 'm7' | '7'
  | 'm7b5' | 'dim' | 'dim7'
  | 'aug'
  // Suspended
  | 'sus2' | 'sus4' | '7sus4'
  // Extended (9th, 11th, 13th)
  | 'maj9' | 'm9' | '9'
  | 'maj11' | 'm11' | '11'
  | 'maj13' | 'm13' | '13'
  // Altered
  | '7#9' | '7b9' | '7#5' | '7b5' | 'alt'
  | 'maj7#5'

// Chord structure (in-memory, not stored in database)
export interface Chord {
  root: ChordRoot
  quality: ChordQuality
  type: ChordType
  displayName: string // e.g., "Cmaj7", "F#m7b5"
}

// User preferences (database: preferences table)
export interface Preferences {
  id: 1 // Singleton pattern
  timeLimit: number // 3-60 seconds
  enabledChordTypes: ChordType[]
}

// Practice session (database: practice_sessions table)
export interface PracticeSession {
  id: number
  startedAt: string // ISO 8601 timestamp
  endedAt: string | null // ISO 8601 timestamp or null if active
  chordCount: number
  timeLimit: number // Snapshot of time_limit at session start
}

// Session chord (database: session_chords table)
export interface SessionChord {
  id: number
  sessionId: number
  chordName: string
  displayedAt: string // ISO 8601 timestamp
}

// Session state (in-memory for active practice session)
export interface SessionState {
  sessionId: number | null
  currentChord: Chord | null
  chordsCompleted: number
  isActive: boolean
  timeLimit: number
  availableChords: Chord[]
}

// Session summary (returned when session ends)
export interface SessionSummary {
  sessionId: number
  chordsCompleted: number
  durationMinutes: number
  startedAt: string
  endedAt: string
}

// Practice statistics (aggregated from all sessions)
export interface PracticeStats {
  totalSessions: number
  totalChords: number
  totalMinutes: number
}

// Session details (session + all chords)
export interface SessionDetails extends PracticeSession {
  chords: SessionChord[]
}
