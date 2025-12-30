# Implementation Plan: Chord Flashcards

**Branch**: `001-chord-flashcards` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-chord-flashcards/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a jazz guitar chord flashcard practice application that displays chord names with countdown timers, allowing users to practice chord recognition without being shown fingerings. Users can customize their practice by filtering chord types, configure time limits, and track their practice history. The application uses Next.js with React for the UI, shadcn/ui components with Tailwind CSS for styling, and SQLite for local data persistence.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+
**Primary Dependencies**: Next.js 14, React 18, shadcn/ui, Tailwind CSS 3.x, better-sqlite3 (for SQLite)
**Storage**: SQLite local database (browser: sql.js-httpvfs or similar; desktop: better-sqlite3)
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Web (desktop and mobile browsers), potential Electron wrapper for desktop app
**Project Type**: Single web application (Next.js app)
**Performance Goals**: <2s initial load, <100ms UI interactions, smooth 1s timer updates
**Constraints**: Offline-capable after initial load, <50MB total app size, runs on mobile browsers
**Scale/Scope**: Single-user application, ~20-30 chord types, 100+ chord practice sessions stored locally

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Simplicity First ✅ PASS

- Using Next.js App Router with minimal API routes (simple file-based routing)
- SQLite for straightforward local storage (no complex database setup)
- shadcn/ui components are copy-paste (no heavy component library abstraction)
- No state management library needed - React Context + hooks sufficient for this scope
- No complex build pipeline - standard Next.js defaults
- Chord data structure is simple: root + quality (no music theory engine needed)

**Assessment**: Architecture follows YAGNI principles. No premature abstractions or over-engineering detected.

### Principle II: User-First Design ✅ PASS

- Spec written from user perspective (guitar students practicing chords)
- UI prioritizes large, readable chord display and visible timer (FR-001, FR-003)
- Quick start: user can practice within 2 seconds (SC-001)
- Offline capability respects user's practice environment (Assumption)
- No implementation details in spec; all requirements user-focused

**Assessment**: Feature design puts user needs first. Technical decisions serve user experience goals.

### Principle III: Quality Over Speed ✅ PASS

- Testing included: Vitest for component/logic, Playwright for E2E user flows
- Tests cover critical user flows: timer countdown, chord randomization, persistence
- Edge cases identified in spec (short time limits, filter combinations, long sessions)
- Non-trivial feature warrants comprehensive testing per constitution guidance
- Plan includes data validation (time limits 3-60s) to prevent user errors

**Assessment**: Quality measures appropriate for feature complexity. Testing strategy balances coverage with pragmatism.

### Overall Gate Status: ✅ APPROVED

No violations detected. Implementation plan aligns with all three constitutional principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-chord-flashcards/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-spec.md      # Internal API patterns (if needed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
jazzgym/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home/practice session page
│   ├── settings/
│   │   └── page.tsx              # Settings page (time limit, filters)
│   ├── history/
│   │   └── page.tsx              # Practice history page
│   └── api/                      # API routes (if needed for server actions)
│       └── db/
│           └── route.ts          # Database utilities
├── components/
│   ├── ui/                       # shadcn/ui components (button, card, etc.)
│   ├── chord-display.tsx         # Main chord display component
│   ├── countdown-timer.tsx       # Timer component
│   ├── chord-filter.tsx          # Chord type filter selector
│   ├── session-summary.tsx       # End-of-session summary
│   └── practice-history.tsx      # History list component
├── lib/
│   ├── db.ts                     # SQLite database connection & queries
│   ├── chord-generator.ts        # Chord selection logic
│   ├── session-manager.ts        # Practice session state management
│   └── types.ts                  # TypeScript types
├── hooks/
│   ├── use-practice-session.ts   # Practice session hook
│   ├── use-preferences.ts        # User preferences hook
│   └── use-timer.ts              # Countdown timer hook
├── db/
│   └── schema.sql                # SQLite schema definition
├── public/
│   └── ...                       # Static assets
├── __tests__/
│   ├── unit/
│   │   ├── chord-generator.test.ts
│   │   ├── session-manager.test.ts
│   │   └── timer.test.ts
│   └── e2e/
│       ├── practice-session.spec.ts
│       ├── settings.spec.ts
│       └── history.spec.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── vitest.config.ts
```

**Structure Decision**: Standard Next.js App Router structure with TypeScript. Using App Router for built-in features (layouts, server components where beneficial). Components directory follows shadcn/ui conventions. Database abstraction in `lib/db.ts` keeps data access simple and testable. Hooks encapsulate reusable logic (timer, session state, preferences).

## Complexity Tracking

> **No violations detected - this section intentionally left empty per constitution compliance.**
