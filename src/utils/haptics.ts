// iOS Haptics utility with graceful web fallback

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' = 'light') => {
  if (typeof window === 'undefined' || !('navigator' in window)) return;
  
  try {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
        case 'selection':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(35);
          break;
        case 'success':
          navigator.vibrate([15, 40, 20]);
          break;
      }
    }
  } catch {
    // Ignore haptic errors on unsupported hardware
  }
};
