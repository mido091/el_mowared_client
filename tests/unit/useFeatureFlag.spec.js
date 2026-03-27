import { describe, it, expect } from 'vitest';
import { useFeatureFlag } from '@/composables/useFeatureFlag';

// NOTE: featureFlags are driven by VITE_* env vars (see .env).
// In the test environment (vitest with jsdom), import.meta.env returns the
// actual .env values. Our dev .env has all flags enabled (true).
// These tests verify the composable's logic, not the flag values themselves.

describe('useFeatureFlag composable', () => {

  it('exposes isEnabled() function', () => {
    const { isEnabled } = useFeatureFlag();
    expect(typeof isEnabled).toBe('function');
  });

  it('returns false for unknown feature keys', () => {
    const { isEnabled } = useFeatureFlag();
    expect(isEnabled('totally_unknown_feature_xyz')).toBe(false);
  });

  it('exposes rfqEnabled, chatEnabled, walletEnabled as computed refs', () => {
    const { rfqEnabled, chatEnabled, walletEnabled } = useFeatureFlag();
    // Verify they are ref-like objects with a .value property
    expect(rfqEnabled).toHaveProperty('value');
    expect(chatEnabled).toHaveProperty('value');
    expect(walletEnabled).toHaveProperty('value');
    // All are booleans
    expect(typeof rfqEnabled.value).toBe('boolean');
    expect(typeof chatEnabled.value).toBe('boolean');
    expect(typeof walletEnabled.value).toBe('boolean');
  });

  it('reads rfq flag and returns a boolean', () => {
    const { isEnabled } = useFeatureFlag();
    const result = isEnabled('rfq');
    expect(typeof result).toBe('boolean');
  });

  it('env var override takes priority over config (string "true" → boolean true)', () => {
    // Since VITE_ENABLE_RFQ="true" in .env, and the composable checks env first,
    // isEnabled('rfq') must be true in the test environment
    const { isEnabled } = useFeatureFlag();
    expect(isEnabled('rfq')).toBe(true);
  });
});
