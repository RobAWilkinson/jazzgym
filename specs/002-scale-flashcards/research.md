# Research: Scale Flashcards

**Feature**: 002-scale-flashcards
**Date**: 2025-12-30
**Purpose**: Document technical decisions and research findings for implementation

## Overview

This feature extends the existing chord flashcard application (001-chord-flashcards) to support scale practice. Since the technical stack, architecture patterns, and implementation approach are already established, no additional research was required. All technical decisions leverage proven patterns from the chord practice feature.

---

## 1. Technical Stack Reuse

### Decision

Use the exact same technical stack as chord flashcards: Next.js 14, React 18, TypeScript 5.x, sql.js for SQLite, shadcn/ui, Tailwind CSS 3.x, Vitest, and Playwright.

### Rationale

- **Proven foundation**: Chord flashcard feature is fully implemented and tested
- **Consistency**: Reusing the stack ensures UX consistency and reduces learning curve
- **No new dependencies**: Existing tools handle all scale practice requirements
- **Simpl

icity**: Adding a new tech stack would violate the Simplicity First principle

### Alternatives Considered

| Alternative | Pros | Cons | Rejection Reason |
|------------|------|------|------------------|
| Different UI framework | Could explore newer options | Increases bundle size, team learning curve | Unnecessary complexity - existing stack works well |
| Separate database | Could isolate scale data | Requires sync, more complex queries | Violates simplicity - shared DB is cleaner |
| External scale library | Pre-built scale definitions | Dependency risk, over-engineering | Simple array of scales sufficient |

### Implementation Notes

- Reuse existing components: countdown-timer.tsx, session-summary.tsx (with minor mods)
- Mirror existing patterns: scale-generator.ts follows chord-generator.ts structure
- Extend database schema: Add scale-specific tables following same patterns as chord tables

---

## 2. Data Structure Design

### Decision

Mirror chord data structure for scales: root note + scale type (e.g., "C Major", "F# Harmonic Minor").

### Rationale

- **Consistency**: Users already understand chord naming (root + type)
- **Simplicity**: No complex music theory calculations needed
- **Performance**: Simple string concatenation for display
- **Extensibility**: Easy to add new scale types without code changes

### Implementation Notes

```typescript
// Mirrors chord structure
type ScaleRoot = 'C' | 'C#' | 'Db' | 'D' | ... // 12 chromatic notes
type ScaleType = 'Major' | 'Natural Minor' | 'Harmonic Minor' | ... // 7-10 types

interface Scale {
  root: ScaleRoot;
  type: ScaleType;
  displayName: string; // e.g., "C Major", "F# Harmonic Minor"
}
```

---

## 3. Component Reuse Strategy

### Decision

Reuse timer, session management, and history components. Create scale-specific variants only for display and filtering (scale-display.tsx, scale-filter.tsx).

### Rationale

- **DRY principle**: Timer logic is identical for chords and scales
- **Reduced testing burden**: Reused components already have test coverage
- **Consistency**: Same timer behavior across practice modes
- **Maintainability**: Bug fixes in shared components benefit both modes

### Implementation Notes

- countdown-timer.tsx: No changes needed (works for any timed content)
- session-summary.tsx: Add optional `mode` parameter to distinguish chord vs scale summaries
- practice-history.tsx: Accept `mode` prop for scale history variant

---

## 4. Database Schema Extension

### Decision

Add parallel tables for scales mirroring chord tables: scale_preferences, scale_practice_sessions, scale_session_records.

### Rationale

- **Separation of concerns**: Chord and scale histories remain independent
- **Query simplicity**: No complex joins or mode filters needed
- **Data integrity**: Separate foreign keys prevent accidental data mixing
- **Flexibility**: Can track different metrics for chords vs scales in the future

### Alternatives Considered

| Alternative | Pros | Cons | Rejection Reason |
|------------|------|------|------------------|
| Single tables with mode column | Fewer tables | Complex queries, mixed histories | Harder to maintain, violates simplicity |
| Shared preferences table | Less duplication | Chord and scale settings coupled | Users may want different time limits per mode |
| No persistence for scales | Simplest | Loses user preferences and history | Violates user expectations from chord practice |

---

## 5. Mode Selection UI

### Decision

Add a simple navigation option or mode selector on the home page to choose between chord and scale practice.

### Rationale

- **Clarity**: Explicit mode selection prevents user confusion (SC-005: 90% distinction rate)
- **Simplicity**: Simple toggle or navigation link (no complex state management)
- **Consistency**: Follows established navigation patterns in the app

### Implementation Notes

- Option 1: Add "Scale Practice" nav link alongside "Chord Practice" in app/layout.tsx
- Option 2: Home page (app/page.tsx) offers two cards: "Practice Chords" and "Practice Scales"
- Both options are simple and user-friendly - final choice during implementation

---

## 6. Scale Types to Include

### Decision

Start with 7 common jazz scale types: Major, Natural Minor, Harmonic Minor, Melodic Minor, Dorian, Mixolydian, Altered. Extensible to add more (Lydian, Phrygian, Bebop, etc.) later.

### Rationale

- **Coverage**: These 7 scales cover the most common jazz harmony scenarios
- **Scope management**: ~84 total scales (7 types × 12 roots) is manageable
- **Extensibility**: Adding more scale types later is trivial (just update the SCALE_LIBRARY array)

### Implementation Notes

```typescript
const SCALE_TYPES: ScaleType[] = [
  'Major',
  'Natural Minor',
  'Harmonic Minor',
  'Melodic Minor',
  'Dorian',
  'Mixolydian',
  'Altered',
];

// Generate all scales: 7 types × 12 roots = 84 scales
const SCALE_LIBRARY = SCALE_ROOTS.flatMap(root =>
  SCALE_TYPES.map(type => ({
    root,
    type,
    displayName: `${root} ${type}`
  }))
);
```

---

## Summary

No research phase was required since this feature extends an established codebase with proven patterns. All technical decisions leverage existing infrastructure:

- **Stack**: Reuse Next.js 14, React 18, TypeScript, sql.js, shadcn/ui, Tailwind, Vitest, Playwright
- **Architecture**: Mirror chord flashcard structure (generators, session managers, hooks)
- **Database**: Extend schema with parallel scale tables
- **Components**: Reuse timer and session logic; create scale-specific display/filter components
- **Testing**: Follow same patterns as chord tests

**Next Phase**: Proceed to Phase 1 (data-model.md, contracts/, quickstart.md).
