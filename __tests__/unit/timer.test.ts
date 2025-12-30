import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTimer } from '@/hooks/use-timer';

describe('useTimer Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with correct time', () => {
    const { result } = renderHook(() => useTimer(10, vi.fn()));

    expect(result.current.timeLeft).toBe(10);
    expect(result.current.isRunning).toBe(true); // Auto-starts
  });

  it('should start countdown automatically', () => {
    const { result } = renderHook(() => useTimer(10, vi.fn()));

    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1500); // Wait longer for timer to update
    });

    expect(result.current.timeLeft).toBeLessThan(10);
  });

  it('should call onComplete when timer reaches zero', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTimer(1, onComplete));

    act(() => {
      vi.advanceTimersByTime(1100); // Slightly over 1 second
    });

    expect(onComplete).toHaveBeenCalled();
    expect(result.current.timeLeft).toBe(0);
  });

  it('should pause timer when paused', () => {
    const { result } = renderHook(() => useTimer(10, vi.fn()));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const timeAfterHalfSecond = result.current.timeLeft;

    act(() => {
      result.current.pause();
    });

    expect(result.current.isRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Time should not have changed after pausing
    expect(result.current.timeLeft).toBe(timeAfterHalfSecond);
  });

  it('should resume timer after pause', () => {
    const { result } = renderHook(() => useTimer(10, vi.fn()));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.pause();
    });

    const timeAfterPause = result.current.timeLeft;

    act(() => {
      result.current.resume();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.timeLeft).toBeLessThan(timeAfterPause);
  });

  it('should reset timer to initial value', () => {
    const { result } = renderHook(() => useTimer(10, vi.fn()));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.timeLeft).toBeLessThan(10);

    act(() => {
      result.current.reset();
    });

    expect(result.current.timeLeft).toBe(10);
    expect(result.current.isRunning).toBe(true); // Auto-restarts after reset
  });

  it('should not go below zero', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTimer(1, onComplete));

    act(() => {
      vi.advanceTimersByTime(5000); // Way past the timer
    });

    expect(result.current.timeLeft).toBe(0);
    expect(onComplete).toHaveBeenCalled();
  });

  it('should handle countdown with 100ms precision', () => {
    const { result} = renderHook(() => useTimer(10, vi.fn()));

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should have decreased (rounded up from 9.9 to 10)
    expect(result.current.timeLeft).toBeGreaterThanOrEqual(9);
    expect(result.current.timeLeft).toBeLessThanOrEqual(10);
  });
});
