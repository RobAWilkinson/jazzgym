# Internal API Patterns: Chord Flashcards

**Feature**: 001-chord-flashcards
**Date**: 2025-12-30
**Purpose**: Define internal function interfaces and data flow patterns

## Overview

This document defines the internal API patterns for the chord flashcard application. Since this is a client-side application with local SQLite storage, there are **no external HTTP APIs**. Instead, this document specifies:

1. Database access layer interfaces (lib/db.ts)
2. Business logic interfaces (lib/chord-generator.ts, lib/session-manager.ts)
3. React hook interfaces (hooks/)

---

## 1. Database Access Layer (lib/db.ts)

### Interface: Database Operations

#### `initializeDatabase()`

Initialize SQLite database with schema (runs on first app load).

**Parameters**: None

**Returns**: `Promise<void>`

**Side Effects**: Creates tables, inserts default preferences if not exist

**Example**:
```typescript
await initializeDatabase();
```

---

#### `getPreferences()`

Retrieve user preferences.

**Parameters**: None

**Returns**: `Promise<Preferences>`

**Example**:
```typescript
const prefs = await getPreferences();
// { id: 1, timeLimit: 10, enabledChordTypes: ['Major', 'Minor', ...] }
```

---

#### `updatePreferences(prefs: Partial<Preferences>)`

Update user preferences.

**Parameters**:
- `prefs`: Partial preferences object (only fields to update)

**Returns**: `Promise<void>`

**Validation**:
- If `timeLimit` provided: must be 3-60
- If `enabledChordTypes` provided: must be non-empty array of valid ChordType

**Example**:
```typescript
await updatePreferences({
  timeLimit: 15,
  enabledChordTypes: ['Major', 'Dominant']
});
```

---

#### `createPracticeSession(timeLimit: number)`

Start a new practice session.

**Parameters**:
- `timeLimit`: Time limit in seconds (3-60)

**Returns**: `Promise<number>` (session ID)

**Side Effects**: Inserts new row in practice_sessions

**Example**:
```typescript
const sessionId = await createPracticeSession(10);
// Returns: 42
```

---

#### `addChordToSession(sessionId: number, chordName: string)`

Record a chord displayed during practice.

**Parameters**:
- `sessionId`: ID of active session
- `chordName`: Chord display name (e.g., "Cmaj7")

**Returns**: `Promise<void>`

**Side Effects**:
- Inserts row in session_chords
- Increments chord_count in practice_sessions

**Example**:
```typescript
await addChordToSession(42, 'Cmaj7');
```

---

#### `endPracticeSession(sessionId: number)`

Mark session as complete.

**Parameters**:
- `sessionId`: ID of session to end

**Returns**: `Promise<void>`

**Side Effects**: Sets ended_at to current timestamp

**Example**:
```typescript
await endPracticeSession(42);
```

---

#### `getPracticeHistory(limit: number = 50)`

Retrieve list of completed practice sessions.

**Parameters**:
- `limit`: Maximum sessions to return (default 50)

**Returns**: `Promise<PracticeSession[]>`

**Example**:
```typescript
const history = await getPracticeHistory(10);
// Returns: [ { id: 42, startedAt: '...', endedAt: '...', chordCount: 15, ... }, ... ]
```

---

#### `getSessionDetails(sessionId: number)`

Get full session details including chord list.

**Parameters**:
- `sessionId`: ID of session

**Returns**: `Promise<SessionDetails>`

**Type**:
```typescript
interface SessionDetails extends PracticeSession {
  chords: SessionChord[];
}
```

**Example**:
```typescript
const details = await getSessionDetails(42);
// {
//   id: 42,
//   startedAt: '...',
//   endedAt: '...',
//   chordCount: 15,
//   timeLimit: 10,
//   chords: [
//     { id: 1, sessionId: 42, chordName: 'Cmaj7', displayedAt: '...' },
//     { id: 2, sessionId: 42, chordName: 'Fm7', displayedAt: '...' },
//     ...
//   ]
// }
```

---

#### `getPracticeStats()`

Calculate aggregate statistics across all sessions.

**Parameters**: None

**Returns**: `Promise<PracticeStats>`

**Type**:
```typescript
interface PracticeStats {
  totalSessions: number;
  totalChords: number;
  totalMinutes: number;
}
```

**Example**:
```typescript
const stats = await getPracticeStats();
// { totalSessions: 25, totalChords: 375, totalMinutes: 180 }
```

---

#### `deleteSession(sessionId: number)`

Delete a practice session and its chords.

**Parameters**:
- `sessionId`: ID of session to delete

**Returns**: `Promise<void>`

**Side Effects**: Deletes session and associated chords (CASCADE)

**Example**:
```typescript
await deleteSession(42);
```

---

#### `clearAllHistory()`

Delete all practice sessions.

**Parameters**: None

**Returns**: `Promise<void>`

**Side Effects**: Deletes all rows from practice_sessions and session_chords

**Example**:
```typescript
await clearAllHistory();
```

---

## 2. Chord Generation (lib/chord-generator.ts)

### Interface: Chord Selection Logic

#### `getAvailableChords(enabledTypes: ChordType[])`

Filter chord library by enabled types.

**Parameters**:
- `enabledTypes`: Array of ChordType to include

**Returns**: `Chord[]`

**Validation**:
- If `enabledTypes` is empty, throws Error('No chord types selected')

**Example**:
```typescript
const chords = getAvailableChords(['Major', 'Minor']);
// Returns: [ { root: 'C', quality: 'maj7', type: 'Major', ... }, ... ]
```

---

#### `selectRandomChord(availableChords: Chord[])`

Select random chord from available pool.

**Parameters**:
- `availableChords`: Array of chords to choose from

**Returns**: `Chord`

**Validation**:
- If `availableChords` is empty, throws Error('No chords available')

**Example**:
```typescript
const chord = selectRandomChord(chords);
// Returns: { root: 'F#', quality: 'm7', type: 'Minor', displayName: 'F#m7' }
```

---

#### `getAllChordTypes()`

Get list of all available chord type categories.

**Parameters**: None

**Returns**: `ChordType[]`

**Example**:
```typescript
const types = getAllChordTypes();
// Returns: ['Major', 'Minor', 'Dominant', 'Diminished', 'Augmented', 'Suspended', 'Extended']
```

---

## 3. Session Management (lib/session-manager.ts)

### Interface: Practice Session State

#### `startSession(timeLimit: number, enabledChordTypes: ChordType[])`

Initialize a new practice session.

**Parameters**:
- `timeLimit`: Seconds per chord (3-60)
- `enabledChordTypes`: Chord types to practice

**Returns**: `Promise<SessionState>`

**Type**:
```typescript
interface SessionState {
  sessionId: number;
  currentChord: Chord | null;
  chordsCompleted: number;
  isActive: boolean;
  timeLimit: number;
}
```

**Side Effects**:
- Creates new session in database
- Generates first chord

**Example**:
```typescript
const session = await startSession(10, ['Major', 'Minor']);
// {
//   sessionId: 42,
//   currentChord: { root: 'C', quality: 'maj7', ... },
//   chordsCompleted: 0,
//   isActive: true,
//   timeLimit: 10
// }
```

---

#### `advanceToNextChord(sessionState: SessionState)`

Move to next chord in session.

**Parameters**:
- `sessionState`: Current session state

**Returns**: `Promise<SessionState>` (updated state)

**Side Effects**:
- Records previous chord in database
- Generates new random chord
- Increments chordsCompleted

**Example**:
```typescript
const updatedSession = await advanceToNextChord(session);
// {
//   ...session,
//   currentChord: { root: 'Bb', quality: 'm7', ... },
//   chordsCompleted: 1
// }
```

---

#### `endSession(sessionState: SessionState)`

Complete the practice session.

**Parameters**:
- `sessionState`: Current session state

**Returns**: `Promise<SessionSummary>`

**Type**:
```typescript
interface SessionSummary {
  sessionId: number;
  chordsCompleted: number;
  durationMinutes: number;
  startedAt: string;
  endedAt: string;
}
```

**Side Effects**: Marks session as ended in database

**Example**:
```typescript
const summary = await endSession(session);
// {
//   sessionId: 42,
//   chordsCompleted: 15,
//   durationMinutes: 2.5,
//   startedAt: '2025-12-30T14:00:00Z',
//   endedAt: '2025-12-30T14:02:30Z'
// }
```

---

## 4. React Hooks (hooks/)

### `useTimer(initialSeconds: number, onComplete: () => void)`

Countdown timer hook.

**Parameters**:
- `initialSeconds`: Starting time in seconds
- `onComplete`: Callback when timer reaches 0

**Returns**:
```typescript
{
  timeLeft: number;      // Seconds remaining (rounded)
  isRunning: boolean;    // Timer active
  pause: () => void;     // Pause timer
  resume: () => void;    // Resume timer
  reset: (newTime?: number) => void; // Reset to initialSeconds or new time
}
```

**Example**:
```typescript
const { timeLeft, isRunning, pause, reset } = useTimer(10, () => {
  console.log('Time\'s up!');
});
```

---

### `usePreferences()`

User preferences hook.

**Parameters**: None

**Returns**:
```typescript
{
  preferences: Preferences | null;
  loading: boolean;
  error: Error | null;
  updatePreferences: (prefs: Partial<Preferences>) => Promise<void>;
}
```

**Example**:
```typescript
const { preferences, updatePreferences } = usePreferences();

await updatePreferences({ timeLimit: 15 });
```

---

### `usePracticeSession()`

Practice session management hook.

**Parameters**: None

**Returns**:
```typescript
{
  session: SessionState | null;
  loading: boolean;
  error: Error | null;
  startSession: (timeLimit: number, enabledTypes: ChordType[]) => Promise<void>;
  advanceChord: () => Promise<void>;
  endSession: () => Promise<SessionSummary>;
}
```

**Example**:
```typescript
const { session, startSession, advanceChord, endSession } = usePracticeSession();

await startSession(10, ['Major', 'Minor']);
// ... user plays chord ...
await advanceChord(); // Move to next chord
// ... practice continues ...
const summary = await endSession();
```

---

### `usePracticeHistory()`

Practice history hook.

**Parameters**: None

**Returns**:
```typescript
{
  history: PracticeSession[];
  stats: PracticeStats | null;
  loading: boolean;
  error: Error | null;
  deleteSession: (id: number) => Promise<void>;
  clearHistory: () => Promise<void>;
  refreshHistory: () => Promise<void>;
}
```

**Example**:
```typescript
const { history, stats, deleteSession, clearHistory } = usePracticeHistory();

await deleteSession(42);
await clearHistory(); // Delete all
```

---

## Data Flow Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│                         React Components                         │
├─────────────────────────────────────────────────────────────────┤
│  ChordDisplay → CountdownTimer → SessionSummary → PracticeHistory│
└────────────┬──────────────────────────────────────┬─────────────┘
             │                                      │
             ▼                                      ▼
┌────────────────────────┐              ┌─────────────────────────┐
│   React Custom Hooks   │              │   React Custom Hooks    │
├────────────────────────┤              ├─────────────────────────┤
│  usePracticeSession    │              │  usePracticeHistory     │
│  useTimer              │              │  usePreferences         │
└────────────┬───────────┘              └────────────┬────────────┘
             │                                       │
             ▼                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Business Logic (lib/)                        │
├─────────────────────────────────────────────────────────────────┤
│  session-manager.ts  │  chord-generator.ts  │  db.ts             │
│  - startSession      │  - getAvailableChords│  - createSession   │
│  - advanceChord      │  - selectRandomChord │  - addChord        │
│  - endSession        │                      │  - getHistory      │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SQLite Database                             │
├─────────────────────────────────────────────────────────────────┤
│  preferences  │  practice_sessions  │  session_chords           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Error Handling Patterns

### Database Errors

```typescript
try {
  await createPracticeSession(10);
} catch (error) {
  // Log error, show user-friendly message
  console.error('Failed to start practice session:', error);
  toast.error('Unable to start session. Please try again.');
}
```

### Validation Errors

```typescript
function updatePreferences(prefs: Partial<Preferences>) {
  if (prefs.timeLimit && (prefs.timeLimit < 3 || prefs.timeLimit > 60)) {
    throw new Error('Time limit must be between 3 and 60 seconds');
  }

  if (prefs.enabledChordTypes && prefs.enabledChordTypes.length === 0) {
    throw new Error('At least one chord type must be selected');
  }

  // Proceed with update...
}
```

### Empty State Errors

```typescript
function selectRandomChord(chords: Chord[]) {
  if (chords.length === 0) {
    throw new Error('No chords available with current filters. Please enable at least one chord type.');
  }

  // Select random chord...
}
```

---

## Summary

This internal API provides:

- **Database layer**: CRUD operations for preferences, sessions, chords
- **Business logic**: Chord selection, session management
- **React hooks**: UI state management for components

All interfaces follow TypeScript best practices, include validation, and handle edge cases identified in the specification.

**Next**: Create quickstart.md (manual testing scenarios and development workflow).
