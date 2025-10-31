import { useEffect } from 'react';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Global component to track user presence across the entire app
 * This ensures users are marked as online/offline regardless of which page they visit
 */
export const GlobalPresenceTracker = () => {
  const { user } = useAuth();
  
  // This hook will automatically track presence when mounted
  useUserPresence();
  
  return null; // This component doesn't render anything
};
