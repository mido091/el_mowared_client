import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

export function useMediaQuery(query) {
  const matches = ref(false);
  let mediaQuery = null;
  let removeListener = null;

  const update = () => {
    matches.value = !!mediaQuery?.matches;
  };

  onMounted(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    mediaQuery = window.matchMedia(query);
    update();

    const listener = () => update();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', listener);
      removeListener = () => mediaQuery?.removeEventListener('change', listener);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(listener);
      removeListener = () => mediaQuery?.removeListener(listener);
    }
  });

  onBeforeUnmount(() => {
    removeListener?.();
    removeListener = null;
    mediaQuery = null;
  });

  watch(
    () => query,
    () => {
      if (mediaQuery) {
        matches.value = mediaQuery.matches;
      }
    }
  );

  return matches;
}
