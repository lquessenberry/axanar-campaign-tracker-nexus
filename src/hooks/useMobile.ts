import { useEffect, useState } from "react";

/**
 * Custom hook to detect mobile devices and screen changes
 */
export function useMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });

  const [isTablet, setIsTablet] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  });

  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    const handleTouchChange = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0,
      );
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("touchstart", handleTouchChange, { once: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("touchstart", handleTouchChange);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    isTouchDevice,
    screenSize: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
  };
}

/**
 * Convenience wrapper that returns a simple boolean.
 * Drop-in replacement for the old use-mobile.tsx hook.
 */
export function useIsMobile(): boolean {
  const { isMobile } = useMobile();
  return isMobile;
}
