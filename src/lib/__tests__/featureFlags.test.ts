import { describe, it, expect } from 'vitest';
import { isFeatureEnabled, getAllEnabledFeatures } from '../featureFlags';

describe('Feature Flags', () => {
    describe('isFeatureEnabled', () => {
        it('returns true for enabled features from environment', () => {
            // Setup in test/setup.ts: VITE_ENABLED_FEATURES=live-scores-api
            expect(isFeatureEnabled('live-scores-api')).toBe(true);
        });

        it('returns false for disabled features', () => {
            expect(isFeatureEnabled('ai-predictions')).toBe(false);
            expect(isFeatureEnabled('premium-features')).toBe(false);
        });
    });

    describe('getAllEnabledFeatures', () => {
        it('returns array of enabled features', () => {
            const features = getAllEnabledFeatures();
            expect(Array.isArray(features)).toBe(true);
            expect(features).toContain('live-scores-api');
        });
    });
});
