# Data Model: Scale Flashcards

**Feature**: 002-scale-flashcards
**Date**: 2025-12-30
**Purpose**: Define data structures, database schema, and validation rules for scale practice

## Overview

This document defines the data model for the scale flashcard feature, which extends the existing chord flashcard application. The scale data model mirrors the chord data model structure for consistency, with separate tables for scale preferences, practice sessions, and session records.

---

## Entity Relationship Diagram

```text
┌──────────────────────┐
│  scale_preferences   │
│  (singleton)         │
└──────────────────────┘

┌───────────────────────────────┐
│  scale_practice_sessions      │
│───────────────────────────────│
│  id (PK)                      │
│  started_at                   │
│  ended_at                     │
│  scale_count                  │
│  time_limit                   │
└──────────────┬────────────────┘
               │
               │ 1:N
               │
┌──────────────▼────────────────┐
│  scale_session_records        │
│───────────────────────────────│
│  id (PK)                      │
│  session_id (FK)              │
│  scale_name                   │
│  displayed_at                 │
└───────────────────────────────┘
```

**Note**: These tables exist alongside the chord tables (preferences, practice_sessions, session_chords) in the same SQLite database. They are completely independent - no foreign keys between chord and scale tables.

---

## 1. Scale Preferences

### Description

Stores user's default settings for scale practice sessions. Single-row table (only one set of preferences per user). Separate from chord preferences to allow different time limits and filters.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Always 1 (singleton pattern) |
| `time_limit` | INTEGER | NOT NULL, DEFAULT 10 | Default seconds per scale (3-60) |
| `enabled_scale_types` | TEXT | NOT NULL | JSON array of enabled ScaleType strings |

### SQLite Schema

```sql
CREATE TABLE scale_preferences (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  time_limit INTEGER NOT NULL DEFAULT 10 CHECK (time_limit >= 3 AND time_limit <= 60),
  enabled_scale_types TEXT NOT NULL DEFAULT '["Major","Natural Minor","Harmonic Minor","Melodic Minor","Dorian","Mixolydian","Altered"]'
);

-- Insert default preferences
INSERT INTO scale_preferences (id, time_limit, enabled_scale_types)
VALUES (1, 10, '["Major","Natural Minor","Harmonic Minor","Melodic Minor","Dorian","Mixolydian","Altered"]');
```

### TypeScript Type

```typescript
interface ScalePreferences {
  id: 1;
  timeLimit: number; // 3-60 seconds
  enabledScaleTypes: ScaleType[];
}

type ScaleType =
  | 'Major'
  | 'Natural Minor'
  | 'Harmonic Minor'
  | 'Melodic Minor'
  | 'Dorian'
  | 'Mixolydian'
  | 'Altered'
  | 'Lydian' // Optional - can be added later
  | 'Phrygian' // Optional - can be added later
  | 'Locrian'; // Optional - can be added later
```

### Validation Rules

- **time_limit**: Must be integer between 3 and 60 (inclusive)
- **enabled_scale_types**: Must be valid JSON array containing at least 1 ScaleType
- **id**: Always 1 (enforced by CHECK constraint)

### State Transitions

- **Initial**: Default values on first app load (if table doesn't exist)
- **Update**: User modifies scale settings → UPDATE scale_preferences SET ... WHERE id = 1
- **Reset**: Delete row, trigger re-insert of defaults

---

## 2. Scale Practice Sessions

### Description

Records each scale practice session with metadata (start/end time, scale count, settings used). Separate from chord practice sessions to maintain independent histories.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique session identifier |
| `started_at` | TEXT | NOT NULL | ISO 8601 timestamp (e.g., "2025-12-30T14:23:00.000Z") |
| `ended_at` | TEXT | NULL | ISO 8601 timestamp when session ended (NULL if active) |
| `scale_count` | INTEGER | DEFAULT 0 | Number of scales practiced in this session |
| `time_limit` | INTEGER | NOT NULL | Time limit setting used (seconds per scale) |

### SQLite Schema

```sql
CREATE TABLE scale_practice_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at TEXT,
  scale_count INTEGER NOT NULL DEFAULT 0 CHECK (scale_count >= 0),
  time_limit INTEGER NOT NULL CHECK (time_limit >= 3 AND time_limit <= 60)
);

CREATE INDEX idx_scale_sessions_started ON scale_practice_sessions(started_at DESC);
```

### TypeScript Type

```typescript
interface ScalePracticeSession {
  id: number;
  startedAt: string; // ISO 8601
  endedAt: string | null; // ISO 8601 or null if active
  scaleCount: number;
  timeLimit: number; // Snapshot of time_limit at session start
}
```

### Validation Rules

- **started_at**: Must be valid ISO 8601 timestamp
- **ended_at**: Must be valid ISO 8601 timestamp or NULL; if not NULL, must be >= started_at
- **scale_count**: Non-negative integer
- **time_limit**: Must be integer between 3 and 60

### State Transitions

```text
[No Session] → [Active Session] → [Completed Session]
    ^                |                    |
    |                └────────────────────┘
    └─────────────── (start new session)

1. Start Session:
   INSERT INTO scale_practice_sessions (started_at, time_limit)
   VALUES (datetime('now'), <user's time_limit>)

2. Add Scale:
   UPDATE scale_practice_sessions
   SET scale_count = scale_count + 1
   WHERE id = <session_id>

3. End Session:
   UPDATE scale_practice_sessions
   SET ended_at = datetime('now')
   WHERE id = <session_id>
```

---

## 3. Scale Session Records

### Description

Junction table tracking individual scales displayed during each practice session. Used for detailed history and potential future analytics (e.g., which scales were practiced most).

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique scale record identifier |
| `session_id` | INTEGER | FOREIGN KEY, NOT NULL | References scale_practice_sessions(id) |
| `scale_name` | TEXT | NOT NULL | Display name (e.g., "C Major", "F# Harmonic Minor") |
| `displayed_at` | TEXT | NOT NULL | ISO 8601 timestamp when scale was shown |

### SQLite Schema

```sql
CREATE TABLE scale_session_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  scale_name TEXT NOT NULL CHECK (length(scale_name) > 0),
  displayed_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES scale_practice_sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_scale_session_records_session ON scale_session_records(session_id);
CREATE INDEX idx_scale_session_records_displayed ON scale_session_records(displayed_at);
```

### TypeScript Type

```typescript
interface ScaleSessionRecord {
  id: number;
  sessionId: number;
  scaleName: string; // e.g., "C Major", "F# Harmonic Minor"
  displayedAt: string; // ISO 8601
}
```

### Validation Rules

- **session_id**: Must reference existing scale_practice_sessions.id
- **scale_name**: Non-empty string, valid scale notation (validated by app logic)
- **displayed_at**: Valid ISO 8601 timestamp

### Cascading Deletes

When a scale_practice_session is deleted, all associated scale_session_records are automatically deleted (ON DELETE CASCADE).

---

## 4. Scale (In-Memory Data Structure)

### Description

**Not stored in database**. Scales are defined as a static TypeScript constant (pre-defined list). This structure is used for scale generation logic.

### TypeScript Type

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
  // Optional - can be added later:
  | 'Lydian'
  | 'Phrygian'
  | 'Locrian'
  | 'Bebop Dominant'
  | 'Whole Tone'
  | 'Diminished';

interface Scale {
  root: ScaleRoot;
  type: ScaleType;
  displayName: string; // Computed: `${root} ${type}`
}

// Example scale definition
const SCALE_LIBRARY: Scale[] = [
  { root: 'C', type: 'Major', displayName: 'C Major' },
  { root: 'C', type: 'Natural Minor', displayName: 'C Natural Minor' },
  { root: 'C', type: 'Harmonic Minor', displayName: 'C Harmonic Minor' },
  { root: 'C', type: 'Melodic Minor', displayName: 'C Melodic Minor' },
  { root: 'C', type: 'Dorian', displayName: 'C Dorian' },
  { root: 'C', type: 'Mixolydian', displayName: 'C Mixolydian' },
  { root: 'C', type: 'Altered', displayName: 'C Altered' },
  // ... repeat for all 12 roots × 7-10 types = ~84-120 total scales
];
```

### Scale Type Categories

| Type | Description | Usage in Jazz |
|------|-------------|---------------|
| Major | Major scale (Ionian mode) | I chord, bright melodic lines |
| Natural Minor | Aeolian mode | Minor i chord, sad/dark melodies |
| Harmonic Minor | Natural minor with raised 7th | Minor-major harmony, exotic sound |
| Melodic Minor | Ascending melodic minor | Jazz minor, altered dominant source |
| Dorian | 2nd mode of major | Minor ii chord, modal jazz |
| Mixolydian | 5th mode of major | Dominant 7th chord, bluesy sound |
| Altered | 7th mode of melodic minor | Altered dominant chords (7alt) |

---

## Database Queries

### Common Operations

#### 1. Load Scale Preferences

```sql
SELECT time_limit, enabled_scale_types
FROM scale_preferences
WHERE id = 1;
```

#### 2. Update Scale Preferences

```sql
UPDATE scale_preferences
SET time_limit = ?,
    enabled_scale_types = ?
WHERE id = 1;
```

#### 3. Start New Scale Practice Session

```sql
INSERT INTO scale_practice_sessions (started_at, time_limit)
VALUES (datetime('now'), ?)
RETURNING id;
```

#### 4. Record Scale in Session

```sql
INSERT INTO scale_session_records (session_id, scale_name, displayed_at)
VALUES (?, ?, datetime('now'));

UPDATE scale_practice_sessions
SET scale_count = scale_count + 1
WHERE id = ?;
```

#### 5. End Scale Practice Session

```sql
UPDATE scale_practice_sessions
SET ended_at = datetime('now')
WHERE id = ?;
```

#### 6. Get Scale Practice History (Last 50 Sessions)

```sql
SELECT id, started_at, ended_at, scale_count, time_limit
FROM scale_practice_sessions
WHERE ended_at IS NOT NULL
ORDER BY started_at DESC
LIMIT 50;
```

#### 7. Get Scale Session Details (with scale list)

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

#### 8. Calculate Total Scale Practice Stats

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

#### 9. Delete Scale Session (cascades to scale_session_records)

```sql
DELETE FROM scale_practice_sessions
WHERE id = ?;
```

#### 10. Clear All Scale History

```sql
DELETE FROM scale_practice_sessions;
-- scale_session_records automatically deleted via CASCADE
```

---

## Data Integrity Constraints

### Enforced by SQLite

- **Primary Keys**: Auto-increment, unique
- **Foreign Keys**: scale_session_records.session_id → scale_practice_sessions.id (CASCADE delete)
- **Check Constraints**:
  - `time_limit >= 3 AND time_limit <= 60`
  - `scale_count >= 0`
  - `scale_preferences.id = 1` (singleton)
  - `length(scale_name) > 0`

### Enforced by Application Logic

- **enabled_scale_types**: Must parse as valid JSON array of ScaleType values
- **enabled_scale_types**: Must contain at least 1 scale type (prevent empty filter)
- **ended_at**: If not NULL, must be >= started_at
- **scale_name**: Must exist in SCALE_LIBRARY (valid scale)

---

## Migration Strategy

### Initial Schema Setup

On first app load, check if `scale_preferences` table exists. If not, run schema creation SQL (see above).

### Coexistence with Chord Tables

The scale tables exist alongside chord tables in the same database:

```text
SQLite Database: jazzgym.db
├── preferences (chord settings)
├── practice_sessions (chord sessions)
├── session_chords (chord records)
├── scale_preferences (scale settings)
├── scale_practice_sessions (scale sessions)
└── scale_session_records (scale records)
```

No foreign keys or joins between chord and scale tables - completely independent data.

---

## Performance Considerations

### Indexes

- **idx_scale_sessions_started**: Speeds up history queries (ORDER BY started_at DESC)
- **idx_scale_session_records_session**: Speeds up joins between sessions and records
- **idx_scale_session_records_displayed**: Speeds up chronological scale queries (if needed for analytics)

### Estimated Data Size

- **Scale Preferences**: 1 row (~100 bytes)
- **Scale Practice Sessions**: ~100 sessions × ~50 bytes = 5 KB
- **Scale Session Records**: ~100 sessions × ~20 scales × ~50 bytes = 100 KB
- **Total (scales only)**: ~105 KB
- **Total (chords + scales)**: ~210 KB (well under 50MB constraint)

### Query Optimization

- Limit history queries (LIMIT 50) to prevent UI slowdown
- Use prepared statements to prevent SQL injection
- Batch inserts for scale_session_records if displaying many scales rapidly

---

## Summary

The scale data model mirrors the chord data model for consistency:

- **3 new tables**: scale_preferences (singleton), scale_practice_sessions, scale_session_records
- **Normalized design**: No data duplication, independent from chord data
- **Strong constraints**: SQLite CHECK constraints + app validation
- **Efficient queries**: Indexed for common operations
- **Extensible**: Can add new scale types without schema changes

**Relationship to Chord Data**: Completely independent. Users can have different preferences (time limits, filters) for chords vs scales. Histories are separate for clarity.

**Next**: Create contracts/ directory (internal API patterns) and quickstart.md (testing scenarios).
