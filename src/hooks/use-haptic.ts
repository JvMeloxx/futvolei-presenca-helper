import { useCallback } from 'react';

type HapticPattern = number | number[];

/**
 * Hook to provide haptic feedback on supported devices.
 * Uses the navigator.vibrate() API.
 */
export const useHaptic = () => {
    // Predefined patterns
    const patterns = {
        subtle: 50,
        medium: 100,
        heavy: 200,
        success: [50, 50, 50],
        error: [50, 100, 50, 100],
        selection: 20,
    };

    /**
     * Trigger haptic feedback
     * @param pattern Optional vibration pattern. Defaults to 'medium' (100ms)
     */
    const vibrate = useCallback((pattern: HapticPattern = patterns.medium) => {
        // Check if vibration is supported
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                // Fail silently if vibration fails or is not allowed
                console.warn('Haptic feedback failed', e);
            }
        }
    }, []);

    return {
        vibrate,
        patterns
    };
};
