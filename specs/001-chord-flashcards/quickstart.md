# Quickstart Guide: Chord Flashcards

**Feature**: 001-chord-flashcards
**Date**: 2025-12-30
**Purpose**: Development setup, manual testing scenarios, and validation workflows

## Overview

This guide provides step-by-step instructions for:

1. Setting up the development environment
2. Running the application locally
3. Manually testing all user stories
4. Validating success criteria
5. Running automated tests

---

## Prerequisites

- **Node.js**: 18.x or higher
- **npm** or **pnpm**: Latest version
- **Git**: For version control
- **Browser**: Chrome, Firefox, Safari, or Edge (for testing)

---

## 1. Development Setup

### Step 1: Install Dependencies

```bash
cd /Users/robwilkinson/dev/jazzgym
npm install

# Or with pnpm
pnpm install
```

### Step 2: Initialize shadcn/ui

```bash
npx shadcn-ui@latest init

# Add required components
npx shadcn-ui@latest add button card select dialog checkbox label input
```

### Step 3: Set Up Database Schema

The database will be initialized automatically on first app load. To manually initialize:

```bash
# Create db directory
mkdir -p db

# Schema is loaded from db/schema.sql on first run
```

### Step 4: Configure Environment

Create `.env.local` (if needed for configuration):

```bash
# Example environment variables (if any)
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Step 5: Start Development Server

```bash
npm run dev

# Or with pnpm
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Manual Testing Scenarios

### User Story 1: Quick Practice Session (P1) 🎯

**Goal**: Verify core timed flashcard functionality.

#### Test Scenario 1.1: Start Basic Practice Session

1. **Open application** at http://localhost:3000
2. **Expected**: Home page loads with "Start Practice" button visible
3. **Click "Start Practice"**
4. **Expected**:
   - Large chord name appears (e.g., "Cmaj7")
   - Countdown timer visible showing 10 seconds (default)
   - Timer decrements every second (10 → 9 → 8 → ...)
5. **Wait for timer to reach 0**
6. **Expected**:
   - New chord automatically appears
   - Timer resets to 10 seconds
7. **Repeat for 5-10 chords**
8. **Click "End Session"**
9. **Expected**:
   - Session summary modal appears
   - Shows: "Chords practiced: 10", "Time: ~1 min 40s"

**Success Criteria Validated**:
- ✅ SC-001: Session started within 2 seconds
- ✅ SC-002: Timer updates smoothly (1s intervals)
- ✅ SC-003: 10-chord session completed quickly

---

#### Test Scenario 1.2: Configure Time Limit

1. **Navigate to Settings** (click Settings icon/link)
2. **Expected**: Settings page with "Time Limit" slider/input
3. **Change time limit to 5 seconds**
4. **Click "Save"**
5. **Return to home page**
6. **Click "Start Practice"**
7. **Expected**:
   - Timer shows 5 seconds (not default 10)
   - Timer decrements from 5 → 4 → 3 → 2 → 1 → 0
8. **Verify auto-advance after 5 seconds**

**Success Criteria Validated**:
- ✅ SC-004: Time limit configuration successful on first attempt
- ✅ SC-006: Preferences persist (time limit saved)

---

#### Test Scenario 1.3: Long Practice Session

1. **Start practice session**
2. **Let session run for 100+ chords** (or manually advance rapidly)
3. **Expected**:
   - No performance degradation
   - Timer remains smooth
   - UI responsive throughout
4. **End session**
5. **Expected**: Summary shows 100+ chords correctly

**Success Criteria Validated**:
- ✅ SC-005: Supports 100+ chord sessions without degradation

---

### User Story 2: Customized Practice (P2)

**Goal**: Verify chord type filtering and preference persistence.

#### Test Scenario 2.1: Filter Chord Types

1. **Navigate to Settings**
2. **Expected**: Chord type filter section with checkboxes/select
   - Options: Major, Minor, Dominant, Diminished, Augmented, Suspended, Extended
3. **Uncheck all except "Major" and "Dominant"**
4. **Click "Save"**
5. **Return to home page**
6. **Start practice session**
7. **Expected**:
   - Only major and dominant chords appear (e.g., Cmaj7, C7, Gmaj9, G7, etc.)
   - No minor, diminished, augmented, suspended, or extended chords
8. **Practice 10-20 chords to verify**

**Success Criteria Validated**:
- ✅ SC-004: Chord filter configuration successful
- ✅ SC-006: Preferences persist (selected chord types saved)

---

#### Test Scenario 2.2: Restore All Chord Types

1. **Navigate to Settings**
2. **Check all chord type boxes** (or click "Select All")
3. **Click "Save"**
4. **Start practice session**
5. **Expected**: Full range of jazz chords appears (variety of types)

---

#### Test Scenario 2.3: Edge Case - No Chords Selected

1. **Navigate to Settings**
2. **Uncheck all chord types**
3. **Try to save**
4. **Expected**:
   - Error message: "At least one chord type must be selected"
   - Settings not saved
   - OR: "Save" button disabled until at least one type selected

---

### User Story 3: Progress Tracking (P3)

**Goal**: Verify session history storage and display.

#### Test Scenario 3.1: View Practice History

1. **Complete 3-5 practice sessions** (various lengths)
2. **Navigate to History page**
3. **Expected**:
   - List of past sessions displayed
   - Each session shows:
     - Date/time (e.g., "Dec 30, 2025 - 2:30 PM")
     - Chord count (e.g., "15 chords")
     - Duration (e.g., "2 min 30s")
   - Sessions ordered by most recent first

---

#### Test Scenario 3.2: View Practice Statistics

1. **On History page**
2. **Expected**: Summary statistics visible
   - "Total Sessions: X"
   - "Total Chords Practiced: Y"
   - "Total Practice Time: Z minutes"
3. **Verify numbers match sum of individual sessions**

---

#### Test Scenario 3.3: Delete Single Session

1. **On History page**
2. **Click delete icon on one session**
3. **Confirm deletion**
4. **Expected**:
   - Session removed from list
   - Statistics updated (totals decreased)

---

#### Test Scenario 3.4: Clear All History

1. **On History page**
2. **Click "Clear All History"**
3. **Confirm action**
4. **Expected**:
   - All sessions deleted
   - Statistics reset to 0
   - Message: "No practice history yet. Start practicing to track your progress!"

---

## 3. Edge Case Testing

### Edge Case 1: Extremely Short Time Limit

1. **Set time limit to 1 second** (if allowed)
2. **Start practice**
3. **Expected**:
   - Chords advance every 1 second (very fast)
   - OR: Warning message "Recommended: 3-60 seconds"
   - OR: Minimum enforced at 3 seconds

---

### Edge Case 2: Very Long Time Limit

1. **Set time limit to 60 seconds** (maximum)
2. **Start practice**
3. **Expected**:
   - Timer shows 60 seconds
   - Decrements correctly
   - Allows user to manually advance before timer expires (optional feature)

---

### Edge Case 3: Close App Mid-Session

1. **Start practice session**
2. **Close browser tab/window**
3. **Reopen application**
4. **Expected**:
   - Session not resumed (acceptable limitation for MVP)
   - OR: Warning on close: "Session in progress. Are you sure?"

---

### Edge Case 4: Repetitive Chord Selection

1. **Filter to only 1-2 chord types** (e.g., only "Major")
2. **Start practice with 20+ chords**
3. **Expected**:
   - Same few chords repeat (acceptable)
   - All are major chords (filter working correctly)

---

### Edge Case 5: Offline Functionality

1. **Load application while online**
2. **Disconnect internet**
3. **Start practice session**
4. **Expected**:
   - Application still works (offline-capable)
   - Database operations succeed (local SQLite)
   - No errors or failures

---

## 4. Automated Testing

### Run Unit Tests

```bash
npm run test

# Or with coverage
npm run test:coverage
```

**Expected Output**:
```
✓ lib/chord-generator.test.ts (5 tests)
✓ lib/session-manager.test.ts (6 tests)
✓ hooks/use-timer.test.ts (4 tests)

Test Files: 3 passed (3)
Tests: 15 passed (15)
Coverage: >80% on critical logic
```

---

### Run E2E Tests

```bash
npm run test:e2e

# Or in UI mode
npm run test:e2e:ui
```

**Expected Output**:
```
✓ __tests__/e2e/practice-session.spec.ts (5 tests)
  ✓ should start practice session and display chord
  ✓ should auto-advance after timer expires
  ✓ should end session and show summary
  ✓ should configure custom time limit
  ✓ should support 100+ chord sessions

✓ __tests__/e2e/settings.spec.ts (3 tests)
  ✓ should filter chord types
  ✓ should persist preferences
  ✓ should prevent empty filter selection

✓ __tests__/e2e/history.spec.ts (4 tests)
  ✓ should display practice history
  ✓ should show statistics
  ✓ should delete single session
  ✓ should clear all history

Test Files: 3 passed (3)
Tests: 12 passed (12)
```

---

## 5. Validation Checklist

Use this checklist to verify all functional requirements are met:

### Functional Requirements Validation

- [ ] **FR-001**: Chord name displayed in large, readable text ✅
- [ ] **FR-002**: No chord fingerings/diagrams shown ✅
- [ ] **FR-003**: Countdown timer visible and accurate ✅
- [ ] **FR-004**: Auto-advance when timer reaches 0 ✅
- [ ] **FR-005**: Configurable time limit (3-60 seconds) ✅
- [ ] **FR-006**: Comprehensive jazz chord types supported ✅
- [ ] **FR-007**: Chord type filtering available ✅
- [ ] **FR-008**: Random chord selection working ✅
- [ ] **FR-009**: Session data persisted to database ✅
- [ ] **FR-010**: Start/end session on demand ✅
- [ ] **FR-011**: Session summary displayed at end ✅
- [ ] **FR-012**: Preferences persist between sessions ✅
- [ ] **FR-013**: Practice history viewable ✅

### Success Criteria Validation

- [ ] **SC-001**: Session starts within 2 seconds ✅
- [ ] **SC-002**: Timer updates smoothly (1s intervals) ✅
- [ ] **SC-003**: 10-chord session completes quickly ✅
- [ ] **SC-004**: 90% configuration success rate ✅
- [ ] **SC-005**: Supports 100+ chords without degradation ✅
- [ ] **SC-006**: Preferences persist correctly ✅

---

## 6. Known Limitations (MVP)

Document any known limitations for transparency:

1. **Session not resumed on reload**: If browser closes mid-session, session is lost
2. **Timer drift on inactive tabs**: Browser may throttle timers when tab is inactive (acceptable for practice app)
3. **No undo for history deletion**: Clearing history is permanent (add confirmation dialogs)
4. **Single user only**: No multi-user accounts or profiles (per spec)

---

## 7. Development Workflow

### Making Changes

1. **Create feature branch** (if not already on 001-chord-flashcards)
2. **Make code changes**
3. **Run tests**: `npm run test`
4. **Run E2E tests**: `npm run test:e2e`
5. **Manual testing** using scenarios above
6. **Commit changes**: Follow conventional commits (e.g., "feat: add chord filtering")

### Before Merging

- [ ] All unit tests passing
- [ ] All E2E tests passing
- [ ] Manual testing checklist completed
- [ ] No console errors in browser
- [ ] Code reviewed (if team project)

---

## 8. Troubleshooting

### Database Not Initializing

**Issue**: "Cannot find database" error

**Solution**:
1. Check `db/schema.sql` exists
2. Verify `lib/db.ts` initialization logic runs on app load
3. Check browser console for errors
4. Clear browser storage and reload

---

### Timer Not Updating

**Issue**: Timer stuck or not decrementing

**Solution**:
1. Check `useTimer` hook implementation
2. Verify `setInterval` is not being cleared prematurely
3. Check React re-render logic (timer state updates triggering renders)

---

### Preferences Not Persisting

**Issue**: Settings reset after page reload

**Solution**:
1. Verify SQLite database persisted to IndexedDB
2. Check `updatePreferences` database call succeeds
3. Verify `getPreferences` loads on app startup
4. Check browser console for database errors

---

## 9. Next Steps

After completing manual and automated testing:

1. **Generate tasks.md**: Run `/speckit.tasks` to create implementation tasks
2. **Begin implementation**: Follow task order from tasks.md
3. **Test as you build**: Run tests after each task completion
4. **Deploy**: Once all tasks complete, build and deploy application

---

## Summary

This quickstart guide provides:

- ✅ Complete development setup instructions
- ✅ Manual testing scenarios for all 3 user stories
- ✅ Edge case test coverage
- ✅ Automated test execution commands
- ✅ Validation checklist for all requirements
- ✅ Known limitations documented
- ✅ Troubleshooting guide

**Status**: Ready for implementation. All planning artifacts complete.
