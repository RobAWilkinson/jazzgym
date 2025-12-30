# Tasks: Chord Flashcards

**Input**: Design documents from `/specs/001-chord-flashcards/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included per JazzGym constitution "Quality Over Speed" principle - non-trivial feature with multiple components and edge cases warrants comprehensive testing.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `app/`, `components/`, `lib/`, `hooks/`, `__tests__/` at repository root
- Paths use Next.js App Router structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Next.js 14 project with TypeScript at repository root
- [X] T002 [P] Configure Tailwind CSS 3.x in tailwind.config.ts
- [X] T003 [P] Initialize shadcn/ui with `npx shadcn-ui@latest init`
- [X] T004 [P] Install shadcn/ui components: button, card, select, dialog, checkbox, label, input
- [X] T005 [P] Install sql.js for client-side SQLite: `npm install sql.js`
- [X] T006 [P] Install Vitest for unit testing: `npm install -D vitest @testing-library/react @testing-library/jest-dom`
- [X] T007 [P] Install Playwright for E2E testing: `npm install -D @playwright/test`
- [X] T008 [P] Create vitest.config.ts with React testing configuration
- [X] T009 [P] Create playwright.config.ts for E2E test configuration
- [X] T010 Create project directory structure: app/, components/ui/, lib/, hooks/, db/, __tests__/unit/, __tests__/e2e/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T011 Create SQLite schema in db/schema.sql (preferences, practice_sessions, session_chords tables)
- [X] T012 Create TypeScript types in lib/types.ts (Chord, ChordType, ChordRoot, ChordQuality, Preferences, PracticeSession, SessionChord, SessionState, SessionSummary)
- [X] T013 Create chord library constant in lib/chord-generator.ts (CHORD_LIBRARY with ~300 jazz chords: 12 roots × 25 qualities)
- [X] T014 Implement SQLite database initialization in lib/db.ts (initializeDatabase function using sql.js)
- [X] T015 Implement database persistence layer in lib/db.ts (save/load from IndexedDB between sessions)
- [X] T016 [P] Create root layout in app/layout.tsx (HTML structure, metadata, Tailwind imports)
- [X] T017 [P] Create global styles in app/globals.css (Tailwind directives, custom CSS variables for theme)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Practice Session (Priority: P1) 🎯 MVP

**Goal**: Core timed flashcard functionality - display chord names with countdown timer, auto-advance, and session summaries

**Independent Test**: Launch app → Start practice → Verify chord displays with timer → Timer auto-advances → End session → Summary shown

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T018 [P] [US1] Unit test for useTimer hook in __tests__/unit/timer.test.ts (countdown, auto-complete, pause/resume, reset)
- [X] T019 [P] [US1] Unit test for chord selection in __tests__/unit/chord-generator.test.ts (random selection, filtering, edge cases)
- [X] T020 [P] [US1] Unit test for session manager in __tests__/unit/session-manager.test.ts (start session, advance chord, end session, session summary calculation)
- [X] T021 [P] [US1] E2E test for basic practice flow in __tests__/e2e/practice-session.spec.ts (start → display chord → timer countdown → auto-advance → end → summary)

### Implementation for User Story 1

- [X] T022 [P] [US1] Implement useTimer hook in hooks/use-timer.ts (setInterval-based countdown with 100ms precision, onComplete callback)
- [X] T023 [P] [US1] Implement chord selection functions in lib/chord-generator.ts (getAvailableChords, selectRandomChord, getAllChordTypes)
- [X] T024 [US1] Implement session management in lib/session-manager.ts (startSession, advanceToNextChord, endSession - depends on T022, T023)
- [X] T025 [US1] Implement database CRUD for sessions in lib/db.ts (createPracticeSession, addChordToSession, endPracticeSession)
- [X] T026 [US1] Implement usePracticeSession hook in hooks/use-practice-session.ts (wraps session-manager with React state, connects to database)
- [X] T027 [P] [US1] Create CountdownTimer component in components/countdown-timer.tsx (displays time left, visual progress indicator)
- [X] T028 [P] [US1] Create ChordDisplay component in components/chord-display.tsx (large text display of chord name, no fingerings per FR-002)
- [X] T029 [US1] Create SessionSummary component in components/session-summary.tsx (dialog showing chords completed, duration, stats)
- [X] T030 [US1] Create home page in app/page.tsx (integrate ChordDisplay, CountdownTimer, Start/End session buttons, SessionSummary modal)
- [X] T031 [US1] Add session control logic to app/page.tsx (start session with default 10s timer, auto-advance on timer complete, end session on user action)
- [X] T032 [US1] Add error handling and validation to app/page.tsx (prevent starting session if already active, handle database errors gracefully)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - user can practice chords with timer

---

## Phase 4: User Story 2 - Customized Practice (Priority: P2)

**Goal**: Chord type filtering and configurable time limits with preference persistence

**Independent Test**: Go to settings → Select specific chord types → Set time limit → Save → Start practice → Verify only selected chords appear with custom time

### Tests for User Story 2

- [X] T033 [P] [US2] Unit test for preferences persistence in __tests__/unit/db.test.ts (getPreferences, updatePreferences, validation)
- [X] T034 [P] [US2] E2E test for settings configuration in __tests__/e2e/settings.spec.ts (modify time limit, filter chord types, save preferences, verify persistence on page reload)

### Implementation for User Story 2

- [X] T035 [P] [US2] Implement preferences database functions in lib/db.ts (getPreferences, updatePreferences with validation for 3-60s range and non-empty chord types)
- [X] T036 [US2] Implement usePreferences hook in hooks/use-preferences.ts (load preferences on mount, updatePreferences with optimistic updates, error handling)
- [X] T037 [P] [US2] Create ChordFilter component in components/chord-filter.tsx (checkbox group for ChordType selection, "Select All" / "Clear All" helpers)
- [X] T038 [P] [US2] Create settings page in app/settings/page.tsx (time limit input with 3-60s range, ChordFilter component, Save/Cancel buttons)
- [X] T039 [US2] Integrate usePreferences into settings page app/settings/page.tsx (load current prefs, handle save with validation, show success/error toasts)
- [X] T040 [US2] Update home page app/page.tsx to load preferences and pass to usePracticeSession (respect user's default time limit and enabled chord types)
- [X] T041 [US2] Add navigation between home and settings in app/layout.tsx (simple nav bar or links)
- [X] T042 [US2] Add edge case handling for empty chord filter selection (prevent saving if no chord types selected, show error message)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - user can customize practice and preferences persist

---

## Phase 5: User Story 3 - Progress Tracking (Priority: P3)

**Goal**: Display practice history with statistics and allow deletion of sessions

**Independent Test**: Complete multiple sessions → Navigate to history page → Verify session list displays → View stats → Delete session → Clear all history

### Tests for User Story 3

- [X] T043 [P] [US3] Unit test for history queries in __tests__/unit/db.test.ts (getPracticeHistory, getSessionDetails, getPracticeStats, deleteSession, clearAllHistory)
- [X] T044 [P] [US3] E2E test for history page in __tests__/e2e/history.spec.ts (view history, verify sessions listed, check stats, delete session, clear all)

### Implementation for User Story 3

- [X] T045 [P] [US3] Implement history database functions in lib/db.ts (getPracticeHistory, getSessionDetails, getPracticeStats, deleteSession, clearAllHistory)
- [X] T046 [US3] Implement usePracticeHistory hook in hooks/use-practice-history.ts (load history and stats, deleteSession, clearHistory, auto-refresh after changes)
- [X] T047 [P] [US3] Create PracticeHistory component in components/practice-history.tsx (list of sessions with date/time, chord count, duration; delete button per session)
- [X] T048 [P] [US3] Create history page in app/history/page.tsx (PracticeHistory component, statistics summary card, "Clear All History" button with confirmation dialog)
- [X] T049 [US3] Integrate usePracticeHistory into history page app/history/page.tsx (load data on mount, handle delete actions, show empty state if no history)
- [X] T050 [US3] Add navigation link to history page in app/layout.tsx (nav bar entry for "Practice History")
- [X] T051 [US3] Add confirmation dialogs for destructive actions (delete session, clear all history) using shadcn/ui Dialog component

**Checkpoint**: ✅ All user stories are independently functional - full app feature set complete and verified with Playwright!

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, testing, and quality assurance

- [X] T052 [P] Add loading states to all pages (skeleton loaders for database operations using shadcn/ui components)
- [X] T053 [P] Add error boundaries in app/layout.tsx (catch React errors, display friendly error UI)
- [X] T054 [P] Add toast notifications for user feedback (success/error messages for saves, deletes using shadcn/ui Toast)
- [X] T055 [P] Implement responsive design for mobile browsers (test on small screens, adjust chord display size, touch-friendly buttons)
- [X] T056 [P] Add keyboard shortcuts for practice session (Space to start/pause, Enter to advance, Esc to end session)
- [X] T057 [P] Optimize performance for 100+ chord sessions (test long sessions per SC-005, add pagination or virtualization to history if needed)
- [X] T058 [P] Add accessibility improvements (ARIA labels, keyboard navigation, screen reader support for timer and chord display)
- [X] T059 Run full E2E test suite and fix any failures (__tests__/e2e/practice-session.spec.ts, settings.spec.ts, history.spec.ts)
- [X] T060 Run unit test suite with coverage report (aim for >80% coverage on lib/, hooks/)
- [X] T061 Manual testing of all acceptance scenarios from spec.md (verify all FR-001 through FR-013, SC-001 through SC-006)
- [X] T062 Manual testing of edge cases from spec.md (extremely short/long time limits, empty filters, 100+ chords, app closure mid-session, repetitive chord selection)
- [X] T063 [P] Add documentation comments to public API functions in lib/db.ts, lib/chord-generator.ts, lib/session-manager.ts
- [X] T064 [P] Create README.md with setup instructions, development commands, and feature overview
- [X] T065 Test offline functionality (disconnect network, verify app works, database persists)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion (can run parallel to US1 if staffed)
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion (can run parallel to US1/US2 if staffed)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 but integrates with home page
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2

### Within Each User Story

**User Story 1**:
- Tests (T018-T021) MUST be written and FAIL before implementation
- Hooks (T022-T023) before session manager (T024)
- Session manager (T024) and database (T025) before usePracticeSession hook (T026)
- Components (T027-T029) in parallel
- Page integration (T030-T032) last

**User Story 2**:
- Tests (T033-T034) MUST be written and FAIL before implementation
- Database functions (T035) before usePreferences hook (T036)
- Components (T037) in parallel with database work
- Page creation (T038-T039) after database and components ready
- Integration with home page (T040-T042) last

**User Story 3**:
- Tests (T043-T044) MUST be written and FAIL before implementation
- Database functions (T045) before usePracticeHistory hook (T046)
- Components (T047) in parallel with database work
- Page creation (T048-T051) after database and components ready

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T009)
- Within Foundational phase: T016-T017 can run parallel with database work (T011-T015)
- All test creation tasks within a user story marked [P] can run in parallel
- Component creation tasks marked [P] can run in parallel within each story
- All Polish tasks marked [P] can run in parallel (T052-T058, T060, T063-T065)

---

## Parallel Example: User Story 1 Tests

```bash
# Launch all test creation for User Story 1 together:
Task: "Unit test for useTimer hook in __tests__/unit/timer.test.ts"
Task: "Unit test for chord selection in __tests__/unit/chord-generator.test.ts"
Task: "Unit test for session manager in __tests__/unit/session-manager.test.ts"
Task: "E2E test for basic practice flow in __tests__/e2e/practice-session.spec.ts"
```

## Parallel Example: User Story 1 Components

```bash
# Launch all component creation for User Story 1 together:
Task: "Create CountdownTimer component in components/countdown-timer.tsx"
Task: "Create ChordDisplay component in components/chord-display.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently using quickstart.md scenarios
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Polish → Final testing → Production release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (T018-T032)
   - Developer B: User Story 2 (T033-T042)
   - Developer C: User Story 3 (T043-T051)
3. Stories complete and integrate independently
4. Team collaborates on Polish phase

---

## Task Summary

- **Total Tasks**: 65
- **Phase 1 (Setup)**: 10 tasks
- **Phase 2 (Foundational)**: 7 tasks
- **Phase 3 (User Story 1)**: 15 tasks (4 tests + 11 implementation)
- **Phase 4 (User Story 2)**: 10 tasks (2 tests + 8 implementation)
- **Phase 5 (User Story 3)**: 9 tasks (2 tests + 7 implementation)
- **Phase 6 (Polish)**: 14 tasks

**Parallel Opportunities**: 35+ tasks marked [P] can run in parallel within their phase

**Test Coverage**:
- 8 unit test tasks (timer, chord-generator, session-manager, db, preferences, history)
- 3 E2E test tasks (practice-session, settings, history)
- Manual testing tasks for all acceptance scenarios and edge cases

**Critical Path**: Setup → Foundational → US1 Core → Integration → Polish

---

## Notes

- All tasks include exact file paths for clarity
- [P] tasks = different files, no dependencies within their phase
- [Story] labels map tasks to specific user stories for traceability
- Each user story is independently completable and testable
- Tests are written FIRST per TDD approach (constitution: Quality Over Speed)
- Stop at any checkpoint to validate story independently before proceeding
- Constitution compliance verified: Simplicity (YAGNI structure), User-First (all features map to user needs), Quality (comprehensive testing)

---

## Validation Checklist

After completing all tasks, verify:

- [ ] All 13 Functional Requirements (FR-001 through FR-013) implemented
- [ ] All 6 Success Criteria (SC-001 through SC-006) validated
- [ ] All edge cases from spec.md tested and handled
- [ ] All tests passing (unit + E2E)
- [ ] Manual testing scenarios from quickstart.md completed
- [ ] Constitution principles upheld (Simplicity, User-First, Quality)
- [ ] Application works offline
- [ ] Preferences persist across sessions
- [ ] Performance acceptable for 100+ chord sessions
