import { describe, it, expect } from 'vitest';
import type {
  ChordType, ChordRoot, ChordQuality, Chord, Preferences,
  PracticeSession, SessionChord, SessionState, SessionSummary,
  PracticeStats, SessionDetails,
  ScaleType, ScaleRoot, Scale, ScalePreferences,
  ScalePracticeSession, ScaleSessionRecord, ScaleSessionState,
  ScaleSessionSummary, ScalePracticeStats, ScaleSessionDetails,
} from '@/lib/types';

// Helpers for compile-time type assertions
type AssertAssignable<T, U extends T> = U;
type AssertEqual<T, U extends T> = T extends U ? true : never;

describe('lib/types', () => {
  describe('Chord types', () => {
    it('should accept valid ChordType values', () => {
      const types: ChordType[] = [
        'Major', 'Minor', 'Dominant', 'Diminished', 'Augmented', 'Suspended', 'Extended',
      ];
      expect(types).toHaveLength(7);
    });

    it('should accept valid ChordRoot values', () => {
      const roots: ChordRoot[] = [
        'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E',
        'F', 'F#', 'Gb', 'G', 'G#', 'Ab',
        'A', 'A#', 'Bb', 'B',
      ];
      expect(roots).toHaveLength(17);
    });

    it('should accept valid ChordQuality values', () => {
      const qualities: ChordQuality[] = [
        'maj', 'min', 'm',
        'maj7', 'm7', '7', 'm7b5', 'dim', 'dim7', 'aug',
        'sus2', 'sus4', '7sus4',
        'maj9', 'm9', '9', 'maj11', 'm11', '11', 'maj13', 'm13', '13',
        '7#9', '7b9', '7#5', '7b5', 'alt', 'maj7#5',
      ];
      expect(qualities).toHaveLength(28);
    });

    it('should accept a valid Chord object', () => {
      const chord: Chord = {
        root: 'C',
        quality: 'maj7',
        type: 'Major',
        displayName: 'Cmaj7',
      };
      expect(chord.root).toBe('C');
      expect(chord.quality).toBe('maj7');
      expect(chord.type).toBe('Major');
      expect(chord.displayName).toBe('Cmaj7');
    });

    it('should reject invalid ChordType at compile time', () => {
      // @ts-expect-error - 'PowerChord' is not a valid ChordType
      const invalid: ChordType = 'PowerChord';
      expect(invalid).toBeDefined();
    });

    it('should reject invalid ChordRoot at compile time', () => {
      // @ts-expect-error - 'H' is not a valid ChordRoot
      const invalid: ChordRoot = 'H';
      expect(invalid).toBeDefined();
    });

    it('should reject invalid ChordQuality at compile time', () => {
      // @ts-expect-error - 'power5' is not a valid ChordQuality
      const invalid: ChordQuality = 'power5';
      expect(invalid).toBeDefined();
    });

    it('should reject Chord missing required properties', () => {
      // @ts-expect-error - missing quality and type
      const incomplete: Chord = { root: 'C', displayName: 'C' };
      expect(incomplete).toBeDefined();
    });
  });

  describe('Preferences', () => {
    it('should accept a valid Preferences object', () => {
      const prefs: Preferences = {
        id: 1,
        timeLimit: 10,
        enabledChordTypes: ['Major', 'Minor'],
      };
      expect(prefs.id).toBe(1);
      expect(prefs.timeLimit).toBe(10);
      expect(prefs.enabledChordTypes).toEqual(['Major', 'Minor']);
    });

    it('should enforce singleton id of 1', () => {
      // @ts-expect-error - id must be literal 1
      const invalid: Preferences = { id: 2, timeLimit: 10, enabledChordTypes: [] };
      expect(invalid).toBeDefined();
    });
  });

  describe('PracticeSession', () => {
    it('should accept a valid active session', () => {
      const session: PracticeSession = {
        id: 1,
        startedAt: '2025-01-01T00:00:00Z',
        endedAt: null,
        chordCount: 0,
        timeLimit: 10,
      };
      expect(session.endedAt).toBeNull();
    });

    it('should accept a valid completed session', () => {
      const session: PracticeSession = {
        id: 1,
        startedAt: '2025-01-01T00:00:00Z',
        endedAt: '2025-01-01T00:05:00Z',
        chordCount: 25,
        timeLimit: 10,
      };
      expect(session.endedAt).toBe('2025-01-01T00:05:00Z');
    });
  });

  describe('SessionChord', () => {
    it('should accept a valid SessionChord', () => {
      const sc: SessionChord = {
        id: 1,
        sessionId: 1,
        chordName: 'Cmaj7',
        displayedAt: '2025-01-01T00:00:01Z',
      };
      expect(sc.chordName).toBe('Cmaj7');
    });
  });

  describe('SessionState', () => {
    it('should accept an inactive initial state', () => {
      const state: SessionState = {
        sessionId: null,
        currentChord: null,
        chordsCompleted: 0,
        isActive: false,
        timeLimit: 10,
        availableChords: [],
      };
      expect(state.isActive).toBe(false);
      expect(state.sessionId).toBeNull();
      expect(state.currentChord).toBeNull();
    });

    it('should accept an active state with a current chord', () => {
      const chord: Chord = { root: 'F#', quality: 'm7b5', type: 'Diminished', displayName: 'F#m7b5' };
      const state: SessionState = {
        sessionId: 42,
        currentChord: chord,
        chordsCompleted: 5,
        isActive: true,
        timeLimit: 10,
        availableChords: [chord],
      };
      expect(state.isActive).toBe(true);
      expect(state.currentChord?.displayName).toBe('F#m7b5');
    });
  });

  describe('SessionSummary', () => {
    it('should accept a valid SessionSummary', () => {
      const summary: SessionSummary = {
        sessionId: 1,
        chordsCompleted: 30,
        durationMinutes: 5.5,
        startedAt: '2025-01-01T00:00:00Z',
        endedAt: '2025-01-01T00:05:30Z',
      };
      expect(summary.durationMinutes).toBe(5.5);
    });
  });

  describe('PracticeStats', () => {
    it('should accept a valid PracticeStats', () => {
      const stats: PracticeStats = {
        totalSessions: 10,
        totalChords: 300,
        totalMinutes: 50,
      };
      expect(stats.totalSessions).toBe(10);
    });
  });

  describe('SessionDetails', () => {
    it('should extend PracticeSession with chords array', () => {
      const details: SessionDetails = {
        id: 1,
        startedAt: '2025-01-01T00:00:00Z',
        endedAt: '2025-01-01T00:05:00Z',
        chordCount: 2,
        timeLimit: 10,
        chords: [
          { id: 1, sessionId: 1, chordName: 'Cmaj7', displayedAt: '2025-01-01T00:00:01Z' },
          { id: 2, sessionId: 1, chordName: 'Dm7', displayedAt: '2025-01-01T00:00:11Z' },
        ],
      };
      expect(details.chords).toHaveLength(2);
      // Verify it has PracticeSession properties
      expect(details.id).toBe(1);
      expect(details.startedAt).toBeDefined();
    });

    it('should be assignable to PracticeSession', () => {
      const details: SessionDetails = {
        id: 1, startedAt: '', endedAt: null, chordCount: 0, timeLimit: 10, chords: [],
      };
      const session: PracticeSession = details;
      expect(session.id).toBe(1);
    });
  });

  describe('Scale types', () => {
    it('should accept valid ScaleType values', () => {
      const types: ScaleType[] = [
        'Major', 'Natural Minor', 'Harmonic Minor', 'Melodic Minor',
        'Dorian', 'Mixolydian', 'Altered', 'Lydian', 'Phrygian', 'Locrian',
      ];
      expect(types).toHaveLength(10);
    });

    it('should accept valid ScaleRoot values', () => {
      const roots: ScaleRoot[] = [
        'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E',
        'F', 'F#', 'Gb', 'G', 'G#', 'Ab',
        'A', 'A#', 'Bb', 'B',
      ];
      expect(roots).toHaveLength(17);
    });

    it('should accept a valid Scale object', () => {
      const scale: Scale = {
        root: 'C',
        type: 'Major',
        displayName: 'C Major',
      };
      expect(scale.root).toBe('C');
      expect(scale.type).toBe('Major');
      expect(scale.displayName).toBe('C Major');
    });

    it('should reject invalid ScaleType at compile time', () => {
      // @ts-expect-error - 'Blues' is not a valid ScaleType
      const invalid: ScaleType = 'Blues';
      expect(invalid).toBeDefined();
    });

    it('should reject Scale missing required properties', () => {
      // @ts-expect-error - missing type
      const incomplete: Scale = { root: 'C', displayName: 'C' };
      expect(incomplete).toBeDefined();
    });

    it('should share the same root notes between ChordRoot and ScaleRoot', () => {
      // Both types accept the same set of chromatic notes
      const root: ChordRoot = 'F#';
      const scaleRoot: ScaleRoot = root;
      expect(scaleRoot).toBe('F#');
    });
  });

  describe('ScalePreferences', () => {
    it('should accept a valid ScalePreferences object', () => {
      const prefs: ScalePreferences = {
        id: 1,
        timeLimit: 15,
        enabledScaleTypes: ['Major', 'Dorian', 'Mixolydian'],
      };
      expect(prefs.id).toBe(1);
      expect(prefs.enabledScaleTypes).toHaveLength(3);
    });

    it('should enforce singleton id of 1', () => {
      // @ts-expect-error - id must be literal 1
      const invalid: ScalePreferences = { id: 2, timeLimit: 10, enabledScaleTypes: [] };
      expect(invalid).toBeDefined();
    });
  });

  describe('ScalePracticeSession', () => {
    it('should accept valid active and completed sessions', () => {
      const active: ScalePracticeSession = {
        id: 1, startedAt: '2025-01-01T00:00:00Z', endedAt: null, scaleCount: 0, timeLimit: 10,
      };
      const done: ScalePracticeSession = {
        id: 2, startedAt: '2025-01-01T00:00:00Z', endedAt: '2025-01-01T00:05:00Z', scaleCount: 20, timeLimit: 10,
      };
      expect(active.endedAt).toBeNull();
      expect(done.endedAt).toBeDefined();
    });
  });

  describe('ScaleSessionState', () => {
    it('should accept an inactive initial state', () => {
      const state: ScaleSessionState = {
        sessionId: null,
        currentScale: null,
        scalesCompleted: 0,
        isActive: false,
        timeLimit: 10,
        availableScales: [],
      };
      expect(state.isActive).toBe(false);
    });

    it('should accept an active state with a current scale', () => {
      const scale: Scale = { root: 'Bb', type: 'Dorian', displayName: 'Bb Dorian' };
      const state: ScaleSessionState = {
        sessionId: 7,
        currentScale: scale,
        scalesCompleted: 3,
        isActive: true,
        timeLimit: 15,
        availableScales: [scale],
      };
      expect(state.currentScale?.displayName).toBe('Bb Dorian');
    });
  });

  describe('ScaleSessionSummary', () => {
    it('should accept a valid ScaleSessionSummary', () => {
      const summary: ScaleSessionSummary = {
        sessionId: 1,
        scalesCompleted: 15,
        durationMinutes: 3.2,
        startedAt: '2025-01-01T00:00:00Z',
        endedAt: '2025-01-01T00:03:12Z',
      };
      expect(summary.scalesCompleted).toBe(15);
    });
  });

  describe('ScalePracticeStats', () => {
    it('should accept a valid ScalePracticeStats', () => {
      const stats: ScalePracticeStats = {
        totalSessions: 5,
        totalScales: 100,
        totalMinutes: 30,
      };
      expect(stats.totalSessions).toBe(5);
    });
  });

  describe('ScaleSessionDetails', () => {
    it('should extend ScalePracticeSession with scales array', () => {
      const details: ScaleSessionDetails = {
        id: 1,
        startedAt: '2025-01-01T00:00:00Z',
        endedAt: '2025-01-01T00:05:00Z',
        scaleCount: 1,
        timeLimit: 10,
        scales: [
          { id: 1, sessionId: 1, scaleName: 'C Major', displayedAt: '2025-01-01T00:00:01Z' },
        ],
      };
      expect(details.scales).toHaveLength(1);
      expect(details.id).toBe(1);
    });

    it('should be assignable to ScalePracticeSession', () => {
      const details: ScaleSessionDetails = {
        id: 1, startedAt: '', endedAt: null, scaleCount: 0, timeLimit: 10, scales: [],
      };
      const session: ScalePracticeSession = details;
      expect(session.id).toBe(1);
    });
  });
});
