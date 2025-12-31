# Implementation Plan: Scale Flashcards

**Branch**: `002-scale-flashcards` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-scale-flashcards/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Extend the existing chord flashcard application to support scale practice. Display scale names (root note + scale type) with the same countdown timer mechanism, allowing users to practice scale recognition. Users can filter by scale type, track separate scale practice history, and switch between chord and scale practice modes. The implementation reuses existing timer, session management, and UI components while adding scale-specific data structures and generators.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+
**Primary Dependencies**: Next.js 14, React 18, shadcn/ui, Tailwind CSS 3.x, sql.js (for SQLite)
**Storage**: SQLite local database (browser: sql.js with IndexedDB persistence)
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Web (desktop and mobile browsers)
**Project Type**: Single web application (Next.js app) - extension of existing chord flashcards
**Performance Goals**: <2s initial load, <100ms UI interactions, smooth 1s timer updates (same as chord practice)
**Constraints**: Offline-capable after initial load, <50MB total app size, runs on mobile browsers, maintains UX consistency with chord practice
**Scale/Scope**: Single-user application, ~7-10 scale types, 12 root notes per type (~84-120 total scales), separate practice history from chords

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Simplicity First ✅ PASS

- Reuses existing chord flashcard architecture and components (timer, session manager, display pattern)
- Scale data structure mirrors chord structure: root + type (no complex music theory engine)
- No new state management - uses existing React Context + hooks pattern
- Scale generator follows same pattern as chord generator
- Database extends existing schema with minimal new tables (scale_preferences, scale_practice_sessions)
- Mode selection is a simple toggle/navigation - no complex routing changes

**Assessment**: Architecture leverages proven patterns from chord practice. Minimal net-new complexity added - mostly data structure extensions. No premature abstractions or over-engineering.

### Principle II: User-First Design ✅ PASS

- Spec written from user perspective (guitar students practicing scale recognition)
- UI reuses familiar patterns from chord practice (consistency = better UX)
- Quick start: user can begin scale practice within 2 seconds (SC-001)
- Separate histories keep chord and scale progress distinct (user clarity)
- Filter preferences persist separately for chords vs scales (respects user workflow)
- Mode selection is explicit and clear (SC-005: 90% distinction rate)

**Assessment**: Feature design extends user-first approach from chord practice. Technical decisions serve user experience goals and leverage learned patterns.

### Principle III: Quality Over Speed ✅ PASS

- Testing included: Vitest for scale generation/session logic, Playwright for E2E scale practice flows
- Tests will cover: scale selection, filtering, timer integration, mode switching, history separation
- Edge cases identified in spec (single scale selection, mode switching, performance with 100+ scales)
- Reusing tested components (timer, session manager) reduces risk
- New code focused on scale-specific logic with clear test boundaries

**Assessment**: Quality measures appropriate for extension feature. Testing strategy leverages existing test infrastructure while covering new scale-specific functionality.

### Overall Gate Status: ✅ APPROVED

No violations detected. Implementation plan aligns with all three constitutional principles. Complexity is minimized through component reuse.

## Project Structure

### Documentation (this feature)

```text
specs/002-scale-flashcards/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-patterns.md  # Internal API patterns for scale practice
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
jazzgym/
├── app/                              # Next.js App Router (EXISTING - extended)
│   ├── layout.tsx                    # MODIFY: Add scale practice nav option
│   ├── page.tsx                      # MODIFY: Add mode selector (chord vs scale)
│   ├── scales/                       # NEW: Scale practice page
│   │   └── page.tsx                  # Scale practice session page
│   ├── scales-settings/              # NEW: Scale settings page
│   │   └── page.tsx                  # Scale filter & time limit config
│   ├── scales-history/               # NEW: Scale history page
│   │   └── page.tsx                  # Scale practice history
│   ├── settings/
│   │   └── page.tsx                  # EXISTING: Chord settings (no changes)
│   └── history/
│       └── page.tsx                  # EXISTING: Chord history (no changes)
├── components/
│   ├── ui/                           # EXISTING: shadcn/ui components (no changes)
│   ├── scale-display.tsx             # NEW: Scale display component (mirrors chord-display)
│   ├── scale-filter.tsx              # NEW: Scale type filter (mirrors chord-filter)
│   ├── mode-selector.tsx             # NEW: Chord/Scale mode toggle
│   ├── chord-display.tsx             # EXISTING: (no changes)
│   ├── countdown-timer.tsx           # EXISTING: Reused for scales (no changes)
│   ├── session-summary.tsx           # MODIFY: Accept mode parameter (chord vs scale)
│   └── practice-history.tsx          # EXISTING: (minor changes for scale history variant)
├── lib/
│   ├── db.ts                         # MODIFY: Add scale-specific queries
│   ├── scale-generator.ts            # NEW: Scale selection logic (mirrors chord-generator)
│   ├── scale-session-manager.ts      # NEW: Scale session management (mirrors session-manager)
│   ├── types.ts                      # MODIFY: Add scale types (Scale, ScaleType, ScaleRoot, etc.)
│   ├── chord-generator.ts            # EXISTING: (no changes)
│   └── session-manager.ts            # EXISTING: (no changes - maybe extract shared logic)
├── hooks/
│   ├── use-scale-practice-session.ts # NEW: Scale practice session hook
│   ├── use-scale-preferences.ts      # NEW: Scale preferences hook
│   ├── use-timer.ts                  # EXISTING: Reused for scales (no changes)
│   ├── use-practice-session.ts       # EXISTING: (no changes)
│   └── use-preferences.ts            # EXISTING: (no changes)
├── db/
│   └── schema.sql                    # MODIFY: Add scale tables (scale_preferences, scale_practice_sessions, scale_session_records)
├── __tests__/
│   ├── unit/
│   │   ├── scale-generator.test.ts   # NEW: Scale selection tests
│   │   ├── scale-session-manager.test.ts # NEW: Scale session tests
│   │   ├── chord-generator.test.ts   # EXISTING: (no changes)
│   │   ├── session-manager.test.ts   # EXISTING: (no changes)
│   │   └── timer.test.ts             # EXISTING: (no changes)
│   └── e2e/
│       ├── scale-practice.spec.ts    # NEW: Scale practice E2E tests
│       ├── scale-settings.spec.ts    # NEW: Scale settings E2E tests
│       ├── scale-history.spec.ts     # NEW: Scale history E2E tests
│       ├── mode-switching.spec.ts    # NEW: Chord/scale mode switching tests
│       ├── practice-session.spec.ts  # EXISTING: (no changes)
│       ├── settings.spec.ts          # EXISTING: (no changes)
│       └── history.spec.ts           # EXISTING: (no changes)
├── package.json                      # EXISTING: (no new dependencies needed)
├── tsconfig.json                     # EXISTING: (no changes)
├── tailwind.config.ts                # EXISTING: (no changes)
├── next.config.js                    # EXISTING: (no changes)
└── vitest.config.ts                  # EXISTING: (no changes)
```

**Structure Decision**: Extends existing Next.js App Router structure. Scale practice gets parallel pages (scales/, scales-settings/, scales-history/) to chord practice for clear separation. Reuses timer component and session patterns. Database schema extends with scale-specific tables mirroring chord tables. New components follow established naming conventions (scale-* mirrors chord-*).

## Complexity Tracking

> **No violations detected - this section intentionally left empty per constitution compliance.**

---

## Post-Design Constitution Re-evaluation

*Re-checked after Phase 1 design artifacts (data-model.md, contracts/, quickstart.md)*

### Principle I: Simplicity First ✅ PASS

**Data Model Review**:
- ✅ 3 new tables mirror chord table structure (scale_preferences, scale_practice_sessions, scale_session_records)
- ✅ Simple singleton pattern for preferences (id=1)
- ✅ Foreign key CASCADE maintains referential integrity without application logic
- ✅ JSON storage for enabled_scale_types follows existing pattern from chord preferences
- ✅ No complex joins or queries - straightforward CRUD operations

**API Patterns Review**:
- ✅ Function signatures mirror chord practice API (getAllScaleTypes ↔ getAllChordTypes)
- ✅ React hooks follow established patterns (useScalePreferences ↔ usePreferences)
- ✅ Validation at function boundaries (consistent with existing code)
- ✅ No new architectural patterns introduced - pure reuse

**Assessment**: Design artifacts maintain simplicity. No complexity creep detected. All patterns reused from chord practice.

### Principle II: User-First Design ✅ PASS

**Data Model Review**:
- ✅ Scale naming matches user mental model: "C Major", "F# Harmonic Minor"
- ✅ Separate histories respect user's need to track chord vs scale progress independently
- ✅ Preferences singleton enables instant session start (no configuration required)
- ✅ Time limit range (3-60s) validated at database level protects user experience

**Testing Scenarios Review**:
- ✅ Quickstart.md provides 10 user-focused test scenarios
- ✅ Each scenario validates user value (not technical implementation)
- ✅ Edge cases prioritize user safety (can't start with 0 enabled types)
- ✅ Accessibility testing included (keyboard nav, screen readers)

**Assessment**: Design maintains user-first focus. Database constraints prevent invalid states. Testing validates user outcomes.

### Principle III: Quality Over Speed ✅ PASS

**Testing Coverage**:
- ✅ Quickstart.md defines comprehensive manual test scenarios (10 scenarios)
- ✅ Unit tests planned: scale-generator.test.ts, scale-session-manager.test.ts, use-scale-preferences.test.ts
- ✅ E2E tests planned: scale-practice.spec.ts, scale-settings.spec.ts, scale-history.spec.ts, mode-switching.spec.ts
- ✅ Performance benchmarks documented (100+ scales, <2s load, 60 FPS timer)
- ✅ Cross-browser testing checklist included

**Data Integrity**:
- ✅ SQLite CHECK constraints enforce validation at database level
- ✅ Foreign keys with CASCADE prevent orphaned records
- ✅ Application validation documented in contracts/api-patterns.md
- ✅ Error handling patterns consistent with existing code

**Assessment**: Quality measures comprehensive. Testing strategy covers unit, integration, E2E, and manual QA. Performance benchmarks defined.

### Overall Gate Status: ✅ APPROVED

**Phase 1 Design Complete**. No constitutional violations introduced by design artifacts. All three principles maintained:
- Simplicity preserved through pattern reuse
- User-first design validated through testing scenarios
- Quality ensured through comprehensive test coverage and data integrity constraints

**Ready for Phase 2**: Proceed to `/speckit.tasks` to generate implementation task breakdown.
