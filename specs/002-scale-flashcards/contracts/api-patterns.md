# API Patterns: Scale Flashcards

**Feature**: 002-scale-flashcards
**Date**: 2025-12-30
**Purpose**: Define internal API patterns for scale practice functionality

## Overview

This document defines the internal API patterns for the scale flashcard feature. These are **not** REST/HTTP endpoints but TypeScript function signatures and React hooks that make up the internal API of the application. The patterns mirror the chord flashcard implementation for consistency.

---

## 1. Scale Generator API

### Purpose

Generate random scales based on user preferences (enabled scale types). Prevents consecutive duplicate scales.

### Module

`lib/scale-generator.ts`

### Type Definitions

```typescript
type ScaleRoot =
  | 'C' | 'C#' | 'Db'
  | 'D' | 'D#' | 'Eb'
  | 'E'
  | 'F' | 'F#' | 'Gb'
  | 'G' | 'G#' | 'Ab'
  | 'A' | 'A#' | 'Bb'
  | 'B';

type ScaleType =
  | 'Major'
  | 'Natural Minor'
  | 'Harmonic Minor'
  | 'Melodic Minor'
  | 'Dorian'
  | 'Mixolydian'
  | 'Altered'
  | 'Lydian'      // Optional
  | 'Phrygian'    // Optional
  | 'Locrian';    // Optional

interface Scale {
  root: ScaleRoot;
  type: ScaleType;
  displayName: string; // e.g., "C Major", "F# Harmonic Minor"
}
```

### Functions

#### `getAllScaleTypes(): ScaleType[]`

Returns all available scale types in the application.

**Returns**: Array of all ScaleType values

**Example**:
```typescript
const allTypes = getAllScaleTypes();
// ['Major', 'Natural Minor', 'Harmonic Minor', ...]
```

---

#### `getAvailableScales(enabledTypes: ScaleType[]): Scale[]`

Filters the full scale library to only include scales with enabled types.

**Parameters**:
- `enabledTypes`: Array of ScaleType values to include

**Returns**: Array of Scale objects matching the enabled types

**Validation**:
- Throws error if `enabledTypes` is empty
- Throws error if any type in `enabledTypes` is invalid

**Example**:
```typescript
const scales = getAvailableScales(['Major', 'Natural Minor']);
// Returns all Major and Natural Minor scales across all 12 roots
```

---

#### `selectRandomScale(availableScales: Scale[], previousScale?: Scale): Scale`

Selects a random scale from the available scales, preventing consecutive duplicates.

**Parameters**:
- `availableScales`: Array of Scale objects to choose from
- `previousScale`: Optional previously selected scale (to avoid repeats)

**Returns**: Randomly selected Scale object

**Validation**:
- Throws error if `availableScales` is empty
- If `previousScale` provided and `availableScales.length > 1`, guarantees different scale

**Example**:
```typescript
const scale = selectRandomScale(availableScales, lastScale);
// Returns a random scale different from lastScale (if possible)
```

---

## 2. Scale Preferences API

### Purpose

Manage user's scale practice preferences (enabled scale types, time limit).

### Module

`hooks/use-scale-preferences.ts`

### Hook Signature

```typescript
interface ScalePreferences {
  id: 1; // Always 1 (singleton)
  timeLimit: number; // 3-60 seconds
  enabledScaleTypes: ScaleType[];
}

interface UseScalePreferencesReturn {
  preferences: ScalePreferences | null;
  loading: boolean;
  error: Error | null;
  updatePreferences: (updates: Partial<Omit<ScalePreferences, 'id'>>) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

function useScalePreferences(): UseScalePreferencesReturn;
```

### Database Functions

Module: `lib/db.ts`

#### `loadScalePreferences(): Promise<ScalePreferences>`

Loads scale preferences from database (creates default row if missing).

**Returns**: ScalePreferences object

**Side Effects**: Inserts default preferences if table doesn't exist or is empty

---

#### `updateScalePreferences(updates: Partial<Omit<ScalePreferences, 'id'>>): Promise<void>`

Updates scale preferences in database.

**Parameters**:
- `updates`: Partial ScalePreferences object (id is always 1)

**Validation**:
- `timeLimit`: Must be 3-60 (inclusive)
- `enabledScaleTypes`: Must be valid JSON array of at least 1 ScaleType

**SQL**:
```sql
UPDATE scale_preferences
SET time_limit = ?,
    enabled_scale_types = ?
WHERE id = 1;
```

---

#### `resetScalePreferences(): Promise<void>`

Resets scale preferences to defaults by deleting and re-inserting.

**SQL**:
```sql
DELETE FROM scale_preferences WHERE id = 1;
INSERT INTO scale_preferences (id, time_limit, enabled_scale_types)
VALUES (1, 10, '["Major","Natural Minor","Harmonic Minor","Melodic Minor","Dorian","Mixolydian","Altered"]');
```

---

## 3. Scale Practice Session API

### Purpose

Manage scale practice sessions (start, record scales, end, retrieve history).

### Module

`hooks/use-scale-practice-session.ts`

### Hook Signature

```typescript
interface ScalePracticeSession {
  id: number;
  startedAt: string; // ISO 8601
  endedAt: string | null;
  scaleCount: number;
  timeLimit: number;
}

interface UseScalePracticeSessionReturn {
  currentSession: ScalePracticeSession | null;
  isActive: boolean;
  startSession: (timeLimit: number) => Promise<number>; // Returns session ID
  recordScale: (scaleName: string) => Promise<void>;
  endSession: () => Promise<void>;
  error: Error | null;
}

function useScalePracticeSession(): UseScalePracticeSessionReturn;
```

### Database Functions

Module: `lib/scale-session-manager.ts`

#### `startScaleSession(timeLimit: number): Promise<number>`

Creates a new scale practice session.

**Parameters**:
- `timeLimit`: Time limit in seconds (3-60)

**Returns**: Session ID (number)

**Validation**:
- `timeLimit` must be 3-60

**SQL**:
```sql
INSERT INTO scale_practice_sessions (started_at, time_limit)
VALUES (datetime('now'), ?)
RETURNING id;
```

---

#### `recordScaleInSession(sessionId: number, scaleName: string): Promise<void>`

Records a scale in the current session and increments scale count.

**Parameters**:
- `sessionId`: Active session ID
- `scaleName`: Display name (e.g., "C Major")

**Validation**:
- `sessionId` must exist in scale_practice_sessions
- `scaleName` must be non-empty

**SQL**:
```sql
INSERT INTO scale_session_records (session_id, scale_name, displayed_at)
VALUES (?, ?, datetime('now'));

UPDATE scale_practice_sessions
SET scale_count = scale_count + 1
WHERE id = ?;
```

---

#### `endScaleSession(sessionId: number): Promise<void>`

Marks a scale practice session as complete.

**Parameters**:
- `sessionId`: Session ID to end

**SQL**:
```sql
UPDATE scale_practice_sessions
SET ended_at = datetime('now')
WHERE id = ?;
```

---

#### `getScalePracticeHistory(limit: number = 50): Promise<ScalePracticeSession[]>`

Retrieves recent completed scale practice sessions.

**Parameters**:
- `limit`: Maximum number of sessions to return (default 50)

**Returns**: Array of ScalePracticeSession objects (sorted newest first)

**SQL**:
```sql
SELECT id, started_at, ended_at, scale_count, time_limit
FROM scale_practice_sessions
WHERE ended_at IS NOT NULL
ORDER BY started_at DESC
LIMIT ?;
```

---

#### `getScaleSessionDetails(sessionId: number): Promise<ScaleSessionDetails>`

Retrieves a scale session with full scale list.

**Returns**:
```typescript
interface ScaleSessionDetails extends ScalePracticeSession {
  scales: string[]; // Array of scale names in display order
}
```

**SQL**:
```sql
SELECT
  s.id,
  s.started_at,
  s.ended_at,
  s.scale_count,
  s.time_limit,
  GROUP_CONCAT(r.scale_name, ', ') AS scales
FROM scale_practice_sessions s
LEFT JOIN scale_session_records r ON s.id = r.session_id
WHERE s.id = ?
GROUP BY s.id;
```

---

#### `deleteScaleSession(sessionId: number): Promise<void>`

Deletes a scale practice session (cascades to scale_session_records).

**SQL**:
```sql
DELETE FROM scale_practice_sessions
WHERE id = ?;
-- scale_session_records automatically deleted via CASCADE
```

---

#### `clearScalePracticeHistory(): Promise<void>`

Deletes all scale practice sessions and records.

**SQL**:
```sql
DELETE FROM scale_practice_sessions;
-- scale_session_records automatically deleted via CASCADE
```

---

## 4. Scale Statistics API

### Purpose

Calculate aggregate statistics for scale practice history.

### Module

`lib/db.ts`

#### `getScalePracticeStats(): Promise<ScalePracticeStats>`

Calculates total scale practice statistics.

**Returns**:
```typescript
interface ScalePracticeStats {
  totalSessions: number;
  totalScales: number;
  totalMinutes: number;
}
```

**SQL**:
```sql
SELECT
  COUNT(*) AS total_sessions,
  SUM(scale_count) AS total_scales,
  SUM(
    CAST((julianday(ended_at) - julianday(started_at)) * 24 * 60 AS INTEGER)
  ) AS total_minutes
FROM scale_practice_sessions
WHERE ended_at IS NOT NULL;
```

---

## 5. React Hook Patterns

### Timer Integration

Reuse existing `useTimer` hook from chord practice:

```typescript
import { useTimer } from '@/hooks/use-timer';

// In scale practice component
const { timeLeft, isRunning, pause, resume } = useTimer(
  preferences.timeLimit,
  handleNextScale
);
```

**Contract**: Timer automatically starts on mount, calls `handleNextScale` when reaching 0.

---

### Scale Practice Flow

```typescript
// Example usage in app/scales/page.tsx
const { preferences } = useScalePreferences();
const { startSession, recordScale, endSession } = useScalePracticeSession();
const [currentScale, setCurrentScale] = useState<Scale | null>(null);

const handleStart = async () => {
  const sessionId = await startSession(preferences.timeLimit);
  showNextScale();
};

const showNextScale = () => {
  const availableScales = getAvailableScales(preferences.enabledScaleTypes);
  const scale = selectRandomScale(availableScales, currentScale);
  setCurrentScale(scale);
  recordScale(scale.displayName);
};

const handleEnd = async () => {
  await endSession();
  // Show summary
};
```

---

## 6. Validation Rules

### Input Validation

All database functions validate inputs:

- **timeLimit**: 3-60 (inclusive)
- **enabledScaleTypes**: Non-empty array of valid ScaleType values
- **scaleName**: Non-empty string
- **sessionId**: Must reference existing session

### Error Handling

All async functions throw errors on validation failures:

```typescript
if (timeLimit < 3 || timeLimit > 60) {
  throw new Error('Time limit must be between 3 and 60 seconds');
}

if (!enabledScaleTypes.length) {
  throw new Error('At least one scale type must be enabled');
}
```

React hooks catch errors and expose via `error` state:

```typescript
const { preferences, error } = useScalePreferences();

if (error) {
  // Display error UI
}
```

---

## 7. Data Flow Summary

### Session Start Flow

```text
User clicks "Start Practice"
  ↓
useScalePreferences() → Load enabled scale types
  ↓
useScalePracticeSession().startSession(timeLimit)
  ↓
Database: INSERT INTO scale_practice_sessions
  ↓
Returns session ID → Component state
  ↓
getAvailableScales(enabledTypes) → Filter SCALE_LIBRARY
  ↓
selectRandomScale(availableScales) → Pick random scale
  ↓
Display scale name + start timer
```

### Scale Advancement Flow

```text
Timer reaches 0 (or user clicks Next)
  ↓
recordScale(currentScale.displayName)
  ↓
Database: INSERT INTO scale_session_records + UPDATE scale_count
  ↓
selectRandomScale(availableScales, currentScale)
  ↓
Display new scale name + restart timer
```

### Session End Flow

```text
User clicks "End Session"
  ↓
endSession()
  ↓
Database: UPDATE scale_practice_sessions SET ended_at
  ↓
Fetch session details (scale count, duration)
  ↓
Display session summary
```

---

## Summary

The scale practice API mirrors the chord practice API for consistency:

- **Generator**: Pure functions for scale selection logic
- **Preferences**: React hook + database functions for settings
- **Session Management**: React hook + database functions for practice tracking
- **Statistics**: Database queries for aggregate data
- **Validation**: All inputs validated at function boundaries

**Pattern Consistency**: All database functions are async, all throw on validation errors, all React hooks expose loading/error states.

**Testing Strategy**: Unit test generators with mock data, integration test hooks with test database, E2E test full flows with Playwright.

**Next**: Create quickstart.md with manual testing scenarios.
