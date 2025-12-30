# Research: Chord Flashcards

**Feature**: 001-chord-flashcards
**Date**: 2025-12-30
**Purpose**: Document technical decisions and research findings for implementation

## Overview

This document captures research and technical decisions for implementing the jazz guitar chord flashcard application using Next.js, React, shadcn/ui, Tailwind CSS, and SQLite.

---

## 1. SQLite Integration in Next.js Web Application

### Decision

Use **client-side SQLite** via `sql.js` (WebAssembly) with browser localStorage/IndexedDB persistence for web deployment. For potential desktop app, use `better-sqlite3` via Electron or Tauri.

### Rationale

- **Browser compatibility**: sql.js runs entirely in-browser (WASM), no server required
- **Offline-first**: Aligns with requirement that app runs offline after initial load
- **Simplicity**: No backend API needed - all data stays local
- **Migration path**: Can switch to better-sqlite3 if packaging as Electron/Tauri app later

### Alternatives Considered

| Alternative | Pros | Cons | Rejection Reason |
|------------|------|------|------------------|
| PostgreSQL + API | Full SQL features, scalable | Requires server, complex setup, no offline | Violates simplicity principle & offline requirement |
| IndexedDB directly | Native browser API, good performance | Complex API, no SQL, harder migrations | SQL provides clearer data model, easier queries |
| LocalStorage JSON | Simple, widely supported | No query capability, size limits (5-10MB) | Insufficient for 100+ sessions, no relational data |
| better-sqlite3 (Node) | Fast, full SQLite features | Server-side only, no browser support | Can't run in browser (requirement) |

### Implementation Notes

- Use `sql.js-httpvfs` or similar for browser-based SQLite
- Persist database to IndexedDB between sessions
- Initialize with schema on first load
- Connection established client-side in React hooks

### References

- [sql.js documentation](https://github.com/sql-js/sql.js)
- [Next.js client-side data fetching patterns](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)

---

## 2. Timer Implementation Strategy

### Decision

Use **React `useEffect` + `setInterval`** with 100ms precision, display rounded to 1s for smooth countdown.

### Rationale

- **Simplicity**: Standard React pattern, no additional libraries
- **Sufficient accuracy**: 100ms intervals ensure smooth visual countdown
- **Performance**: Minimal overhead, works well for single timer
- **Predictable**: Easier to test than requestAnimationFrame

### Alternatives Considered

| Alternative | Pros | Cons | Rejection Reason |
|------------|------|------|------------------|
| `requestAnimationFrame` | Smoothest possible updates, ~60fps | Overkill for 1s timer, harder to test | Violates simplicity (YAGNI) |
| Web Workers | Runs in background, precise | Complex setup, harder debugging | Unnecessary complexity for single timer |
| setTimeout recursive | Simpler than setInterval | Drift over time, less accurate | setInterval more appropriate for regular updates |
| Date.now() polling | Most accurate | Constant CPU usage, battery drain | Poor UX on mobile devices |

### Implementation Notes

```typescript
// Pseudocode for timer hook
const useTimer = (initialSeconds: number, onComplete: () => void) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 0.1)); // 100ms ticks
    }, 100);

    return () => clearInterval(interval);
  }, [timeLeft, onComplete]);

  return Math.ceil(timeLeft); // Display rounded seconds
};
```

### Edge Case Handling

- **Browser tab inactive**: Timer continues but may drift (acceptable for practice app)
- **Page reload mid-session**: Session state lost (document in quickstart.md as known limitation)
- **Timer reaches zero**: Trigger auto-advance, reset timer for next chord

---

## 3. Chord Generation Algorithm

### Decision

**Pre-defined chord list** with random selection filtered by user preferences. No generative algorithm.

### Rationale

- **Simplicity**: Fixed list easier to maintain and test
- **Predictability**: Ensures all chords are valid jazz voicings
- **Performance**: O(1) selection after filtering
- **Quality**: Curated list ensures musical relevance

### Chord Data Structure

```typescript
type ChordRoot = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

type ChordQuality =
  | 'maj' | 'min' | 'm'
  | 'maj7' | 'm7' | '7'
  | 'm7b5' | 'dim' | 'dim7'
  | 'aug' | 'sus2' | 'sus4'
  | 'maj9' | 'm9' | '9'
  | 'maj11' | 'm11' | '11'
  | 'maj13' | 'm13' | '13'
  | '7#9' | '7b9' | '7#5' | '7b5';

type ChordType = 'Major' | 'Minor' | 'Dominant' | 'Diminished' | 'Augmented' | 'Suspended' | 'Extended';

interface Chord {
  root: ChordRoot;
  quality: ChordQuality;
  type: ChordType;
  displayName: string; // e.g., "Cmaj7", "F#m7b5"
}
```

### Selection Algorithm

```typescript
function selectRandomChord(
  availableChords: Chord[],
  excludedTypes: ChordType[]
): Chord {
  const filtered = availableChords.filter(
    chord => !excludedTypes.includes(chord.type)
  );

  if (filtered.length === 0) {
    throw new Error('No chords available with current filters');
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}
```

### Alternatives Considered

| Alternative | Pros | Cons | Rejection Reason |
|------------|------|------|------------------|
| Generative algorithm | Infinite variations, flexible | Complex rules, potential invalid chords | Over-engineering (YAGNI) |
| Music theory library | Comprehensive, validated | Heavy dependency, learning curve | Unnecessary for flashcard display |
| Weighted random | Practice weaker chords more | Requires tracking, complex algorithm | Feature creep - P1 is simple random |

### Comprehensive Chord List Scope

- **Roots**: All 12 chromatic notes (enharmonic equivalents: C#/Db, D#/Eb, etc.)
- **Qualities**: ~25 common jazz chord types
- **Total chords**: ~300 combinations (12 roots × ~25 qualities)

---

## 4. State Management Approach

### Decision

**React Context + Custom Hooks** for global state (preferences, session). Local component state for UI-only state.

### Rationale

- **Simplicity**: No additional library needed (YAGNI)
- **Sufficient**: App has limited global state (user prefs, active session)
- **Type-safe**: Works well with TypeScript
- **Testable**: Hooks can be tested in isolation

### State Organization

```typescript
// Global contexts
- PreferencesContext: { timeLimit, enabledChordTypes }
- SessionContext: { currentChord, chordsCompleted, startTime, isActive }

// Local state (component-specific)
- Timer countdown (use-timer hook)
- UI toggles (modals, dropdowns)
```

### Alternatives Considered

| Alternative | Pros | Cons | Rejection Reason |
|------------|------|------|------------------|
| Redux/Redux Toolkit | Robust, dev tools, time-travel debugging | Heavy for simple app, boilerplate | Over-engineering - state is simple |
| Zustand | Lightweight, less boilerplate than Redux | External dependency, unnecessary | Context + hooks sufficient |
| Jotai/Recoil | Atomic state, fine-grained updates | Learning curve, overkill for this app | Violates simplicity principle |
| URL state only | Shareable, bookmarkable | Loses state on close, doesn't fit practice app | User preferences need persistence |

---

## 5. shadcn/ui Component Selection

### Decision

Use shadcn/ui **copy-paste approach** for needed components: Button, Card, Select, Dialog, Checkbox, Label.

### Rationale

- **Ownership**: Components copied into codebase (full control)
- **No dependency bloat**: Only include what's needed
- **Customizable**: Tailwind classes directly editable
- **Accessible**: Built on Radix UI primitives (a11y included)

### Components Needed

| Component | Purpose | shadcn/ui Component |
|-----------|---------|---------------------|
| Start/Stop buttons | Session control | `Button` |
| Chord display card | Main practice area | `Card` |
| Chord type selector | Filter configuration | `Select` + `Checkbox` |
| Session summary | End-of-session modal | `Dialog` |
| History list | Past sessions | `Card` (list) |
| Settings form | Time limit input | `Label` + `Input` |

### Installation

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card select dialog checkbox label input
```

---

## 6. Testing Strategy

### Decision

- **Unit tests**: Vitest for business logic (chord generation, session management, timer)
- **E2E tests**: Playwright for user flows (practice session, settings, history)

### Rationale

- **Vitest**: Fast, Vite-native, Jest-compatible API
- **Playwright**: Multi-browser, reliable, good Next.js support
- **Coverage targets**: 80%+ for critical logic (timer, chord selection, persistence)

### Test Priorities (Per Constitution: Quality Over Speed)

**High Priority** (must have):
1. Timer countdown accuracy and auto-advance
2. Chord random selection and filtering
3. SQLite persistence (save/load preferences and sessions)
4. Session summary calculations (chord count, duration)

**Medium Priority** (should have):
5. Edge cases (empty filters, extremely short timers)
6. Multiple practice sessions in sequence
7. Settings persistence across page reloads

**Low Priority** (nice to have):
8. UI component unit tests (covered by E2E)
9. Performance benchmarks

### Test Files Structure

```text
__tests__/
├── unit/
│   ├── chord-generator.test.ts       # Chord selection logic
│   ├── session-manager.test.ts       # Session state management
│   └── timer.test.ts                 # Timer hook behavior
└── e2e/
    ├── practice-session.spec.ts      # Full practice flow
    ├── settings.spec.ts              # Configure preferences
    └── history.spec.ts               # View past sessions
```

---

## 7. Database Schema Design

### Decision

**Three tables**: `preferences`, `practice_sessions`, `session_chords` (junction table).

### Rationale

- **Normalized**: Avoids data duplication, easier to query
- **Extensible**: Can add stats/analytics later without schema changes
- **Simple**: Only 3 tables, straightforward relationships

### Schema (see data-model.md for full details)

```sql
CREATE TABLE preferences (
  id INTEGER PRIMARY KEY,
  time_limit INTEGER NOT NULL DEFAULT 10,
  enabled_chord_types TEXT NOT NULL -- JSON array
);

CREATE TABLE practice_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  chord_count INTEGER DEFAULT 0,
  time_limit INTEGER NOT NULL
);

CREATE TABLE session_chords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  chord_name TEXT NOT NULL,
  displayed_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES practice_sessions(id)
);
```

---

## Summary

All technical decisions prioritize **simplicity**, **user experience**, and **quality** per the JazzGym constitution. No over-engineering detected. The tech stack (Next.js + React + SQLite + shadcn/ui) aligns well with the feature requirements and constraints.

**Next Phase**: Proceed to Phase 1 (data-model.md, contracts/, quickstart.md).
