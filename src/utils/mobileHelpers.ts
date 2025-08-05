/**
 * Mobile utility functions for enhanced user experience
 */

/**
 * Checks if the current device is mobile based on screen width
 */
export const isMobile = (): boolean => {
  return window.innerWidth < 768;
};

/**
 * Checks if the current device is tablet based on screen width
 */
export const isTablet = (): boolean => {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

/**
 * Checks if the current device supports touch
 */
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Gets the safe area insets for mobile devices (iOS notch, etc.)
 */
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    top: style.getPropertyValue('--safe-area-inset-top') || '0px',
    right: style.getPropertyValue('--safe-area-inset-right') || '0px',
    bottom: style.getPropertyValue('--safe-area-inset-bottom') || '0px',
    left: style.getPropertyValue('--safe-area-inset-left') || '0px',
  };
};

/**
 * Prevents body scroll on mobile when modals are open
 */
export const preventBodyScroll = (prevent: boolean) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = prevent ? 'hidden' : '';
    document.body.style.height = prevent ? '100vh' : '';
  }
};

/**
 * Optimizes images for mobile devices
 */
export const getMobileOptimizedImageSrc = (src: string, width?: number): string => {
  if (!src) return src;
  
  // For mobile, we might want to serve smaller images
  const mobileWidth = width || (isMobile() ? 400 : 800);
  
  // If using a CDN that supports dynamic resizing, append width parameter
  if (src.includes('supabase.co') || src.includes('cloudinary.com')) {
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}width=${mobileWidth}&quality=auto&format=auto`;
  }
  
  return src;
};

/**
 * Handles mobile-specific touch interactions
 */
export const addTouchFeedback = (element: HTMLElement) => {
  if (!isTouchDevice()) return;
  
  element.addEventListener('touchstart', () => {
    element.style.transform = 'scale(0.98)';
    element.style.opacity = '0.8';
  });
  
  element.addEventListener('touchend', () => {
    element.style.transform = '';
    element.style.opacity = '';
  });
  
  element.addEventListener('touchcancel', () => {
    element.style.transform = '';
    element.style.opacity = '';
  });
};

/**
 * Optimizes table display for mobile
 */
export const getMobileTableConfig = () => ({
  pageSize: isMobile() ? 5 : 10,
  showPagination: true,
  stackOnMobile: true,
  hideColumnsOnMobile: ['created_at', 'updated_at'],
});

/**
 * Gets mobile-friendly toast configuration
 */
export const getMobileToastConfig = () => ({
  position: isMobile() ? 'top-center' : 'top-right',
  duration: isMobile() ? 4000 : 3000,
  style: {
    maxWidth: isMobile() ? '90vw' : '400px',
    fontSize: isMobile() ? '16px' : '14px',
  },
});

/**
 * Handles mobile navigation timing
 */
export const getMobileNavDelay = () => (isMobile() ? 150 : 0);

/**
 * Optimizes form inputs for mobile
 */
export const getMobileInputProps = () => ({
  autoCapitalize: 'none',
  autoCorrect: 'off',
  spellCheck: false,
  style: {
    fontSize: '16px', // Prevents zoom on iOS
  },
});

/**
 * Handles mobile-specific accessibility features
 */
export const enhanceMobileAccessibility = (element: HTMLElement) => {
  if (!isTouchDevice()) return;
  
  // Ensure minimum touch target size
  const computedStyle = window.getComputedStyle(element);
  const width = parseInt(computedStyle.width);
  const height = parseInt(computedStyle.height);
  
  if (width < 44 || height < 44) {
    element.style.minWidth = '44px';
    element.style.minHeight = '44px';
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
  }
};