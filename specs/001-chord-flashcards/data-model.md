# Data Model: Chord Flashcards

**Feature**: 001-chord-flashcards
**Date**: 2025-12-30
**Purpose**: Define data structures, database schema, and validation rules

## Overview

This document defines the data model for the chord flashcard application, including SQLite schema, TypeScript types, and validation rules.

---

## Entity Relationship Diagram

```text
┌─────────────────┐
│  preferences    │
│  (singleton)    │
└─────────────────┘

┌─────────────────────┐
│  practice_sessions  │
│─────────────────────│
│  id (PK)            │
│  started_at         │
│  ended_at           │
│  chord_count        │
│  time_limit         │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│  session_chords     │
│─────────────────────│
│  id (PK)            │
│  session_id (FK)    │
│  chord_name         │
│  displayed_at       │
└─────────────────────┘
```

---

## 1. Preferences

### Description

Stores user's default settings for practice sessions. Single-row table (only one set of preferences per user).

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Always 1 (singleton pattern) |
| `time_limit` | INTEGER | NOT NULL, DEFAULT 10 | Default seconds per chord (3-60) |
| `enabled_chord_types` | TEXT | NOT NULL | JSON array of enabled ChordType strings |

### SQLite Schema

```sql
CREATE TABLE preferences (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  time_limit INTEGER NOT NULL DEFAULT 10 CHECK (time_limit >= 3 AND time_limit <= 60),
  enabled_chord_types TEXT NOT NULL DEFAULT '["Major","Minor","Dominant","Diminished","Augmented","Suspended","Extended"]'
);

-- Insert default preferences
INSERT INTO preferences (id, time_limit, enabled_chord_types)
VALUES (1, 10, '["Major","Minor","Dominant","Diminished","Augmented","Suspended","Extended"]');
```

### TypeScript Type

```typescript
interface Preferences {
  id: 1;
  timeLimit: number; // 3-60 seconds
  enabledChordTypes: ChordType[];
}

type ChordType =
  | 'Major'
  | 'Minor'
  | 'Dominant'
  | 'Diminished'
  | 'Augmented'
  | 'Suspended'
  | 'Extended';
```

### Validation Rules

- **time_limit**: Must be integer between 3 and 60 (inclusive)
- **enabled_chord_types**: Must be valid JSON array containing at least 1 ChordType
- **id**: Always 1 (enforced by CHECK constraint)

### State Transitions

- **Initial**: Default values on first app load
- **Update**: User modifies settings → UPDATE preferences SET ... WHERE id = 1
- **Reset**: Delete row, trigger re-insert of defaults

---

## 2. Practice Sessions

### Description

Records each practice session with metadata (start/end time, chord count, settings used).

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique session identifier |
| `started_at` | TEXT | NOT NULL | ISO 8601 timestamp (e.g., "2025-12-30T14:23:00.000Z") |
| `ended_at` | TEXT | NULL | ISO 8601 timestamp when session ended (NULL if active) |
| `chord_count` | INTEGER | DEFAULT 0 | Number of chords practiced in this session |
| `time_limit` | INTEGER | NOT NULL | Time limit setting used (seconds per chord) |

### SQLite Schema

```sql
CREATE TABLE practice_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at TEXT,
  chord_count INTEGER NOT NULL DEFAULT 0 CHECK (chord_count >= 0),
  time_limit INTEGER NOT NULL CHECK (time_limit >= 3 AND time_limit <= 60)
);

CREATE INDEX idx_sessions_started ON practice_sessions(started_at DESC);
```

### TypeScript Type

```typescript
interface PracticeSession {
  id: number;
  startedAt: string; // ISO 8601
  endedAt: string | null; // ISO 8601 or null if active
  chordCount: number;
  timeLimit: number; // Snapshot of time_limit at session start
}
```

### Validation Rules

- **started_at**: Must be valid ISO 8601 timestamp
- **ended_at**: Must be valid ISO 8601 timestamp or NULL; if not NULL, must be >= started_at
- **chord_count**: Non-negative integer
- **time_limit**: Must be integer between 3 and 60

### State Transitions

```text
[No Session] → [Active Session] → [Completed Session]
    ^                |                    |
    |                └────────────────────┘
    └─────────────── (start new session)

1. Start Session:
   INSERT INTO practice_sessions (started_at, time_limit)
   VALUES (datetime('now'), <user's time_limit>)

2. Add Chord:
   UPDATE practice_sessions
   SET chord_count = chord_count + 1
   WHERE id = <session_id>

3. End Session:
   UPDATE practice_sessions
   SET ended_at = datetime('now')
   WHERE id = <session_id>
```

---

## 3. Session Chords

### Description

Junction table tracking individual chords displayed during each practice session. Used for detailed history and potential future analytics.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique chord record identifier |
| `session_id` | INTEGER | FOREIGN KEY, NOT NULL | References practice_sessions(id) |
| `chord_name` | TEXT | NOT NULL | Display name (e.g., "Cmaj7", "F#m7b5") |
| `displayed_at` | TEXT | NOT NULL | ISO 8601 timestamp when chord was shown |

### SQLite Schema

```sql
CREATE TABLE session_chords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  chord_name TEXT NOT NULL CHECK (length(chord_name) > 0),
  displayed_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES practice_sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_session_chords_session ON session_chords(session_id);
CREATE INDEX idx_session_chords_displayed ON session_chords(displayed_at);
```

### TypeScript Type

```typescript
interface SessionChord {
  id: number;
  sessionId: number;
  chordName: string; // e.g., "Cmaj7"
  displayedAt: string; // ISO 8601
}
```

### Validation Rules

- **session_id**: Must reference existing practice_sessions.id
- **chord_name**: Non-empty string, valid chord notation (validated by app logic)
- **displayed_at**: Valid ISO 8601 timestamp

### Cascading Deletes

When a practice_session is deleted, all associated session_chords are automatically deleted (ON DELETE CASCADE).

---

## 4. Chord (In-Memory Data Structure)

### Description

**Not stored in database**. Chords are defined as a static TypeScript constant (pre-defined list). This structure is used for chord generation logic.

### TypeScript Type

```typescript
type ChordRoot =
  | 'C' | 'C#' | 'Db'
  | 'D' | 'D#' | 'Eb'
  | 'E'
  | 'F' | 'F#' | 'Gb'
  | 'G' | 'G#' | 'Ab'
  | 'A' | 'A#' | 'Bb'
  | 'B';

type ChordQuality =
  // Triads
  | 'maj' | 'min' | 'm'
  // Seventh chords
  | 'maj7' | 'm7' | '7'
  | 'm7b5' | 'dim' | 'dim7'
  | 'aug'
  // Suspended
  | 'sus2' | 'sus4'
  // Extended
  | 'maj9' | 'm9' | '9'
  | 'maj11' | 'm11' | '11'
  | 'maj13' | 'm13' | '13'
  // Altered
  | '7#9' | '7b9' | '7#5' | '7b5'
  | 'alt'; // Altered dominant (7#9#5, etc.)

interface Chord {
  root: ChordRoot;
  quality: ChordQuality;
  type: ChordType; // Category for filtering
  displayName: string; // Computed: `${root}${quality}`
}

// Example chord definition
const CHORD_LIBRARY: Chord[] = [
  { root: 'C', quality: 'maj7', type: 'Major', displayName: 'Cmaj7' },
  { root: 'C', quality: 'm7', type: 'Minor', displayName: 'Cm7' },
  { root: 'C', quality: '7', type: 'Dominant', displayName: 'C7' },
  // ... ~300 total chords (12 roots × ~25 qualities)
];
```

### Chord Type Categories

| Type | Description | Example Qualities |
|------|-------------|-------------------|
| Major | Major triads and major 7th chords | maj, maj7, maj9, maj13 |
| Minor | Minor triads and minor 7th chords | min, m, m7, m9, m11, m13 |
| Dominant | Dominant 7th and altered dominants | 7, 9, 13, 7#9, 7b9, 7#5, 7b5, alt |
| Diminished | Diminished and half-diminished | dim, dim7, m7b5 |
| Augmented | Augmented chords | aug, maj7#5 |
| Suspended | Suspended chords (no 3rd) | sus2, sus4, 7sus4 |
| Extended | 9th, 11th, 13th extensions | 9, 11, 13 (non-altered) |

---

## Database Queries

### Common Operations

#### 1. Load User Preferences

```sql
SELECT time_limit, enabled_chord_types
FROM preferences
WHERE id = 1;
```

#### 2. Update Preferences

```sql
UPDATE preferences
SET time_limit = ?,
    enabled_chord_types = ?
WHERE id = 1;
```

#### 3. Start New Practice Session

```sql
INSERT INTO practice_sessions (started_at, time_limit)
VALUES (datetime('now'), ?)
RETURNING id;
```

#### 4. Record Chord in Session

```sql
INSERT INTO session_chords (session_id, chord_name, displayed_at)
VALUES (?, ?, datetime('now'));

UPDATE practice_sessions
SET chord_count = chord_count + 1
WHERE id = ?;
```

#### 5. End Practice Session

```sql
UPDATE practice_sessions
SET ended_at = datetime('now')
WHERE id = ?;
```

#### 6. Get Practice History (Last 50 Sessions)

```sql
SELECT id, started_at, ended_at, chord_count, time_limit
FROM practice_sessions
WHERE ended_at IS NOT NULL
ORDER BY started_at DESC
LIMIT 50;
```

#### 7. Get Session Details (with chord list)

```sql
SELECT
  s.id,
  s.started_at,
  s.ended_at,
  s.chord_count,
  s.time_limit,
  GROUP_CONCAT(c.chord_name, ', ') AS chords
FROM practice_sessions s
LEFT JOIN session_chords c ON s.id = c.session_id
WHERE s.id = ?
GROUP BY s.id;
```

#### 8. Calculate Total Practice Stats

```sql
SELECT
  COUNT(*) AS total_sessions,
  SUM(chord_count) AS total_chords,
  SUM(
    CAST((julianday(ended_at) - julianday(started_at)) * 24 * 60 AS INTEGER)
  ) AS total_minutes
FROM practice_sessions
WHERE ended_at IS NOT NULL;
```

#### 9. Delete Session (cascades to session_chords)

```sql
DELETE FROM practice_sessions
WHERE id = ?;
```

#### 10. Clear All History

```sql
DELETE FROM practice_sessions;
-- session_chords automatically deleted via CASCADE
```

---

## Data Integrity Constraints

### Enforced by SQLite

- **Primary Keys**: Auto-increment, unique
- **Foreign Keys**: session_chords.session_id → practice_sessions.id (CASCADE delete)
- **Check Constraints**:
  - `time_limit >= 3 AND time_limit <= 60`
  - `chord_count >= 0`
  - `preferences.id = 1` (singleton)
  - `length(chord_name) > 0`

### Enforced by Application Logic

- **enabled_chord_types**: Must parse as valid JSON array of ChordType values
- **enabled_chord_types**: Must contain at least 1 chord type (prevent empty filter)
- **ended_at**: If not NULL, must be >= started_at
- **chord_name**: Must exist in CHORD_LIBRARY (valid chord)

---

## Migration Strategy

### Initial Schema Setup

On first app load, check if `preferences` table exists. If not, run schema creation SQL (see above).

### Future Schema Changes

For schema updates (e.g., adding new fields), use versioned migrations:

```sql
-- Example: Add 'difficulty' field in future version
-- migration_v2.sql
ALTER TABLE practice_sessions ADD COLUMN difficulty TEXT;

-- Track schema version
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY
);

INSERT OR REPLACE INTO schema_version (version) VALUES (2);
```

Application checks `schema_version` on load and runs pending migrations.

---

## Performance Considerations

### Indexes

- **idx_sessions_started**: Speeds up history queries (ORDER BY started_at DESC)
- **idx_session_chords_session**: Speeds up joins between sessions and chords
- **idx_session_chords_displayed**: Speeds up chronological chord queries (if needed for analytics)

### Estimated Data Size

- **Preferences**: 1 row (~100 bytes)
- **Practice Sessions**: ~100 sessions × ~50 bytes = 5 KB
- **Session Chords**: ~100 sessions × ~20 chords × ~50 bytes = 100 KB
- **Total**: ~105 KB (well under 50MB constraint)

### Query Optimization

- Limit history queries (LIMIT 50) to prevent UI slowdown
- Use prepared statements to prevent SQL injection
- Batch inserts for session_chords if displaying many chords rapidly

---

## Summary

The data model is intentionally simple:

- **3 tables**: preferences (singleton), practice_sessions, session_chords
- **Normalized design**: No data duplication
- **Strong constraints**: SQLite CHECK constraints + app validation
- **Efficient queries**: Indexed for common operations
- **Extensible**: Can add stats/analytics without schema rewrites

**Next**: Create contracts/ directory (API patterns if needed) and quickstart.md (testing scenarios).
