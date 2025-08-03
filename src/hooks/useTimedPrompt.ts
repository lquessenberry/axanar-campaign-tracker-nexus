import { useState, useEffect } from 'react';

const PROMPT_MESSAGES = [
  "Ensign! Are you at your post?",
  "Security alert: Unauthorized access detected. Please identify yourself.",
  "Commander, your presence is required at the command console.",
  "Bridge to Security: Please confirm status.",
  "All hands, report to stations immediately."
];

export const useTimedPrompt = (delayMs: number = 30000) => {
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

  const dismissPrompt = () => {
    setIsPromptVisible(false);
  };

  return {
    isPromptVisible,
    promptMessage,
    dismissPrompt
  };
};