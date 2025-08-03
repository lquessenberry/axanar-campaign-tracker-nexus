import { useState, useEffect } from 'react';
import type { AlertLevel } from './useAlertSystem';

const PROMPT_MESSAGES = [
  "Ensign! Are you at your post?",
  "Security alert: Unauthorized access detected. Please identify yourself.",
  "Commander, your presence is required at the command console.",
  "Bridge to Security: Please confirm status.",
  "All hands, report to stations immediately."
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