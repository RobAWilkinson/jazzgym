import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startSession, advanceToNextChord, endSession } from '@/lib/session-manager';
import type { SessionState, ChordType } from '@/lib/types';

// Mock the database functions
vi.mock('@/lib/db', () => ({
  createPracticeSession: vi.fn(async (timeLimit: number) => 1),
  addChordToSession: vi.fn(async (sessionId: number, chordName: string) => {}),
  endPracticeSession: vi.fn(async (sessionId: number) => {}),
}));

describe('Session Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startSession', () => {
    it('should create a new session with initial state', async () => {
      const timeLimit = 10;
      const enabledChordTypes: ChordType[] = ['Major', 'Minor'];

      const session = await startSession(timeLimit, enabledChordTypes);

      expect(session.sessionId).toBe(1);
      expect(session.isActive).toBe(true);
      expect(session.chordsCompleted).toBe(0);
      expect(session.timeLimit).toBe(timeLimit);
      expect(session.currentChord).toBeDefined();
      expect(['Major', 'Minor']).toContain(session.currentChord?.type);
      expect(session.availableChords.length).toBeGreaterThan(0);
    });

    it('should filter chords by enabled types', async () => {
      const session = await startSession(10, ['Major']);

      expect(session.currentChord?.type).toBe('Major');
      session.availableChords.forEach(chord => {
        expect(chord.type).toBe('Major');
      });
    });

    it('should throw error if no chord types enabled', async () => {
      await expect(startSession(10, [])).rejects.toThrow();
    });

    it('should validate time limits', async () => {
      const session = await startSession(15, ['Major']);

      expect(session.timeLimit).toBe(15);
    });
  });

  describe('advanceToNextChord', () => {
    it('should increment chordsCompleted count', async () => {
      const initialState = await startSession(10, ['Major', 'Minor']);

      const nextState = await advanceToNextChord(initialState);

      expect(nextState.chordsCompleted).toBe(1);
      expect(nextState.isActive).toBe(true);
      expect(nextState.sessionId).toBe(initialState.sessionId);
    });

    it('should select a new chord', async () => {
      const initialState = await startSession(10, ['Major', 'Minor', 'Dominant']);

      const nextState = await advanceToNextChord(initialState);

      expect(nextState.currentChord).toBeDefined();
      expect(['Major', 'Minor', 'Dominant']).toContain(nextState.currentChord?.type);
    });

    it('should maintain session state properties', async () => {
      const initialState = await startSession(10, ['Major']);

      const nextState = await advanceToNextChord(initialState);

      expect(nextState.sessionId).toBe(initialState.sessionId);
      expect(nextState.timeLimit).toBe(initialState.timeLimit);
      expect(nextState.isActive).toBe(initialState.isActive);
      expect(nextState.availableChords).toEqual(initialState.availableChords);
    });

    it('should throw error if no active session', async () => {
      const invalidState: SessionState = {
        sessionId: null,
        currentChord: null,
        chordsCompleted: 0,
        isActive: false,
        timeLimit: 10,
        availableChords: [],
      };

      await expect(advanceToNextChord(invalidState)).rejects.toThrow('No active session');
    });

    it('should handle multiple advances', async () => {
      let state = await startSession(10, ['Major', 'Minor']);

      for (let i = 0; i < 10; i++) {
        state = await advanceToNextChord(state);
        expect(state.chordsCompleted).toBe(i + 1);
        expect(state.currentChord).toBeDefined();
      }
    });
  });

  describe('endSession', () => {
    it('should return session summary', async () => {
      const session = await startSession(10, ['Major']);
      const advancedSession = await advanceToNextChord(session);

      const summary = await endSession(advancedSession);

      expect(summary.sessionId).toBe(advancedSession.sessionId);
      expect(summary.chordsCompleted).toBeGreaterThan(0);
      expect(summary.durationMinutes).toBeGreaterThan(0);
      expect(summary.startedAt).toBeDefined();
      expect(summary.endedAt).toBeDefined();
    });

    it('should calculate correct chord count including current chord', async () => {
      const session = await startSession(10, ['Major']);
      let state = session;

      // Advance 5 times (chordsCompleted = 5)
      for (let i = 0; i < 5; i++) {
        state = await advanceToNextChord(state);
      }

      const summary = await endSession(state);

      // Should include the 5 completed + 1 current = 6 total
      expect(summary.chordsCompleted).toBe(6);
    });

    it('should calculate duration based on chords and time limit', async () => {
      const session = await startSession(10, ['Major']); // 10 seconds per chord
      let state = session;

      // Advance 5 times
      for (let i = 0; i < 5; i++) {
        state = await advanceToNextChord(state);
      }

      const summary = await endSession(state);

      // 6 chords × 10 seconds = 60 seconds = 1 minute
      expect(summary.durationMinutes).toBe(1);
    });

    it('should throw error if no active session', async () => {
      const invalidState: SessionState = {
        sessionId: null,
        currentChord: null,
        chordsCompleted: 0,
        isActive: false,
        timeLimit: 10,
        availableChords: [],
      };

      await expect(endSession(invalidState)).rejects.toThrow('No active session');
    });

    it('should handle session with no advances (only initial chord)', async () => {
      const session = await startSession(10, ['Major']);

      const summary = await endSession(session);

      expect(summary.chordsCompleted).toBe(1); // Just the initial chord
    });

    it('should round duration minutes to 1 decimal place', async () => {
      const session = await startSession(7, ['Major']); // 7 seconds per chord
      let state = session;

      // Advance 2 times (3 total chords)
      for (let i = 0; i < 2; i++) {
        state = await advanceToNextChord(state);
      }

      const summary = await endSession(state);

      // 3 chords × 7 seconds = 21 seconds = 0.35 minutes = 0.4 (rounded)
      expect(summary.durationMinutes).toBe(0.4);
    });
  });

  describe('Edge Cases', () => {
    it('should handle 100+ chord sessions (SC-005)', async () => {
      let state = await startSession(1, ['Major', 'Minor', 'Dominant']);

      for (let i = 0; i < 100; i++) {
        state = await advanceToNextChord(state);
      }

      expect(state.chordsCompleted).toBe(100);

      const summary = await endSession(state);
      expect(summary.chordsCompleted).toBe(101); // 100 advanced + 1 current
    });

    it('should handle very short time limits (3 seconds)', async () => {
      const session = await startSession(3, ['Major']);

      expect(session.timeLimit).toBe(3);
      expect(session.currentChord).toBeDefined();
    });

    it('should handle very long time limits (60 seconds)', async () => {
      const session = await startSession(60, ['Major']);

      expect(session.timeLimit).toBe(60);
      expect(session.currentChord).toBeDefined();
    });
  });
});
