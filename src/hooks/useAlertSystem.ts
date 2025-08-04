import { useState, useEffect, useCallback } from 'react';

export type AlertLevel = 'normal' | 'warning' | 'red-alert';

interface AlertSystemState {
  level: AlertLevel;
  isActive: boolean;
  timeInLevel: number;
}

export const useAlertSystem = () => {
  const [alertState, setAlertState] = useState<AlertSystemState>({
    level: 'normal',
    isActive: false,
    timeInLevel: 0
  });

  // Auto-progression through alert levels
  useEffect(() => {
    const interval = setInterval(() => {
      setAlertState(prev => {
        const newTimeInLevel = prev.timeInLevel + 1;
        
        // Auto-progression logic
        if (prev.level === 'normal' && newTimeInLevel >= 10) {
          return { level: 'warning', isActive: true, timeInLevel: 0 };
        } else if (prev.level === 'warning' && newTimeInLevel >= 8) {
          return { level: 'red-alert', isActive: true, timeInLevel: 0 };
        } else if (prev.level === 'red-alert' && newTimeInLevel >= 60) {
          return { level: 'normal', isActive: false, timeInLevel: 0 };
        }
        
        return { ...prev, timeInLevel: newTimeInLevel };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const clearAlert = useCallback(() => {
    setAlertState({ level: 'normal', isActive: false, timeInLevel: 0 });
  }, []);

  const cycleAlert = useCallback(() => {
    setAlertState(prev => {
      switch (prev.level) {
        case 'normal':
          return { level: 'warning', isActive: true, timeInLevel: 0 };
        case 'warning':
          return { level: 'red-alert', isActive: true, timeInLevel: 0 };
        case 'red-alert':
          return { level: 'normal', isActive: false, timeInLevel: 0 };
        default:
          return { level: 'normal', isActive: false, timeInLevel: 0 };
      }
    });
  }, []);

  return {
    alertLevel: alertState.level,
    isAlertActive: alertState.isActive,
    timeInLevel: alertState.timeInLevel,
    clearAlert,
    cycleAlert
  };
};