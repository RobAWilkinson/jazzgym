import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useScalePracticeSession } from '@/hooks/use-scale-practice-session';
import type { ScaleSessionState, ScaleSessionSummary, ScaleType } from '@/lib/types';

// Mock the session manager
vi.mock('@/lib/scale-session-manager', () => ({
  startSession: vi.fn(),
  advanceToNextScale: vi.fn(),
  endSession: vi.fn(),
}));

import { startSession, advanceToNextScale, endSession } from '@/lib/scale-session-manager';

describe('useScalePracticeSession', () => {
  const mockSessionState: ScaleSessionState = {
    sessionId: 1,
    currentScale: {
      root: 'C',
      type: 'Major',
      displayName: 'C Major'
    },
    scalesCompleted: 0,
    isActive: true,
    timeLimit: 10,
    availableScales: [
      { root: 'C', type: 'Major', displayName: 'C Major' },
      { root: 'D', type: 'Major', displayName: 'D Major' },
    ],
  };

  const mockSummary: ScaleSessionSummary = {
    sessionId: 1,
    scalesCompleted: 5,
    durationMinutes: 0.8,
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with no active session', () => {
      const { result } = renderHook(() => useScalePracticeSession());

      expect(result.current.session).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('startPractice', () => {
    it('should start a new practice session', async () => {
      vi.mocked(startSession).mockResolvedValue(mockSessionState);

      const { result } = renderHook(() => useScalePracticeSession());

      await act(async () => {
        await result.current.startPractice(10, ['Major', 'Natural Minor']);
      });

      expect(result.current.session).toEqual(mockSessionState);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(startSession).toHaveBeenCalledWith(10, ['Major', 'Natural Minor']);
    });

    it('should handle start errors', async () => {
      const error = new Error('Failed to start');
      vi.mocked(startSession).mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useScalePracticeSession());

      await act(async () => {
        await result.current.startPractice(10, ['Major']);
      });

      expect(result.current.session).toBe(null);
      expect(result.current.error).toEqual(error);
      expect(result.current.loading).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to start scale session:', error);

      consoleSpy.mockRestore();
    });

    it('should set loading state during start', async () => {
      vi.mocked(startSession).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockSessionState), 100))
      );

      const { result } = renderHook(() => useScalePracticeSession());

      act(() => {
        result.current.startPractice(10, ['Major']);
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.session).toEqual(mockSessionState);
    });

    it('should support all scale types', async () => {
      vi.mocked(startSession).mockResolvedValue(mockSessionState);

      const { result } = renderHook(() => useScalePracticeSession());

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

      await act(async () => {
        await result.current.startPractice(10, allTypes);
      });

      expect(startSession).toHaveBeenCalledWith(10, allTypes);
    });
  });

  describe('advanceScale', () => {
    it('should advance to next scale', async () => {
      const updatedState: ScaleSessionState = {
        ...mockSessionState,
        currentScale: {
          root: 'D',
          type: 'Major',
          displayName: 'D Major'
        },
        scalesCompleted: 1,
      };

      vi.mocked(startSession).mockResolvedValue(mockSessionState);
      vi.mocked(advanceToNextScale).mockResolvedValue(updatedState);

      const { result } = renderHook(() => useScalePracticeSession());

      // Start session first
      await act(async () => {
        await result.current.startPractice(10, ['Major']);
      });

      // Then advance
      await act(async () => {
        await result.current.advanceScale();
      });

      expect(result.current.session).toEqual(updatedState);
      expect(result.current.session?.scalesCompleted).toBe(1);
      expect(result.current.session?.currentScale?.displayName).toBe('D Major');
      expect(advanceToNextScale).toHaveBeenCalledWith(mockSessionState);
    });

    it('should do nothing if no active session', async () => {
      const { result } = renderHook(() => useScalePracticeSession());

      await act(async () => {
        await result.current.advanceScale();
      });

      expect(result.current.session).toBe(null);
      expect(advanceToNextScale).not.toHaveBeenCalled();
    });

    it('should handle advance errors', async () => {
      const error = new Error('Failed to advance');
      vi.mocked(startSession).mockResolvedValue(mockSessionState);
      vi.mocked(advanceToNextScale).mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useScalePracticeSession());

      await act(async () => {
        await result.current.startPractice(10, ['Major']);
      });

      await act(async () => {
        await result.current.advanceScale();
      });

      expect(result.current.error).toEqual(error);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to advance scale:', error);

      consoleSpy.mockRestore();
    });

    it('should handle multiple advances', async () => {
      vi.mocked(startSession).mockResolvedValue(mockSessionState);

      const { result } = renderHook(() => useScalePracticeSession());

      await act(async () => {
        await result.current.startPractice(10, ['Major', 'Natural Minor']);
      });

      for (let i = 1; i <= 5; i++) {
        const nextState: ScaleSessionState = {
          ...mockSessionState,
          scalesCompleted: i,
        };
        vi.mocked(advanceToNextScale).mockResolvedValue(nextState);

        await act(async () => {
          await result.current.advanceScale();
        });

        expect(result.current.session?.scalesCompleted).toBe(i);
      }
    });
  });

  describe('endPractice', () => {
    it('should end practice and return summary', async () => {
      vi.mocked(startSession).mockResolvedValue(mockSessionState);
      vi.mocked(endSession).mockResolvedValue(mockSummary);

      const { result } = renderHook(() => useScalePracticeSession());

      await act(async () => {
        await result.current.startPractice(10, ['Major']);
      });

      let summary: ScaleSessionSummary | null = null;

      await act(async () => {
        summary = await result.current.endPractice();
      });

      expect(summary).toEqual(mockSummary);
      expect(result.current.session).toBe(null);
      expect(endSession).toHaveBeenCalledWith(mockSessionState);
    });

    it('should return null if no active session', async () => {
      const { result } = renderHook(() => useScalePracticeSession());

      let summary: ScaleSessionSummary | null = undefined as any;

      await act(async () => {
        summary = await result.current.endPractice();
      });

      expect(summary).toBe(null);
      expect(endSession).not.toHaveBeenCalled();
    });

    it('should handle end errors', async () => {
      const error = new Error('Failed to end');
      vi.mocked(startSession).mockResolvedValue(mockSessionState);
      vi.mocked(endSession).mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useScalePracticeSession());

      await act(async () => {
        await result.current.startPractice(10, ['Major']);
      });

      let summary: ScaleSessionSummary | null = undefined as any;

      await act(async () => {
        summary = await result.current.endPractice();
      });

      expect(summary).toBe(null);
      expect(result.current.error).toEqual(error);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to end scale session:', error);

      consoleSpy.mockRestore();
    });

    it('should keep session active on error so user can retry', async () => {
      const error = new Error('Failed to end');
      vi.mocked(startSession).mockResolvedValue(mockSessionState);
      vi.mocked(endSession).mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useScalePracticeSession());

      await act(async () => {
        await result.current.startPractice(10, ['Major']);
      });

      expect(result.current.session).not.toBe(null);

      await act(async () => {
        await result.current.endPractice();
      });

      // Session should remain active when ending fails so user can retry
      expect(result.current.session).not.toBe(null);
      expect(result.current.error).toEqual(error);

      consoleSpy.mockRestore();
    });
  });

  describe('Full Session Workflow', () => {
    it('should handle complete session lifecycle', async () => {
      vi.mocked(startSession).mockResolvedValue(mockSessionState);

      const { result } = renderHook(() => useScalePracticeSession());

      // 1. Start
      await act(async () => {
        await result.current.startPractice(10, ['Major', 'Dorian']);
      });
      expect(result.current.session?.sessionId).toBe(1);
      expect(result.current.session?.scalesCompleted).toBe(0);

      // 2. Advance multiple times
      for (let i = 1; i <= 3; i++) {
        const nextState: ScaleSessionState = {
          ...mockSessionState,
          scalesCompleted: i,
        };
        vi.mocked(advanceToNextScale).mockResolvedValue(nextState);

        await act(async () => {
          await result.current.advanceScale();
        });

        expect(result.current.session?.scalesCompleted).toBe(i);
      }

      // 3. End
      vi.mocked(endSession).mockResolvedValue(mockSummary);

      let summary: ScaleSessionSummary | null = null;

      await act(async () => {
        summary = await result.current.endPractice();
      });

      expect(summary).toEqual(mockSummary);
      expect(result.current.session).toBe(null);
    });

    it('should handle restart after session ends', async () => {
      vi.mocked(startSession).mockResolvedValue(mockSessionState);
      vi.mocked(endSession).mockResolvedValue(mockSummary);

      const { result } = renderHook(() => useScalePracticeSession());

      // First session
      await act(async () => {
        await result.current.startPractice(10, ['Major']);
      });

      await act(async () => {
        await result.current.endPractice();
      });

      expect(result.current.session).toBe(null);

      // Second session
      await act(async () => {
        await result.current.startPractice(15, ['Natural Minor']);
      });

      expect(result.current.session).toEqual(mockSessionState);
      expect(startSession).toHaveBeenCalledTimes(2);
      expect(startSession).toHaveBeenLastCalledWith(15, ['Natural Minor']);
    });
  });
});
