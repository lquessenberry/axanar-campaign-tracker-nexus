import type { ForumCategory } from '@/hooks/useForumThreads';

export const FORUM_CATEGORIES: Record<ForumCategory, { label: string; icon: string; description: string }> = {
  'announcements': {
    label: 'Announcements',
    icon: '📢',
    description: 'Official updates and news from the Axanar team'
  },
  'general': {
    label: 'General Discussion',
    icon: '💬',
    description: 'General conversations about Axanar and Star Trek'
  },
  'production-updates': {
    label: 'Production Updates',
    icon: '🎬',
    description: 'Behind-the-scenes and production news'
  },
  'fan-content': {
    label: 'Fan Content',
    icon: '🎨',
    description: 'Share your fan art, videos, and creations'
  },
  'support': {
    label: 'Support',
    icon: '❓',
    description: 'Get help and ask questions'
  },
  'off-topic': {
    label: 'Off Topic',
    icon: '🌟',
    description: 'Anything goes - just keep it friendly'
  }
};

export const getCategoryInfo = (category: ForumCategory) => {
  return FORUM_CATEGORIES[category];
};
