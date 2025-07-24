import { useState, useCallback, useRef } from 'react';

export interface DescrambleOptions {
  duration?: number;
  scrambleIntensity?: number;
  characters?: string;
  phases?: {
    scrambling: number;
    tuningIn: number;
    signalLock: number;
    complete: number;
  };
}

export interface DescrambleState {
  isActive: boolean;
  phase: 'idle' | 'scrambling' | 'tuningIn' | 'signalLock' | 'complete';
  progress: number;
  scrambledText: string;
  staticIntensity: number;
}

const DEFAULT_OPTIONS: Required<DescrambleOptions> = {
  duration: 200000,
  scrambleIntensity: 0.8,
  characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
  phases: {
    scrambling: 50000,
    tuningIn: 100000,
    signalLock: 30000,
    complete: 20000
  }
};

export const useDescrambleEffect = (originalText: string, options: DescrambleOptions = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = useState<DescrambleState>({
    isActive: false,
    phase: 'idle',
    progress: 0,
    scrambledText: originalText,
    staticIntensity: 0
  });

  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const scrambleText = useCallback((text: string, intensity: number): string => {
    return text
      .split('')
      .map(char => {
        if (char === ' ') return ' ';
        if (Math.random() < intensity) {
          return opts.characters[Math.floor(Math.random() * opts.characters.length)];
        }
        return char;
      })
      .join('');
  }, [opts.characters]);

  const getPhaseProgress = useCallback((elapsed: number) => {
    const { scrambling, tuningIn, signalLock, complete } = opts.phases;
    
    if (elapsed < scrambling) {
      return { phase: 'scrambling' as const, progress: elapsed / scrambling };
    } else if (elapsed < scrambling + tuningIn) {
      return { phase: 'tuningIn' as const, progress: (elapsed - scrambling) / tuningIn };
    } else if (elapsed < scrambling + tuningIn + signalLock) {
      return { phase: 'signalLock' as const, progress: (elapsed - scrambling - tuningIn) / signalLock };
    } else {
      return { phase: 'complete' as const, progress: 1 };
    }
  }, [opts.phases]);

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const { phase, progress } = getPhaseProgress(elapsed);

    let scrambleIntensity = 0;
    let staticIntensity = 0;
    let currentText = originalText;

    switch (phase) {
      case 'scrambling':
        scrambleIntensity = opts.scrambleIntensity;
        staticIntensity = 1;
        currentText = scrambleText(originalText, scrambleIntensity);
        break;
      case 'tuningIn':
        scrambleIntensity = opts.scrambleIntensity * (1 - progress);
        staticIntensity = 1 - progress;
        currentText = scrambleText(originalText, scrambleIntensity);
        break;
      case 'signalLock':
        scrambleIntensity = 0.1 * (1 - progress);
        staticIntensity = 0.2 * (1 - progress);
        currentText = scrambleText(originalText, scrambleIntensity);
        break;
      case 'complete':
        scrambleIntensity = 0;
        staticIntensity = 0;
        currentText = originalText;
        break;
    }

    setState({
      isActive: phase !== 'complete',
      phase,
      progress,
      scrambledText: currentText,
      staticIntensity
    });

    if (phase !== 'complete') {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [originalText, scrambleText, getPhaseProgress, opts.scrambleIntensity]);

  const startDescramble = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    startTimeRef.current = undefined;
    animationRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const stopDescramble = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setState({
      isActive: false,
      phase: 'idle',
      progress: 0,
      scrambledText: originalText,
      staticIntensity: 0
    });
  }, [originalText]);

  return {
    ...state,
    startDescramble,
    stopDescramble
  };
};