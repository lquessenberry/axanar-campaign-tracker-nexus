import { useState, useEffect } from 'react';
import type { AlertLevel } from './useAlertSystem';

const PROMPT_MESSAGES = [
  "IDENTITY VERIFICATION REQUIRED • Access your account to confirm your rank and clearance level",
  "UNAUTHORIZED ACCESS DETECTED • Login to verify your Starfleet credentials and mission status", 
  "SECURITY PROTOCOL ACTIVE • Account verification needed to access classified systems",
  "ALL PERSONNEL REPORT • Authenticate your identity to receive mission briefings",
  "CLEARANCE VALIDATION PENDING • Login required to confirm your security authorization"
];

export const useTimedPrompt = (alertLevel: AlertLevel, delayMs: number = 20000) => {
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [promptMessage, setPromptMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      const randomMessage = PROMPT_MESSAGES[Math.floor(Math.random() * PROMPT_MESSAGES.length)];
      setPromptMessage(randomMessage);
      setIsPromptVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  // Show prompt when red alert is triggered
  useEffect(() => {
    if (alertLevel === 'red-alert') {
      const randomMessage = PROMPT_MESSAGES[Math.floor(Math.random() * PROMPT_MESSAGES.length)];
      setPromptMessage(randomMessage);
      setIsPromptVisible(true);
    }
  }, [alertLevel]);

  const dismissPrompt = () => {
    setIsPromptVisible(false);
  };

  return {
    isPromptVisible,
    promptMessage,
    dismissPrompt
  };
};