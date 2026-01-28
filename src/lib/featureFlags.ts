import { useState, useEffect } from 'react';

/**
 * Available feature flags in the application
 */
export type FeatureFlag =
    | 'live-scores-api'
    | 'ai-predictions'
    | 'premium-features'
    | 'beta-ui'
    | 'social-sharing'
    | 'push-notifications';

/**
 * Get enabled features from environment variables
 * Format: VITE_ENABLED_FEATURES=live-scores-api,beta-ui,premium-features
 */
function getEnabledFeaturesFromEnv(): Set<FeatureFlag> {
    const enabledFeatures = import.meta.env.VITE_ENABLED_FEATURES || '';
    const features = enabledFeatures
        .split(',')
        .map((f: string) => f.trim())
        .filter(Boolean);

    return new Set(features as FeatureFlag[]);
}

/**
 * Get feature overrides from localStorage (development only)
 * Allows toggling features in development without changing .env
 */
function getLocalStorageOverrides(): Record<string, boolean> {
    if (import.meta.env.PROD) return {};

    try {
        const overrides = localStorage.getItem('featureFlagOverrides');
        return overrides ? JSON.parse(overrides) : {};
    } catch {
        return {};
    }
}

/**
 * Set feature override in localStorage (development only)
 */
export function setFeatureFlagOverride(flag: FeatureFlag, enabled: boolean): void {
    if (import.meta.env.PROD) {
        console.warn('Feature flag overrides are not available in production');
        return;
    }

    const overrides = getLocalStorageOverrides();
    overrides[flag] = enabled;
    localStorage.setItem('featureFlagOverrides', JSON.stringify(overrides));

    // Trigger a storage event to notify other components
    window.dispatchEvent(new Event('storage'));
}

/**
 * Clear all feature flag overrides (development only)
 */
export function clearFeatureFlagOverrides(): void {
    if (import.meta.env.PROD) return;
    localStorage.removeItem('featureFlagOverrides');
    window.dispatchEvent(new Event('storage'));
}

/**
 * Check if a feature flag is enabled
 * Priority: localStorage override (dev) > environment variable
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
    // Check localStorage override first (development only)
    const overrides = getLocalStorageOverrides();
    if (flag in overrides) {
        return overrides[flag];
    }

    // Check environment variables
    const enabledFeatures = getEnabledFeaturesFromEnv();
    return enabledFeatures.has(flag);
}

/**
 * React hook to check if a feature flag is enabled
 * Automatically updates when localStorage changes (development only)
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
    const [enabled, setEnabled] = useState(() => isFeatureEnabled(flag));

    useEffect(() => {
        // Only listen for storage events in development
        if (import.meta.env.PROD) return;

        const handleStorageChange = () => {
            setEnabled(isFeatureEnabled(flag));
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [flag]);

    return enabled;
}

/**
 * Get all enabled features
 */
export function getAllEnabledFeatures(): FeatureFlag[] {
    const envFeatures = Array.from(getEnabledFeaturesFromEnv());
    const overrides = getLocalStorageOverrides();

    // Merge environment and localStorage overrides
    const allFeatures = new Set(envFeatures);

    Object.entries(overrides).forEach(([flag, enabled]) => {
        if (enabled) {
            allFeatures.add(flag as FeatureFlag);
        } else {
            allFeatures.delete(flag as FeatureFlag);
        }
    });

    return Array.from(allFeatures);
}

/**
 * Log all feature flags (useful for debugging)
 */
export function debugFeatureFlags(): void {
    console.group('🚩 Feature Flags');
    console.log('Environment:', import.meta.env.VITE_ENVIRONMENT || 'development');
    console.log('Enabled features:', getAllEnabledFeatures());

    if (!import.meta.env.PROD) {
        console.log('localStorage overrides:', getLocalStorageOverrides());
    }

    console.groupEnd();
}

// Auto-log feature flags in development
if (!import.meta.env.PROD) {
    debugFeatureFlags();
}
