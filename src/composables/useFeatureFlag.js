import { computed } from 'vue';
import featureFlags from '@/config/featureFlags';

export function useFeatureFlag() {
  const isEnabled = (featureId) => {
    // Priority: .env > config file
    const envKey = `VITE_ENABLE_${featureId.toUpperCase()}`;
    if (import.meta.env[envKey] !== undefined) {
      return import.meta.env[envKey] === 'true';
    }
    return !!featureFlags[featureId];
  };

  const rfqEnabled    = computed(() => isEnabled('rfq'));
  const chatEnabled   = computed(() => isEnabled('chat'));
  const walletEnabled = computed(() => isEnabled('wallet'));

  return {
    isEnabled,
    rfqEnabled,
    chatEnabled,
    walletEnabled
  };
}
