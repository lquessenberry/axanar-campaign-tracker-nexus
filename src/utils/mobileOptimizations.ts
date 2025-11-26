/**
 * Mobile optimization utilities for better performance and UX
 */

/**
 * Check if the device is mobile
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Check if device is a handheld gaming device (Steam Deck, ROG Ally, Legion Go, etc.)
 */
export const isHandheldGamingDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes('steamdeck') ||
    ua.includes('steamos') ||
    ua.includes('gamepad') ||
    ua.includes('valve') ||
    (window.matchMedia('(pointer: coarse)').matches && 
     window.innerWidth >= 800 && 
     window.innerWidth <= 1920)
  );
};

/**
 * Detect if gamepad/controller is connected
 */
export const isGamepadConnected = (): boolean => {
  if (typeof window === 'undefined' || !navigator.getGamepads) return false;
  const gamepads = navigator.getGamepads();
  return Array.from(gamepads).some(gp => gp !== null);
};

/**
 * Check if touch is supported
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Prevent pull-to-refresh on specific elements (for custom implementations)
 */
export const preventDefaultPullToRefresh = (element: HTMLElement) => {
  let startY = 0;
  
  element.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
  }, { passive: true });
  
  element.addEventListener('touchmove', (e) => {
    const y = e.touches[0].pageY;
    // Check if we're at the top and pulling down
    if (window.scrollY === 0 && y > startY) {
      e.preventDefault();
    }
  }, { passive: false });
};

/**
 * Optimize image loading for mobile
 */
export const optimizeImageForMobile = (src: string, width?: number): string => {
  // If already using a CDN with resize parameters, return as-is
  if (src.includes('?') || !width) return src;
  
  // For Supabase storage URLs, add resize parameters
  if (src.includes('supabase')) {
    return `${src}?width=${width}&quality=85`;
  }
  
  return src;
};

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll/resize events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Add haptic feedback (vibration) for touch interactions
 */
export const triggerHapticFeedback = (pattern: number | number[] = 10) => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

/**
 * Check if reduced motion is preferred
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
