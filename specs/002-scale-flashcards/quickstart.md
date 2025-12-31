# Quickstart: Scale Flashcards Testing

**Feature**: 002-scale-flashcards
**Date**: 2025-12-30
**Purpose**: Manual testing scenarios and integration test guide

## Overview

This guide provides step-by-step testing scenarios for the scale flashcard feature. Use these scenarios for:
- Manual QA during development
- Integration testing verification
- Smoke testing after deployment
- Bug reproduction

---

## Prerequisites

### Setup

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Open application**:
   ```
   http://localhost:3000
   ```

3. **Clear browser state** (for fresh tests):
   - Open DevTools → Application → IndexedDB → Delete `jazzgym` database
   - Refresh page

---

## Test Scenario 1: First-Time Scale Practice

**Goal**: Verify scale practice works with default settings

**Steps**:

1. **Navigate to home page** (`/`)
   - ✅ Should see "Chord Practice" and "Scale Practice" options

2. **Click "Scale Practice"** (or navigate to `/scales`)
   - ✅ Should land on scale practice page
   - ✅ Should see "Start Practice" button
   - ✅ Should see settings link/icon

3. **Click "Start Practice"**
   - ✅ First scale name appears (e.g., "C Major")
   - ✅ Timer starts counting down from 10 seconds (default)
   - ✅ Timer updates at least once per second
   - ✅ Scale name is displayed prominently and clearly

4. **Wait for timer to reach 0**
   - ✅ New scale name appears automatically
   - ✅ New scale is different from previous scale
   - ✅ Timer resets to 10 seconds and continues

5. **Let 3-5 scales auto-advance**
   - ✅ Each scale displays clearly
   - ✅ No duplicate consecutive scales
   - ✅ Timer behavior consistent for each scale

6. **Click "End Session"** (or similar UI element)
   - ✅ Session ends immediately
   - ✅ Session summary appears
   - ✅ Summary shows: scale count (3-5), duration (~30-50s), time per scale (10s)

**Expected Result**: Scale practice session completes successfully with default settings.

---

## Test Scenario 2: Scale Settings Configuration

**Goal**: Verify scale preferences can be changed and persist

**Steps**:

1. **Navigate to scale settings** (`/scales-settings`)
   - ✅ Settings page loads
   - ✅ Time limit slider/input shows default value (10s)
   - ✅ Scale type checkboxes show all enabled by default

2. **Change time limit to 5 seconds**
   - ✅ Slider/input updates to 5
   - ✅ Value is accepted (within 3-60 range)

3. **Disable some scale types** (e.g., uncheck "Altered", "Lydian", "Phrygian")
   - ✅ Checkboxes update
   - ✅ At least one scale type remains selected

4. **Save settings**
   - ✅ Success message/feedback appears
   - ✅ Settings page reflects saved values

5. **Navigate to scale practice** (`/scales`)
   - ✅ Click "Start Practice"
   - ✅ Timer counts down from 5 seconds (not 10)
   - ✅ Only enabled scale types appear (no Altered, Lydian, Phrygian if disabled)

6. **Refresh page** (F5)
   - ✅ Settings still reflect custom values (5s, selected types only)

7. **Start another session**
   - ✅ Custom settings still apply

**Expected Result**: Settings persist across sessions and page refreshes.

---

## Test Scenario 3: Scale Type Filtering

**Goal**: Verify filtering by scale type works correctly

**Steps**:

1. **Navigate to scale settings** (`/scales-settings`)

2. **Enable only "Major" scale type** (disable all others)
   - ✅ Only Major checkbox is checked
   - ✅ Save settings

3. **Start scale practice session**
   - ✅ All scales shown are "X Major" (C Major, D Major, F# Major, etc.)
   - ✅ No other scale types appear (no Minor, Dorian, etc.)
   - ✅ Different root notes appear (not just C Major repeatedly)

4. **Return to settings**

5. **Enable only "Natural Minor" and "Harmonic Minor"**
   - ✅ Save settings

6. **Start new scale practice session**
   - ✅ Only Natural Minor and Harmonic Minor scales appear
   - ✅ Both types appear across multiple root notes

7. **Try to disable all scale types** (edge case)
   - ✅ System prevents this (error message or auto-re-enables one type)
   - ✅ Cannot start practice with 0 enabled types

**Expected Result**: Scale filtering works correctly and prevents invalid states.

---

## Test Scenario 4: Mode Switching (Chord ↔ Scale)

**Goal**: Verify switching between chord and scale practice preserves separate histories

**Steps**:

1. **Start chord practice session** (`/`)
   - ✅ Complete 5 chords
   - ✅ View session summary (5 chords, ~50s)

2. **Navigate to chord history** (`/history`)
   - ✅ Chord session appears in history

3. **Navigate to scale practice** (`/scales`)
   - ✅ Start scale practice session
   - ✅ Complete 8 scales
   - ✅ View session summary (8 scales, ~80s)

4. **Navigate to scale history** (`/scales-history`)
   - ✅ Scale session appears in history
   - ✅ Chord session does NOT appear in scale history

5. **Navigate back to chord history** (`/history`)
   - ✅ Chord session still present
   - ✅ Scale session does NOT appear in chord history

6. **Check settings**
   - ✅ Chord settings (`/settings`) show chord preferences
   - ✅ Scale settings (`/scales-settings`) show scale preferences
   - ✅ Each mode has independent time limits and filters

**Expected Result**: Chord and scale practice maintain completely separate histories and settings.

---

## Test Scenario 5: Scale Practice History

**Goal**: Verify scale history tracks sessions correctly

**Steps**:

1. **Complete 3 scale practice sessions**:
   - Session 1: 5 scales, 10s each
   - Session 2: 10 scales, 5s each
   - Session 3: 3 scales, 15s each

2. **Navigate to scale history** (`/scales-history`)
   - ✅ All 3 sessions appear
   - ✅ Sessions are ordered newest first
   - ✅ Each session shows: scale count, duration, date/time

3. **Click on Session 2**
   - ✅ Session details appear
   - ✅ Details show: 10 scales, ~50s duration, 5s time limit
   - ✅ (Optional) List of scales practiced appears

4. **View overall statistics** (if implemented)
   - ✅ Total sessions: 3
   - ✅ Total scales: 18 (5 + 10 + 3)
   - ✅ Total practice time: ~165s (~3 minutes)

5. **Delete Session 1**
   - ✅ Confirmation prompt appears
   - ✅ Confirm deletion
   - ✅ Session 1 removed from list
   - ✅ Statistics update (2 sessions, 13 scales)

6. **Clear all history** (if implemented)
   - ✅ Confirmation prompt appears
   - ✅ Confirm clear all
   - ✅ History list is empty
   - ✅ Statistics show 0 sessions, 0 scales

**Expected Result**: Scale history accurately tracks and displays practice sessions.

---

## Test Scenario 6: Timer Validation

**Goal**: Verify timer boundary conditions

**Steps**:

1. **Navigate to scale settings**

2. **Set time limit to 3 seconds** (minimum)
   - ✅ Value is accepted
   - ✅ Start practice → Timer counts down from 3
   - ✅ Timer behaves correctly at minimum value

3. **Set time limit to 60 seconds** (maximum)
   - ✅ Value is accepted
   - ✅ Start practice → Timer counts down from 60
   - ✅ Timer behaves correctly at maximum value

4. **Try to set time limit to 2 seconds** (below minimum)
   - ✅ Value is rejected or auto-corrected to 3
   - ✅ Error message appears

5. **Try to set time limit to 61 seconds** (above maximum)
   - ✅ Value is rejected or auto-corrected to 60
   - ✅ Error message appears

**Expected Result**: Timer respects 3-60 second constraints.

---

## Test Scenario 7: Scale Display Formatting

**Goal**: Verify scale names are formatted correctly

**Steps**:

1. **Configure settings to enable all scale types**

2. **Start practice session**

3. **Observe scale name formatting**:
   - ✅ Format is "[Root] [Type]" (e.g., "C Major", "F# Harmonic Minor")
   - ✅ Root notes use sharps or flats consistently
   - ✅ Scale type names are spelled correctly:
     - "Major" (not "maj" or "Maj")
     - "Natural Minor" (not "Minor" or "natural minor")
     - "Harmonic Minor"
     - "Melodic Minor"
     - "Dorian"
     - "Mixolydian"
     - "Altered"
   - ✅ Text is large and readable
   - ✅ Text is centered or prominently placed

4. **Check multiple root notes**:
   - ✅ C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab, A, A#/Bb, B
   - ✅ Enharmonic equivalents (e.g., C# vs Db) are handled consistently

**Expected Result**: Scale names are correctly formatted and readable.

---

## Test Scenario 8: Performance Test

**Goal**: Verify app handles 100+ scales in a session

**Steps**:

1. **Navigate to scale settings**
   - Set time limit to 3 seconds (fastest)

2. **Start practice session**

3. **Let session run for 100+ scales** (~5 minutes)
   - ✅ Timer updates smoothly throughout
   - ✅ No UI lag or freezing
   - ✅ No memory leaks (check DevTools Memory tab)
   - ✅ Scale selection remains random (no patterns emerge)

4. **End session**
   - ✅ Session summary shows correct count (100+)
   - ✅ Summary loads quickly

5. **View session in history**
   - ✅ Session appears in history
   - ✅ History page loads quickly despite large session

**Expected Result**: App performs smoothly with 100+ scales.

---

## Test Scenario 9: Accessibility Check

**Goal**: Verify keyboard navigation and screen reader support

**Steps**:

1. **Navigate to scale practice using only keyboard**:
   - ✅ Tab key moves focus through navigation
   - ✅ Enter/Space activates "Start Practice" button
   - ✅ Can access settings via keyboard

2. **During practice session**:
   - ✅ Scale name is announced to screen readers
   - ✅ Timer updates are announced (or have aria-live region)
   - ✅ "End Session" button is keyboard accessible

3. **Settings page**:
   - ✅ All checkboxes are keyboard accessible
   - ✅ Time limit slider is keyboard accessible (arrow keys)
   - ✅ Save button is keyboard accessible

4. **Check ARIA labels** (using browser inspector):
   - ✅ Scale display has aria-label="Current scale: [name]"
   - ✅ Timer has role="timer" or progressbar
   - ✅ Buttons have descriptive labels

**Expected Result**: Scale practice is fully keyboard and screen reader accessible.

---

## Test Scenario 10: Edge Case - Single Scale Selection

**Goal**: Verify behavior when only one scale is available

**Steps**:

1. **Navigate to scale settings**

2. **Enable only "Major" scale type**

3. **Navigate to scale practice**
   - Note: With all 12 root notes, there are still 12 scales available

4. **Let session run for 5+ scales**
   - ✅ All 12 Major scales appear (C Major, D Major, etc.)
   - ✅ No consecutive duplicates (C Major → D Major, not C Major → C Major)

5. **Return to settings** (theoretical extreme case)
   - If the app allowed enabling only one root note + one type:
   - ✅ System should either prevent starting practice OR
   - ✅ Display the same scale repeatedly with a warning

**Expected Result**: Handles single scale gracefully (though unlikely in practice).

---

## Integration Test Checklist

Use this checklist when running the full test suite:

### Unit Tests (Vitest)

- [ ] `scale-generator.test.ts`: All tests passing
  - [ ] getAllScaleTypes()
  - [ ] getAvailableScales()
  - [ ] selectRandomScale()
  - [ ] No consecutive duplicates

- [ ] `scale-session-manager.test.ts`: All tests passing
  - [ ] startScaleSession()
  - [ ] recordScaleInSession()
  - [ ] endScaleSession()
  - [ ] getScalePracticeHistory()

- [ ] `use-scale-preferences.test.ts`: All tests passing
  - [ ] Load preferences
  - [ ] Update preferences
  - [ ] Validation (time limit, enabled types)

- [ ] Reused components still work:
  - [ ] `timer.test.ts`
  - [ ] `session-summary.test.ts` (with mode parameter)

### E2E Tests (Playwright)

- [ ] `scale-practice.spec.ts`: All scenarios passing
  - [ ] Start session
  - [ ] Timer countdown
  - [ ] Scale auto-advance
  - [ ] End session
  - [ ] Session summary

- [ ] `scale-settings.spec.ts`: All scenarios passing
  - [ ] Update time limit
  - [ ] Filter scale types
  - [ ] Preferences persist
  - [ ] Validation (boundary conditions)

- [ ] `scale-history.spec.ts`: All scenarios passing
  - [ ] View history
  - [ ] Session details
  - [ ] Delete session
  - [ ] Clear all history

- [ ] `mode-switching.spec.ts`: All scenarios passing
  - [ ] Switch between chord and scale modes
  - [ ] Separate histories
  - [ ] Separate preferences

### Cross-Browser Testing

- [ ] Chrome/Edge: All tests passing
- [ ] Firefox: All tests passing
- [ ] Safari: All tests passing
- [ ] Mobile browsers (Chrome/Safari): Basic functionality working

---

## Common Issues & Debugging

### Issue: Scales not advancing

**Check**:
- Timer hook is calling `onComplete` callback
- `handleNextScale` function is wired to timer
- Database insert succeeding (check DevTools console)

**Debug**:
```javascript
console.log('Timer onComplete called');
console.log('Current scale:', currentScale);
console.log('Available scales:', availableScales.length);
```

---

### Issue: Settings not persisting

**Check**:
- IndexedDB database exists (DevTools → Application → IndexedDB)
- `scale_preferences` table has row with id=1
- `enabled_scale_types` field is valid JSON

**Debug**:
```javascript
// In browser console
const db = await openDatabase();
const prefs = await db.exec('SELECT * FROM scale_preferences');
console.log(prefs);
```

---

### Issue: Only certain scale types appearing

**Check**:
- Settings page shows correct enabled types
- `getAvailableScales()` filtering correctly
- Scale library includes all expected scales

**Debug**:
```javascript
import { getAvailableScales, getAllScaleTypes } from '@/lib/scale-generator';
const allTypes = getAllScaleTypes();
const scales = getAvailableScales(allTypes);
console.log('Total scales:', scales.length); // Should be ~84-120
```

---

### Issue: History showing wrong data

**Check**:
- `scale_practice_sessions` table has correct data
- Foreign keys in `scale_session_records` pointing to right sessions
- Query filtering by `ended_at IS NOT NULL`

**Debug**:
```sql
-- In browser console or DB tool
SELECT * FROM scale_practice_sessions ORDER BY started_at DESC LIMIT 10;
SELECT * FROM scale_session_records WHERE session_id = <session_id>;
```

---

## Performance Benchmarks

### Load Time
- **Initial page load**: <2s (same as chord practice)
- **Scale practice page load**: <500ms
- **Settings page load**: <500ms
- **History page load**: <1s (with 50 sessions)

### Runtime Performance
- **Timer updates**: 60 FPS (smooth countdown)
- **Scale selection**: <10ms per scale
- **Database operations**: <50ms per insert/update
- **UI interactions**: <100ms response time

### Memory Usage
- **Initial load**: ~30-50 MB
- **After 100 scales**: <100 MB (no leaks)

---

## Summary

This quickstart guide covers:
- **10 manual test scenarios** for scale practice feature
- **Integration test checklist** for automated tests
- **Debugging guide** for common issues
- **Performance benchmarks** for validation

**Next Step**: After Phase 1 design artifacts complete, proceed to Phase 2 to generate tasks.md with `/speckit.tasks` command.
