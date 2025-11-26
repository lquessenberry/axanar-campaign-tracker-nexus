import { useState, useEffect } from 'react';
import { isHandheldGamingDevice, isGamepadConnected } from '@/utils/mobileOptimizations';

/**
 * Hook to detect handheld gaming devices and gamepad connections
 * Optimized for Steam Deck, ROG Ally, Legion Go, etc.
 */
export function useHandheldDevice() {
  const [isHandheld, setIsHandheld] = useState(false);
  const [hasGamepad, setHasGamepad] = useState(false);
  const [isThumbMode, setIsThumbMode] = useState(false);

  useEffect(() => {
    // Initial detection
    const handheld = isHandheldGamingDevice();
    const gamepad = isGamepadConnected();
    
    setIsHandheld(handheld);
    setHasGamepad(gamepad);
    setIsThumbMode(handheld || gamepad);

    // Apply thumby-mode class to body
    if (handheld || gamepad) {
      document.body.classList.add('thumby-mode');
    }

    // Listen for gamepad connections
    const handleGamepadConnected = () => {
      setHasGamepad(true);
      setIsThumbMode(true);
      document.body.classList.add('thumby-mode');
    };

    const handleGamepadDisconnected = () => {
      const stillConnected = isGamepadConnected();
      setHasGamepad(stillConnected);
      if (!stillConnected && !isHandheld) {
        setIsThumbMode(false);
        document.body.classList.remove('thumby-mode');
      }
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, []);

  return {
    isHandheld,
    hasGamepad,
    isThumbMode, // True if either handheld device or gamepad connected
    deviceType: isHandheld ? 'handheld' : hasGamepad ? 'gamepad' : 'standard'
  };
}
