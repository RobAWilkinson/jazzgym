# Feature Specification: Chord Flashcards

**Feature Branch**: `001-chord-flashcards`
**Created**: 2025-12-30
**Status**: Draft
**Input**: User description: "Build an application that can help me understand and practice memorizing jazz guitar chords, scales, melodies, and standards. Step 1 is a chord flash card like feature that displays a chord, and then you have to play that chord in a set amount of time. Don't display the answer since there are many potential answers"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Practice Session (Priority: P1)

A jazz guitar student wants to quickly practice chord recognition by being shown chord names and playing them on their guitar within a time limit, without being shown fingerings so they can develop their own chord vocabulary.

**Why this priority**: This is the core MVP feature - timed chord flashcard practice. It delivers immediate value and establishes the foundation for all future practice features.

**Independent Test**: Can be fully tested by launching the application, starting a practice session, and verifying that chord names appear one at a time with a countdown timer, and that the system advances to the next chord when time expires.

**Acceptance Scenarios**:

1. **Given** the user opens the application, **When** they start a practice session, **Then** a chord name is displayed prominently on screen with a countdown timer
2. **Given** a chord is displayed with a timer, **When** the timer counts down to zero, **Then** the system automatically displays the next chord and resets the timer
3. **Given** the user is practicing chords, **When** they complete a set of chords, **Then** the session ends and shows a summary
4. **Given** the user wants to practice, **When** they configure the time limit per chord, **Then** the practice session uses that custom time setting

---

### User Story 2 - Customized Practice (Priority: P2)

A user wants to focus their practice on specific types of jazz chords (e.g., only major 7th, minor 7th, and dominant 7th chords) rather than practicing all chord types randomly.

**Why this priority**: Targeted practice is more effective than random practice. Users should be able to focus on weak areas or specific chord families.

**Independent Test**: Can be tested by selecting specific chord types from a list, starting a session, and verifying that only the selected chord types appear during practice.

**Acceptance Scenarios**:

1. **Given** the user is configuring a practice session, **When** they select specific chord types to practice, **Then** only those chord types appear during the session
2. **Given** the user has selected chord filters, **When** they save these preferences, **Then** future sessions remember their last selections
3. **Given** the user wants to practice all chords again, **When** they clear all filters, **Then** the full range of jazz chords becomes available

---

### User Story 3 - Progress Tracking (Priority: P3)

A user wants to see their practice history to understand how much they've practiced and track their improvement over time.

**Why this priority**: Progress tracking motivates consistent practice and helps users see their improvement, but the core practice functionality must exist first.

**Independent Test**: Can be tested by completing multiple practice sessions and verifying that session history (date, duration, number of chords practiced) is stored and displayed.

**Acceptance Scenarios**:

1. **Given** the user has completed practice sessions, **When** they view their practice history, **Then** they see a list of past sessions with date, duration, and chord count
2. **Given** the user is viewing their history, **When** they look at practice statistics, **Then** they see total practice time and total chords practiced
3. **Given** the user wants a fresh start, **When** they clear their practice history, **Then** all historical data is removed

---

### Edge Cases

- What happens when the user sets an extremely short time limit (e.g., 1 second) that's impossible to complete?
- What happens when the user selects chord filters that result in only one or two chord types (very repetitive practice)?
- How does the system handle very long practice sessions (e.g., 100+ chords in a row)?
- What happens if the user closes the application mid-session?
- What happens when no chord types are available (all filters exclude all chords)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display one chord name at a time in large, readable text
- **FR-002**: System MUST NOT display chord fingerings, diagrams, or voicings (user must know/discover these themselves)
- **FR-003**: System MUST display a countdown timer showing remaining time to play the current chord
- **FR-004**: System MUST automatically advance to the next chord when the timer reaches zero
- **FR-005**: System MUST allow users to configure the time limit per chord (in seconds)
- **FR-006**: System MUST support a comprehensive set of jazz chord types including: major, minor, dominant 7th, major 7th, minor 7th, half-diminished, diminished, augmented, sus chords, altered chords, and extended chords (9th, 11th, 13th)
- **FR-007**: System MUST allow users to select which chord types to include in practice sessions
- **FR-008**: System MUST randomly select chords from the available pool (based on user filters)
- **FR-009**: System MUST track and store practice session data (date, duration, number of chords practiced)
- **FR-010**: System MUST allow users to start and end practice sessions on demand
- **FR-011**: System MUST display a session summary at the end showing number of chords practiced and total time
- **FR-012**: System MUST persist user preferences (time limit, chord type selections) between sessions
- **FR-013**: System MUST allow users to view their practice history

### Key Entities

- **Chord**: Represents a chord type (e.g., "Cmaj7", "F#m7b5", "Bb13"). Attributes include root note (C, D, E, F, G, A, B with sharps/flats) and quality/extension (maj7, m7, dom7, dim, etc.)
- **Practice Session**: Represents a single practice session. Attributes include start time, end time, chords practiced (list), time limit setting, chord type filters used
- **User Preferences**: Stores user's saved settings. Attributes include default time limit, default chord type filters
- **Practice History**: Collection of past practice sessions for tracking and statistics

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can start a practice session and see their first chord within 2 seconds of launching the application
- **SC-002**: The countdown timer updates smoothly (at least once per second) and is clearly visible during practice
- **SC-003**: Users can complete a 10-chord practice session in under 2 minutes (excluding time spent playing chords)
- **SC-004**: 90% of users successfully configure custom time limits and chord filters on their first attempt
- **SC-005**: The system supports practice sessions of at least 100 consecutive chords without performance degradation
- **SC-006**: User preferences persist correctly between application sessions (users don't need to reconfigure settings each time)

## Assumptions

- Users have basic knowledge of music theory and understand chord symbols (e.g., "Cmaj7" means C major seventh)
- Users are practicing on an actual guitar and will self-assess whether they played the chord correctly (no audio input/verification in Step 1)
- Users have a device (computer, tablet, or phone) to run the application while practicing
- Practice sessions are individual (no multi-user or collaborative practice features in Step 1)
- All chord roots use enharmonic equivalents standard in jazz (e.g., C#/Db are both valid and may appear)
- Time limits are reasonable (between 3 seconds and 60 seconds per chord)
- The application runs offline after initial setup (no internet connection required during practice)

## Scope

### In Scope

- Display of chord names (text-based)
- Countdown timer functionality
- Random chord selection from filtered pool
- Basic chord type filtering (select which chord families to practice)
- Time limit configuration
- Session tracking and history
- User preference persistence
- Session summaries

### Out of Scope (Future Features)

- Audio input/verification (listening to played chords and providing feedback)
- Chord fingering diagrams or voicing suggestions
- Scale practice, melody practice, or standards practice (mentioned in broader vision but explicitly Step 2+)
- Progress analytics and visualizations beyond basic history
- Multiple user accounts or profiles
- Social features (sharing, competition, leaderboards)
- Metronome or backing track integration
- Suggested practice routines or AI-powered recommendations
- MIDI input support
- Specific voicing challenges (e.g., "play a rootless Cmaj7 voicing")
