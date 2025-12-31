# Feature Specification: Scale Flashcards

**Feature Branch**: `002-scale-flashcards`
**Created**: 2025-12-30
**Status**: Draft
**Input**: User description: "this app should now let a player practice a specific scale type as well. For example, it should say 'C Major scale' or 'C Harmonic Minor'"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Scale Practice Session (Priority: P1)

A jazz guitar student wants to practice scale recognition by being shown scale names (e.g., "C Major scale", "F# Harmonic Minor") and playing them on their guitar within a time limit, similar to the existing chord flashcard feature.

**Why this priority**: This is the core MVP feature - extending the existing flashcard system to include scales. It reuses the proven timer and practice mechanics while adding scale-specific content.

**Independent Test**: Can be fully tested by launching the application, selecting scale practice mode, starting a session, and verifying that scale names appear one at a time with a countdown timer that auto-advances to the next scale.

**Acceptance Scenarios**:

1. **Given** the user opens the application, **When** they select scale practice mode and start a session, **Then** a scale name (root note + scale type) is displayed prominently on screen with a countdown timer
2. **Given** a scale is displayed with a timer, **When** the timer counts down to zero, **Then** the system automatically displays the next scale and resets the timer
3. **Given** the user is practicing scales, **When** they complete a set of scales, **Then** the session ends and shows a summary (scales completed, duration)
4. **Given** the user wants to practice scales, **When** they configure the time limit per scale, **Then** the practice session uses that custom time setting

---

### User Story 2 - Scale Type Filtering (Priority: P2)

A user wants to focus their practice on specific scale types (e.g., only Major, Natural Minor, and Harmonic Minor) rather than practicing all scale types randomly.

**Why this priority**: Targeted practice allows users to focus on weak areas or specific scale families, just like the chord filtering feature.

**Independent Test**: Can be tested by selecting specific scale types from a filter list, starting a session, and verifying that only the selected scale types appear during practice.

**Acceptance Scenarios**:

1. **Given** the user is configuring a scale practice session, **When** they select specific scale types to practice (e.g., Major, Harmonic Minor), **Then** only those scale types appear during the session across all 12 root notes
2. **Given** the user has selected scale type filters, **When** they save these preferences, **Then** future scale practice sessions remember their last selections
3. **Given** the user wants to practice all scales again, **When** they select all scale types or clear filters, **Then** the full range of scale types becomes available

---

### User Story 3 - Unified Practice Mode Selection (Priority: P3)

A user wants to easily switch between practicing chords and practicing scales from a single interface, allowing them to structure their practice sessions flexibly.

**Why this priority**: Once both chord and scale practice exist, users need a convenient way to choose their practice focus. This integration story ensures a cohesive user experience.

**Independent Test**: Can be tested by navigating the application interface and verifying that users can select either chord or scale practice mode, with each mode maintaining separate settings and history.

**Acceptance Scenarios**:

1. **Given** the user is on the home page, **When** they view the practice options, **Then** they see clearly labeled options for "Chord Practice" and "Scale Practice"
2. **Given** the user switches from chord to scale practice mode, **When** they start a session, **Then** the correct content type (scales) appears with the appropriate filters and settings
3. **Given** the user has separate filter preferences for chords and scales, **When** they switch modes, **Then** each mode retains its own filter settings independently

---

### Edge Cases

- What happens when the user selects only one scale type and one root note (resulting in only one possible scale)?
- How does the system handle extremely short time limits (3 seconds) for complex scales like Altered or Bebop?
- What happens if the user starts a scale session with no scale types selected?
- How does the system behave when switching between chord and scale practice modes mid-session?
- What happens when the user has practiced 100+ scales in a single session (performance considerations)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display scale names in the format "[Root Note] [Scale Type]" (e.g., "C Major", "F# Harmonic Minor")
- **FR-002**: System MUST support at least the following scale types: Major, Natural Minor, Harmonic Minor, Melodic Minor, Dorian, Mixolydian, and Altered
- **FR-003**: System MUST include all 12 chromatic root notes (C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab, A, A#/Bb, B) for each scale type
- **FR-004**: System MUST NOT display scale fingering diagrams or note sequences during practice (similar to chord practice - user must know the scales)
- **FR-005**: System MUST use the same countdown timer mechanism as chord practice (configurable 3-60 seconds per scale)
- **FR-006**: System MUST auto-advance to the next random scale when the timer reaches zero
- **FR-007**: System MUST allow users to filter practice by scale type (e.g., practice only Major and Minor scales)
- **FR-008**: System MUST persist scale filter preferences across sessions
- **FR-009**: System MUST maintain separate practice history for scales (separate from chord practice history)
- **FR-010**: System MUST display a session summary after scale practice showing: scales practiced, duration, and time per scale setting
- **FR-011**: System MUST allow users to end a scale practice session early
- **FR-012**: System MUST provide a way to select between chord practice and scale practice modes
- **FR-013**: System MUST prevent starting a scale session if no scale types are selected

### Key Entities

- **Scale**: Represents a musical scale defined by a root note and scale type (e.g., "C Major"). Does not store fingering information - only the name for display.
- **Scale Type**: Category of scale (Major, Natural Minor, Harmonic Minor, Melodic Minor, Dorian, Mixolydian, Altered, etc.)
- **Scale Practice Session**: A timed practice session for scales, containing: session ID, start time, end time, count of scales practiced, time limit setting
- **Scale Session Record**: Individual scale shown during a session, containing: scale name, timestamp when displayed
- **Scale Preferences**: User settings for scale practice, containing: enabled scale types, default time limit per scale

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can start a scale practice session within 2 seconds of opening the scale practice mode
- **SC-002**: The timer updates visually at least once per second during scale practice
- **SC-003**: Users can practice at least 100 scales in a single session without performance degradation
- **SC-004**: Scale filter preferences persist across browser sessions and page reloads
- **SC-005**: 90% of users can successfully distinguish between chord and scale practice modes on first use
- **SC-006**: The system selects scales randomly such that consecutive identical scales are prevented

## Scope *(mandatory)*

### In Scope

- Scale name display (root + type)
- Countdown timer for scale practice (reusing chord practice timer logic)
- Scale type filtering (similar to chord type filtering)
- Scale practice session history and statistics
- Mode selection between chord and scale practice
- All 12 chromatic root notes for each scale type
- At minimum: Major, Natural Minor, Harmonic Minor, Melodic Minor, Dorian, Mixolydian, Altered scale types

### Out of Scope (Future Features)

- Scale fingering diagrams or visual fretboard displays
- Scale degree notation or interval patterns
- Audio playback of scales
- Melodic pattern practice within scales
- Scale exercises or etudes
- Mode relationship diagrams (showing parent scales)
- Custom scale creation or exotic scales beyond standard jazz scales
- Multi-octave scale patterns
- Position-specific scale practice (e.g., "play this scale in 5th position")

## Assumptions *(include if any)*

- Users already know how to play the scales being practiced and only need name recognition practice
- The timer and session management components from chord practice can be reused with minimal modification
- Users understand music theory basics (what a scale is, difference between Major and Minor, etc.)
- Scale practice sessions are independent of chord practice sessions (separate histories)
- Users want to practice scale recognition, not scale construction or theory

## Dependencies *(include if any)*

- Existing chord flashcard feature (001-chord-flashcards) provides the foundation for timer, session management, and UI patterns
- Shared database schema must accommodate both chord and scale practice data
- Navigation/routing must support switching between chord and scale practice modes

## Constraints *(include if any)*

- Must maintain consistency with existing chord flashcard UX (timer behavior, session flow, settings patterns)
- Must work offline like the existing chord practice feature
- Must fit within the same performance budget (sub-2s load, smooth timer updates)
- Scale type list should be extensible for future additions without major refactoring
