import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startSession, advanceToNextScale, endSession } from '@/lib/scale-session-manager';
import type { ScaleSessionState, ScaleType } from '@/lib/types';

// Mock the database functions
vi.mock('@/lib/db', () => ({
  createScalePracticeSession: vi.fn(async (timeLimit: number) => 1),
  addScaleToSession: vi.fn(async (sessionId: number, scaleName: string) => {}),
  endScalePracticeSession: vi.fn(async (sessionId: number) => {}),
}));

describe('Scale Session Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startSession', () => {
    it('should create a new session with initial state', async () => {
      const timeLimit = 10;
      const enabledScaleTypes: ScaleType[] = ['Major', 'Natural Minor'];

      const session = await startSession(timeLimit, enabledScaleTypes);

      expect(session.sessionId).toBe(1);
      expect(session.isActive).toBe(true);
      expect(session.scalesCompleted).toBe(0);
      expect(session.timeLimit).toBe(timeLimit);
      expect(session.currentScale).toBeDefined();
      expect(['Major', 'Natural Minor']).toContain(session.currentScale?.type);
      expect(session.availableScales.length).toBeGreaterThan(0);
    });

    it('should filter scales by enabled types', async () => {
      const session = await startSession(10, ['Major']);

      expect(session.currentScale?.type).toBe('Major');
      session.availableScales.forEach(scale => {
        expect(scale.type).toBe('Major');
      });
    });

    it('should throw error if no scale types enabled', async () => {
      await expect(startSession(10, [])).rejects.toThrow();
    });

    it('should validate time limits', async () => {
      const session = await startSession(15, ['Major']);

      expect(session.timeLimit).toBe(15);
    });

    it('should have 17 available scales for single type', async () => {
      const session = await startSession(10, ['Dorian']);

      expect(session.availableScales.length).toBe(17); // 17 chromatic roots
    });

    it('should have 34 available scales for two types', async () => {
      const session = await startSession(10, ['Major', 'Mixolydian']);

      expect(session.availableScales.length).toBe(34); // 17 × 2
    });
  });

  describe('advanceToNextScale', () => {
    it('should increment scalesCompleted count', async () => {
      const initialState = await startSession(10, ['Major', 'Natural Minor']);

      const nextState = await advanceToNextScale(initialState);

      expect(nextState.scalesCompleted).toBe(1);
      expect(nextState.isActive).toBe(true);
      expect(nextState.sessionId).toBe(initialState.sessionId);
    });

    it('should select a new scale', async () => {
      const initialState = await startSession(10, ['Major', 'Natural Minor', 'Dorian']);

      const nextState = await advanceToNextScale(initialState);

      expect(nextState.currentScale).toBeDefined();
      expect(['Major', 'Natural Minor', 'Dorian']).toContain(nextState.currentScale?.type);
    });

    it('should prevent consecutive duplicate scales', async () => {
      const initialState = await startSession(10, ['Major', 'Natural Minor']);
      const firstScale = initialState.currentScale;

      const nextState = await advanceToNextScale(initialState);

      // With 34 scales available, next scale should be different
      expect(nextState.currentScale?.displayName).not.toBe(firstScale?.displayName);
    });

    it('should maintain session state properties', async () => {
      const initialState = await startSession(10, ['Major']);

      const nextState = await advanceToNextScale(initialState);

      expect(nextState.sessionId).toBe(initialState.sessionId);
      expect(nextState.timeLimit).toBe(initialState.timeLimit);
      expect(nextState.isActive).toBe(initialState.isActive);
      expect(nextState.availableScales).toEqual(initialState.availableScales);
    });

    it('should throw error if no active session', async () => {
      const invalidState: ScaleSessionState = {
        sessionId: null,
        currentScale: null,
        scalesCompleted: 0,
        isActive: false,
        timeLimit: 10,
        availableScales: [],
      };

      await expect(advanceToNextScale(invalidState)).rejects.toThrow('No active session');
    });

    it('should handle multiple advances', async () => {
      let state = await startSession(10, ['Major', 'Natural Minor']);

      for (let i = 0; i < 10; i++) {
        state = await advanceToNextScale(state);
        expect(state.scalesCompleted).toBe(i + 1);
        expect(state.currentScale).toBeDefined();
      }
    });

    it('should handle single scale type without errors', async () => {
      const state = await startSession(10, ['Altered']);

      // Even with just one type (17 scales), should work fine
      const nextState = await advanceToNextScale(state);
      expect(nextState.currentScale).toBeDefined();
      expect(nextState.currentScale?.type).toBe('Altered');
    });
  });

  describe('endSession', () => {
    it('should return session summary', async () => {
      const session = await startSession(10, ['Major']);
      const advancedSession = await advanceToNextScale(session);

      const summary = await endSession(advancedSession);

      expect(summary.sessionId).toBe(advancedSession.sessionId);
      expect(summary.scalesCompleted).toBeGreaterThan(0);
      expect(summary.durationMinutes).toBeGreaterThan(0);
      expect(summary.startedAt).toBeDefined();
      expect(summary.endedAt).toBeDefined();
    });

    it('should calculate correct scale count including current scale', async () => {
      const session = await startSession(10, ['Major']);
      let state = session;

      // Advance 5 times (scalesCompleted = 5)
      for (let i = 0; i < 5; i++) {
        state = await advanceToNextScale(state);
      }

      const summary = await endSession(state);

      // Should include the 5 completed + 1 current = 6 total
      expect(summary.scalesCompleted).toBe(6);
    });

    it('should calculate duration based on scales and time limit', async () => {
      const session = await startSession(10, ['Major']); // 10 seconds per scale
      let state = session;

      // Advance 5 times
      for (let i = 0; i < 5; i++) {
        state = await advanceToNextScale(state);
      }

      const summary = await endSession(state);

      // 6 scales × 10 seconds = 60 seconds = 1 minute
      expect(summary.durationMinutes).toBe(1);
    });

    it('should throw error if no active session', async () => {
      const invalidState: ScaleSessionState = {
        sessionId: null,
        currentScale: null,
        scalesCompleted: 0,
        isActive: false,
        timeLimit: 10,
        availableScales: [],
      };

      await expect(endSession(invalidState)).rejects.toThrow('No active session');
    });

    it('should handle session with no advances (only initial scale)', async () => {
      const session = await startSession(10, ['Major']);

      const summary = await endSession(session);

      expect(summary.scalesCompleted).toBe(1); // Just the initial scale
    });

    it('should round duration minutes to 1 decimal place', async () => {
      const session = await startSession(7, ['Major']); // 7 seconds per scale
      let state = session;

      // Advance 2 times (3 total scales)
      for (let i = 0; i < 2; i++) {
        state = await advanceToNextScale(state);
      }

      const summary = await endSession(state);

      // 3 scales × 7 seconds = 21 seconds = 0.35 minutes = 0.4 (rounded)
      expect(summary.durationMinutes).toBe(0.4);
    });

    it('should handle very short sessions (3 second time limit)', async () => {
      const session = await startSession(3, ['Major']);

      const summary = await endSession(session);

      expect(summary.scalesCompleted).toBe(1);
      expect(summary.durationMinutes).toBe(0.1); // 3 seconds = 0.05 minutes = 0.1 rounded
    });

    it('should handle very long sessions (60 second time limit)', async () => {
      const session = await startSession(60, ['Major']);

      const summary = await endSession(session);

      expect(summary.scalesCompleted).toBe(1);
      expect(summary.durationMinutes).toBe(1.0); // 60 seconds = 1 minute
    });
  });

  describe('Edge Cases', () => {
    it('should handle 100+ scale sessions', async () => {
      let state = await startSession(1, ['Major', 'Natural Minor', 'Dorian']);

      for (let i = 0; i < 100; i++) {
        state = await advanceToNextScale(state);
      }

      expect(state.scalesCompleted).toBe(100);

      const summary = await endSession(state);
      expect(summary.scalesCompleted).toBe(101); // 100 advanced + 1 current
    });

    it('should handle very short time limits (3 seconds)', async () => {
      const session = await startSession(3, ['Major']);

      expect(session.timeLimit).toBe(3);
      expect(session.currentScale).toBeDefined();
    });

    it('should handle very long time limits (60 seconds)', async () => {
      const session = await startSession(60, ['Major']);

      expect(session.timeLimit).toBe(60);
      expect(session.currentScale).toBeDefined();
    });

    it('should handle all 10 scale types enabled', async () => {
      const allTypes: ScaleType[] = [
        'Major',
        'Natural Minor',
        'Harmonic Minor',
        'Melodic Minor',
        'Dorian',
        'Mixolydian',
        'Altered',
        'Lydian',
        'Phrygian',
        'Locrian'
      ];

      const session = await startSession(10, allTypes);

      expect(session.availableScales.length).toBe(170); // 10 × 17
      expect(session.currentScale).toBeDefined();
      expect(allTypes).toContain(session.currentScale?.type);
    });

    it('should handle session with 7 default types (spec requirement)', async () => {
      const defaultTypes: ScaleType[] = [
        'Major',
        'Natural Minor',
        'Harmonic Minor',
        'Melodic Minor',
        'Dorian',
        'Mixolydian',
        'Altered'
      ];

      const session = await startSession(10, defaultTypes);

      expect(session.availableScales.length).toBe(119); // 7 × 17
      expect(defaultTypes).toContain(session.currentScale?.type);
    });
  });
});
