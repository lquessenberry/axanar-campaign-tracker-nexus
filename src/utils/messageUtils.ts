// Message utility functions
export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  is_admin?: boolean;
}

/**
 * Get display name from user profile with fallbacks
 */
export const getDisplayName = (profile?: UserProfile | null): string => {
  if (!profile) return 'Unknown User';
  return profile.full_name || profile.username || 'Unknown User';
};

/**
 * Get initials from user profile
 */
export const getInitials = (profile?: UserProfile | null): string => {
  const name = getDisplayName(profile);
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2); // Limit to 2 characters for better display
};

/**
 * Format date for message timestamps
 */
export const formatMessageDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } else if (diffInHours < 7 * 24) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};

/**
 * Validate message content
 */
export const validateMessage = (content: string): { isValid: boolean; error?: string } => {
  const trimmed = content.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (trimmed.length > 1000) {
    return { isValid: false, error: 'Message must be 1000 characters or less' };
  }
  
  if (trimmed.length < 1) {
    return { isValid: false, error: 'Message is too short' };
  }
  
  return { isValid: true };
};

/**
 * Truncate text for previews
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};