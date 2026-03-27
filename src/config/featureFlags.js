const flags = {
  rfq:    import.meta.env.VITE_ENABLE_RFQ === 'true',
  chat:   import.meta.env.VITE_ENABLE_CHAT === 'true',
  wallet: import.meta.env.VITE_ENABLE_WALLET === 'true',
};

export const useFeatureFlag = (flagName) => {
  return flags[flagName] ?? false;
};

export default flags;
