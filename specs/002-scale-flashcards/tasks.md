# Implementation Tasks: Scale Flashcards

**Feature**: 002-scale-flashcards | **Branch**: `002-scale-flashcards` | **Date**: 2025-12-31

## Overview

This document breaks down the scale flashcards feature into actionable implementation tasks, organized by user story to enable independent development and testing.

**Technology Stack**: TypeScript 5.x, Next.js 14, React 18, sql.js (SQLite), shadcn/ui, Tailwind CSS 3.x, Vitest, Playwright

**Testing Approach**: Tests are included to ensure quality. Each user story phase includes unit tests before implementation and E2E tests after implementation.

---

## Task Summary

- **Total Tasks**: 65
- **Setup Phase**: 3 tasks
- **Foundational Phase**: 11 tasks
- **User Story 1 (P1)**: 18 tasks (core scale practice)
- **User Story 2 (P2)**: 13 tasks (scale type filtering)
- **User Story 3 (P3)**: 12 tasks (mode selection integration)
- **Polish Phase**: 8 tasks

---

## Phase 1: Setup

**Goal**: Initialize database schema and TypeScript types for scale practice.

**Duration Estimate**: ~1 hour

### Tasks

- [X] T001 Extend database schema with scale tables in db/schema.sql
- [X] T002 Add scale-related TypeScript types to lib/types.ts
- [X] T003 Implement database initialization for scale tables in lib/db.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Build core scale generation and session management infrastructure that all user stories depend on.

**Dependencies**: Must complete Phase 1 before starting.

**Duration Estimate**: ~4 hours

### Database Layer Tasks

- [X] T004 [P] Implement loadScalePreferences function in lib/db.ts
- [X] T005 [P] Implement updateScalePreferences function in lib/db.ts
- [X] T006 [P] Implement resetScalePreferences function in lib/db.ts
- [X] T007 [P] Implement startScaleSession function in lib/scale-session-manager.ts
- [X] T008 [P] Implement recordScaleInSession function in lib/scale-session-manager.ts
- [X] T009 [P] Implement endScaleSession function in lib/scale-session-manager.ts
- [X] T010 [P] Implement getScalePracticeHistory function in lib/scale-session-manager.ts
- [X] T011 [P] Implement getScaleSessionDetails function in lib/scale-session-manager.ts

### Scale Generator Tasks

- [X] T012 [P] Implement SCALE_LIBRARY constant in lib/scale-generator.ts
- [X] T013 [P] Implement getAllScaleTypes function in lib/scale-generator.ts
- [X] T014 [P] Implement getAvailableScales function in lib/scale-generator.ts
- [X] T015 [P] Implement selectRandomScale function in lib/scale-generator.ts

### Unit Tests for Foundational Layer

- [X] T016 [P] Create unit tests for scale-generator.ts in __tests__/unit/scale-generator.test.ts
- [X] T017 [P] Create unit tests for scale-session-manager.ts in __tests__/unit/scale-session-manager.test.ts

---

## Phase 3: User Story 1 - Quick Scale Practice Session (P1)

**Goal**: Enable users to practice scale recognition with a timed session that auto-advances through random scales.

**Independent Test Criteria**:
- Can start a scale practice session from the app
- Scale names display prominently (e.g., "C Major", "F# Harmonic Minor")
- Timer counts down and auto-advances to next scale
- Session ends with summary showing scale count and duration

**Dependencies**: Requires Phase 2 (foundational layer) to be complete.

**Duration Estimate**: ~8 hours

### React Hooks

- [X] T018 [P] [US1] Create useScalePreferences hook in hooks/use-scale-preferences.ts
- [X] T019 [P] [US1] Create useScalePracticeSession hook in hooks/use-scale-practice-session.ts

### Unit Tests for Hooks

- [X] T020 [P] [US1] Create unit tests for useScalePreferences in __tests__/unit/use-scale-preferences.test.ts
- [X] T021 [P] [US1] Create unit tests for useScalePracticeSession in __tests__/unit/use-scale-practice-session.test.ts

### Components

- [X] T022 [P] [US1] Create ScaleDisplay component in components/scale-display.tsx
- [X] T023 [US1] Add data-testid and ARIA labels to ScaleDisplay for accessibility

### Pages

- [X] T024 [US1] Create scale practice page in app/scales/page.tsx
- [X] T025 [US1] Implement session start logic in app/scales/page.tsx
- [X] T026 [US1] Integrate timer with scale advancement in app/scales/page.tsx
- [X] T027 [US1] Implement session end logic in app/scales/page.tsx
- [X] T028 [US1] Modify session-summary.tsx to accept mode parameter
- [X] T029 [US1] Display session summary for scale practice in app/scales/page.tsx

### E2E Tests

- [X] T030 [P] [US1] Create E2E test for scale practice session flow in __tests__/e2e/scale-practice.spec.ts
- [X] T031 [P] [US1] Create E2E test for timer countdown and auto-advance in __tests__/e2e/scale-practice.spec.ts
- [X] T032 [P] [US1] Create E2E test for session summary in __tests__/e2e/scale-practice.spec.ts

### Integration

- [X] T033 [US1] Test complete scale practice flow (start → practice 5 scales → end → summary)
- [X] T034 [US1] Verify timer integration (countdown updates, auto-advance works)
- [X] T035 [US1] Verify no consecutive duplicate scales appear

---

## Phase 4: User Story 2 - Scale Type Filtering (P2)

**Goal**: Allow users to filter practice by specific scale types (e.g., only Major and Minor scales).

**Independent Test Criteria**:
- Can select/deselect scale types from settings page
- Only selected scale types appear during practice
- Filter preferences persist across sessions
- Cannot start practice with 0 scale types selected

**Dependencies**: Requires Phase 3 (US1) to be complete for testing scale practice with filters.

**Duration Estimate**: ~5 hours

### Components

- [X] T036 [P] [US2] Create ScaleFilter component in components/scale-filter.tsx
- [X] T037 [US2] Add validation to prevent empty scale type selection in ScaleFilter

### Pages

- [X] T038 [US2] Create scale settings page in app/scales-settings/page.tsx
- [X] T039 [US2] Integrate ScaleFilter component in app/scales-settings/page.tsx
- [X] T040 [US2] Implement time limit configuration in app/scales-settings/page.tsx
- [X] T041 [US2] Implement save preferences logic in app/scales-settings/page.tsx
- [X] T042 [US2] Add validation and error handling for settings in app/scales-settings/page.tsx

### E2E Tests

- [X] T043 [P] [US2] Create E2E test for scale type filtering in __tests__/e2e/scale-settings.spec.ts
- [X] T044 [P] [US2] Create E2E test for preference persistence in __tests__/e2e/scale-settings.spec.ts
- [X] T045 [P] [US2] Create E2E test for time limit validation in __tests__/e2e/scale-settings.spec.ts

### Integration

- [X] T046 [US2] Test filtering with single scale type (only Major)
- [X] T047 [US2] Test filtering with multiple scale types (Major + Harmonic Minor)
- [X] T048 [US2] Verify preferences persist after page reload

---

## Phase 5: User Story 3 - Unified Practice Mode Selection (P3)

**Goal**: Enable users to easily switch between chord and scale practice modes from the home page.

**Independent Test Criteria**:
- Home page clearly shows "Chord Practice" and "Scale Practice" options
- Switching modes loads correct practice type
- Chord and scale histories remain separate
- Chord and scale settings remain independent

**Dependencies**: Requires Phase 3 (US1) and Phase 4 (US2) for complete mode switching experience.

**Duration Estimate**: ~4 hours

### Components

- [ ] T049 [P] [US3] Create ModeSelector component in components/mode-selector.tsx
- [ ] T050 [US3] Add clear visual distinction between chord and scale modes in ModeSelector

### Pages

- [ ] T051 [US3] Modify home page to show mode selection in app/page.tsx
- [ ] T052 [US3] Create scale history page in app/scales-history/page.tsx
- [ ] T053 [US3] Implement history display for scale sessions in app/scales-history/page.tsx
- [ ] T054 [US3] Implement delete session functionality in app/scales-history/page.tsx
- [ ] T055 [US3] Implement statistics display in app/scales-history/page.tsx
- [ ] T056 [US3] Modify app/layout.tsx to add scale practice navigation links

### E2E Tests

- [ ] T057 [P] [US3] Create E2E test for mode switching in __tests__/e2e/mode-switching.spec.ts
- [ ] T058 [P] [US3] Create E2E test for separate histories in __tests__/e2e/mode-switching.spec.ts
- [ ] T059 [P] [US3] Create E2E test for scale history page in __tests__/e2e/scale-history.spec.ts

### Integration

- [ ] T060 [US3] Test switching from chord to scale practice and back
- [ ] T061 [US3] Verify separate histories (chord session not in scale history, vice versa)
- [ ] T062 [US3] Verify independent settings (different time limits for chord vs scale)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Add final polish, accessibility improvements, error handling, and comprehensive testing.

**Dependencies**: Requires all user stories (Phase 3-5) to be complete.

**Duration Estimate**: ~3 hours

### Accessibility & UX

- [ ] T063 [P] Add loading states and skeletons to all scale practice pages
- [ ] T064 [P] Add error boundaries for scale practice pages
- [ ] T065 [P] Add toast notifications for scale preference saves and errors

### Final Integration Testing

- [ ] T066 Run all unit tests and ensure 100% pass rate
- [ ] T067 Run all E2E tests and ensure 100% pass rate
- [ ] T068 Perform cross-browser testing (Chrome, Firefox, Safari)

### Performance & Validation

- [ ] T069 Test performance with 100+ scales in a session
- [ ] T070 Verify offline capability for scale practice
- [ ] T071 Verify mobile responsive design for all scale pages

---

## Dependencies & Execution Strategy

### Dependency Graph (Story Completion Order)

```text
Phase 1 (Setup)
  ↓
Phase 2 (Foundational) ← BLOCKING for all user stories
  ↓
  ├─→ Phase 3 (US1: Scale Practice) ← MVP (can deploy after this)
  │     ↓
  │     ├─→ Phase 4 (US2: Filtering) ← Can start after US1 complete
  │     │
  │     └─→ Phase 5 (US3: Mode Selection) ← Can start after US1 complete
  │
  └─→ Phase 4 & Phase 5 can run in parallel if US1 is done
       ↓
     Phase 6 (Polish) ← Requires all user stories complete
```

### Parallel Execution Opportunities

**Phase 2 (Foundational)**: Tasks T004-T015 can all be executed in parallel (different files, no dependencies).

**Phase 3 (US1)**:
- Parallel: T018-T019 (hooks), T022 (component)
- Parallel: T020-T021 (hook tests)
- Sequential: T024-T029 (page implementation - depends on hooks/components)
- Parallel: T030-T032 (E2E tests - can run concurrently)

**Phase 4 (US2)**:
- Parallel: T036 (component)
- Sequential: T038-T042 (page depends on component)
- Parallel: T043-T045 (E2E tests)

**Phase 5 (US3)**:
- Parallel: T049 (component)
- Sequential: T051-T056 (pages depend on component)
- Parallel: T057-T059 (E2E tests)

**Phase 6 (Polish)**: Tasks T063-T065 can all be executed in parallel.

---

## MVP Scope

**Recommended MVP**: Complete through **Phase 3 (User Story 1)** only.

This provides a complete, independently testable increment:
- ✅ Users can practice scale recognition
- ✅ Timer auto-advances through scales
- ✅ Session summary shows progress
- ✅ All scale types available (default settings)

**Phases 4-5 can be added incrementally** after MVP validation.

---

## Implementation Strategy

### 1. Bottom-Up Approach

Start with foundational layer (Phase 2) before building UI (Phase 3-5). This ensures:
- Business logic is tested independently
- UI components can rely on stable APIs
- Database layer is validated early

### 2. Test-Driven Development

Each phase includes unit tests BEFORE implementation:
- Write tests for generators and session managers first
- Implement functions to pass tests
- Add E2E tests after page implementation

### 3. Incremental Delivery

Each user story is independently testable and deployable:
- **After US1**: MVP scale practice works end-to-end
- **After US2**: Add filtering capability
- **After US3**: Add mode switching and history

### 4. Reuse Existing Patterns

Leverage proven patterns from chord flashcards:
- Copy chord-generator.ts → scale-generator.ts and modify
- Copy chord-filter.tsx → scale-filter.tsx and modify
- Reuse countdown-timer.tsx without changes
- Follow same database patterns (singleton preferences, session records)

---

## File Change Summary

### NEW Files (30)

**Lib**:
- lib/scale-generator.ts
- lib/scale-session-manager.ts

**Hooks**:
- hooks/use-scale-preferences.ts
- hooks/use-scale-practice-session.ts

**Components**:
- components/scale-display.tsx
- components/scale-filter.tsx
- components/mode-selector.tsx

**Pages**:
- app/scales/page.tsx
- app/scales-settings/page.tsx
- app/scales-history/page.tsx

**Tests (Unit)**:
- __tests__/unit/scale-generator.test.ts
- __tests__/unit/scale-session-manager.test.ts
- __tests__/unit/use-scale-preferences.test.ts
- __tests__/unit/use-scale-practice-session.test.ts

**Tests (E2E)**:
- __tests__/e2e/scale-practice.spec.ts
- __tests__/e2e/scale-settings.spec.ts
- __tests__/e2e/scale-history.spec.ts
- __tests__/e2e/mode-switching.spec.ts

### MODIFIED Files (4)

- db/schema.sql (add scale tables)
- lib/types.ts (add scale types)
- lib/db.ts (add scale database functions)
- components/session-summary.tsx (add mode parameter)
- app/page.tsx (add mode selector)
- app/layout.tsx (add scale practice nav links)

### REUSED Files (No Changes)

- hooks/use-timer.ts (reused for scales)
- components/countdown-timer.tsx (reused for scales)
- All existing chord practice files (no changes)

---

## Testing Checklist

### Unit Tests Coverage

- [ ] scale-generator.ts: getAllScaleTypes, getAvailableScales, selectRandomScale
- [ ] scale-session-manager.ts: startScaleSession, recordScaleInSession, endScaleSession, getScalePracticeHistory
- [ ] useScalePreferences: load, update, reset preferences
- [ ] useScalePracticeSession: start, record, end session

### E2E Tests Coverage

- [ ] Scale practice session flow (start → practice → end → summary)
- [ ] Timer countdown and auto-advance
- [ ] Scale type filtering and persistence
- [ ] Time limit validation (3-60 seconds)
- [ ] Mode switching (chord ↔ scale)
- [ ] Separate histories (chord sessions not in scale history)
- [ ] Scale history page (display, delete, stats)

### Manual Testing (from quickstart.md)

- [ ] Scenario 1: First-time scale practice
- [ ] Scenario 2: Scale settings configuration
- [ ] Scenario 3: Scale type filtering
- [ ] Scenario 4: Mode switching
- [ ] Scenario 5: Scale practice history
- [ ] Scenario 6: Timer validation (boundary conditions)
- [ ] Scenario 7: Scale display formatting
- [ ] Scenario 8: Performance test (100+ scales)
- [ ] Scenario 9: Accessibility check
- [ ] Scenario 10: Edge case (single scale selection)

---

## Success Metrics

### Technical Metrics

- [ ] All 71 unit tests passing (17 new scale tests + 54 existing chord tests)
- [ ] All 7 E2E test suites passing (4 new scale suites + 3 existing chord suites)
- [ ] 0 TypeScript errors
- [ ] 0 ESLint warnings
- [ ] Page load time <2s (per SC-001)
- [ ] Timer updates at 60 FPS (per SC-002)
- [ ] Can practice 100+ scales without performance degradation (per SC-003)

### User-Facing Metrics

- [ ] Scale filter preferences persist across browser sessions (SC-004)
- [ ] 90% user distinction rate between chord and scale modes (SC-005)
- [ ] No consecutive duplicate scales appear (SC-006)

### Code Quality Metrics

- [ ] All new code follows existing patterns from chord practice
- [ ] No code duplication (shared logic extracted to utilities)
- [ ] All components have data-testid for testing
- [ ] All interactive elements have ARIA labels
- [ ] Mobile responsive design verified on 3+ screen sizes

---

## Risk Mitigation

### Identified Risks

1. **Database Migration Risk**: Adding new tables to existing database
   - Mitigation: Test schema changes in isolated environment first
   - Fallback: Schema migration can be rolled back without affecting chord tables

2. **Component Reuse Risk**: Modifying session-summary.tsx could break chord practice
   - Mitigation: Add mode parameter with default value to maintain backward compatibility
   - Testing: Re-run all chord practice tests after modification

3. **Performance Risk**: sql.js performance with 2x the data (chord + scale sessions)
   - Mitigation: Limit history queries to 50 sessions per mode
   - Testing: Performance test with 100+ sessions per mode

4. **UX Confusion Risk**: Users might confuse chord and scale practice modes
   - Mitigation: Clear visual distinction in mode selector, separate navigation links
   - Testing: User testing to validate 90% distinction rate (SC-005)

---

## Completion Criteria

### Phase Completion

Each phase is considered complete when:
1. All tasks in phase are checked off
2. All unit tests for phase are passing
3. All E2E tests for phase are passing
4. Manual testing scenarios for phase are validated
5. No regressions in existing chord practice functionality

### Feature Completion

Feature is considered complete when:
1. All 6 phases are complete
2. All 71 tasks are checked off
3. All success metrics are met
4. All testing checklists are validated
5. Constitution principles are maintained (no violations)
6. Ready for user acceptance testing

---

## Notes

- **Pattern Reuse**: This feature heavily reuses patterns from 001-chord-flashcards. When in doubt, mirror the chord practice implementation.
- **Incremental Testing**: Test each user story independently before moving to the next. Don't wait until Phase 6 to start testing.
- **Database Independence**: Scale and chord data are completely independent. No foreign keys or joins between them.
- **Timer Reuse**: The existing useTimer hook works perfectly for scales - no modifications needed.
- **Accessibility**: Add data-testid and ARIA labels as you build components, not as an afterthought.

---

**Next Steps**: Begin implementation starting with Phase 1 (Setup), then proceed through phases sequentially or use parallel execution opportunities as defined above.
