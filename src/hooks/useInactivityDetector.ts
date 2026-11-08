import { useEffect, useRef, useCallback } from 'react';

interface UseInactivityDetectorProps {
  enabled: boolean;
  timeoutMinutes: number; // 0 = disabled
  onTimeout: () => void;
}

export function useInactivityDetector({
  enabled,
  timeoutMinutes,
  onTimeout,
}: UseInactivityDetectorProps) {
  const timerRef = useRef<number | null>(null);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!enabled || timeoutMinutes <= 0) {
      return;
    }

    const timeoutMs = timeoutMinutes * 60 * 1000;
    timerRef.current = window.setTimeout(() => {
      onTimeoutRef.current();
    }, timeoutMs);
  }, [enabled, timeoutMinutes]);

  useEffect(() => {
    if (!enabled || timeoutMinutes <= 0) {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Set initial timer
    resetTimer();

    // Event listeners to detect activity
    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'wheel',
    ];

    // Throttle listener to reset timer at most every 2 seconds
    let lastReset = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastReset > 2000) {
        lastReset = now;
        resetTimer();
      }
    };

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });
    };
  }, [enabled, timeoutMinutes, resetTimer]);

  return { resetTimer };
}
