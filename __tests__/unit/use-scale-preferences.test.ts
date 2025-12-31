import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useScalePreferences } from '@/hooks/use-scale-preferences';
import type { ScalePreferences, ScaleType } from '@/lib/types';

// Mock the database functions
vi.mock('@/lib/db', () => ({
  loadScalePreferences: vi.fn(),
  updateScalePreferences: vi.fn(),
}));

import { loadScalePreferences, updateScalePreferences } from '@/lib/db';

describe('useScalePreferences', () => {
  const mockPreferences: ScalePreferences = {
    id: 1,
    timeLimit: 10,
    enabledScaleTypes: ['Major', 'Natural Minor', 'Harmonic Minor'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadScalePreferences).mockResolvedValue(mockPreferences);
  });

  describe('Initial Load', () => {
    it('should load preferences on mount', async () => {
      const { result } = renderHook(() => useScalePreferences());

      expect(result.current.loading).toBe(true);
      expect(result.current.preferences).toBe(null);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.preferences).toEqual(mockPreferences);
      expect(result.current.error).toBe(null);
      expect(loadScalePreferences).toHaveBeenCalledTimes(1);
    });

    it('should handle load errors gracefully', async () => {
      const error = new Error('Failed to load');
      vi.mocked(loadScalePreferences).mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useScalePreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.preferences).toBe(null);
      expect(result.current.error).toEqual(error);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load scale preferences:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences optimistically', async () => {
      vi.mocked(updateScalePreferences).mockResolvedValue();

      const { result } = renderHook(() => useScalePreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updates = { timeLimit: 15 };
      let updateResult: boolean = false;

      await act(async () => {
        updateResult = await result.current.updatePreferences(updates);
      });

      expect(updateResult).toBe(true);
      expect(result.current.preferences?.timeLimit).toBe(15);
      expect(updateScalePreferences).toHaveBeenCalledWith(updates);
    });

    it('should rollback optimistic update on error', async () => {
      const error = new Error('Update failed');
      vi.mocked(updateScalePreferences).mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useScalePreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const originalTimeLimit = result.current.preferences?.timeLimit;
      const updates = { timeLimit: 15 };
      let updateResult: boolean = true;

      await act(async () => {
        updateResult = await result.current.updatePreferences(updates);
      });

      expect(updateResult).toBe(false);
      expect(result.current.error).toEqual(error);
      expect(result.current.preferences?.timeLimit).toBe(originalTimeLimit);

      consoleSpy.mockRestore();
    });

    it('should return false if preferences not loaded', async () => {
      vi.mocked(loadScalePreferences).mockResolvedValue(null as any);

      const { result } = renderHook(() => useScalePreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let updateResult: boolean = true;

      await act(async () => {
        updateResult = await result.current.updatePreferences({ timeLimit: 15 });
      });

      expect(updateResult).toBe(false);
    });
  });

  describe('updateTimeLimit', () => {
    it('should update time limit', async () => {
      vi.mocked(updateScalePreferences).mockResolvedValue();

      const { result } = renderHook(() => useScalePreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let updateResult: boolean = false;

      await act(async () => {
        updateResult = await result.current.updateTimeLimit(20);
      });

      expect(updateResult).toBe(true);
      expect(result.current.preferences?.timeLimit).toBe(20);
      expect(updateScalePreferences).toHaveBeenCalledWith({ timeLimit: 20 });
    });

    it('should validate time limit range', async () => {
      vi.mocked(updateScalePreferences).mockResolvedValue();

      const { result } = renderHook(() => useScalePreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Test minimum valid value (3 seconds)
      await act(async () => {
        await result.current.updateTimeLimit(3);
      });
      expect(result.current.preferences?.timeLimit).toBe(3);

      // Test maximum valid value (60 seconds)
      await act(async () => {
        await result.current.updateTimeLimit(60);
      });
      expect(result.current.preferences?.timeLimit).toBe(60);
    });
  });

  describe('updateEnabledScaleTypes', () => {
    it('should update enabled scale types', async () => {
      vi.mocked(updateScalePreferences).mockResolvedValue();

      const { result } = renderHook(() => useScalePreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newTypes: ScaleType[] = ['Major', 'Dorian'];
      let updateResult: boolean = false;

      await act(async () => {
        updateResult = await result.current.updateEnabledScaleTypes(newTypes);
      });

      expect(updateResult).toBe(true);
      expect(result.current.preferences?.enabledScaleTypes).toEqual(newTypes);
      expect(updateScalePreferences).toHaveBeenCalledWith({ enabledScaleTypes: newTypes });
    });

    it('should handle single scale type', async () => {
      vi.mocked(updateScalePreferences).mockResolvedValue();

      const { result } = renderHook(() => useScalePreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const singleType: ScaleType[] = ['Altered'];

      await act(async () => {
        await result.current.updateEnabledScaleTypes(singleType);
      });

      expect(result.current.preferences?.enabledScaleTypes).toEqual(singleType);
    });

    it('should handle all scale types', async () => {
      vi.mocked(updateScalePreferences).mockResolvedValue();

      const { result } = renderHook(() => useScalePreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

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
        await result.current.updateEnabledScaleTypes(allTypes);
      });

      expect(result.current.preferences?.enabledScaleTypes).toEqual(allTypes);
      expect(result.current.preferences?.enabledScaleTypes.length).toBe(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle consecutive errors', async () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      vi.mocked(updateScalePreferences)
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useScalePreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // First error
      await act(async () => {
        await result.current.updateTimeLimit(15);
      });
      expect(result.current.error).toEqual(error1);

      // Second error
      await act(async () => {
        await result.current.updateTimeLimit(20);
      });
      expect(result.current.error).toEqual(error2);

      consoleSpy.mockRestore();
    });
  });
});
