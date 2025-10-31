/**
 * 📂 Forum Category List
 * Classic phpBB-style forum categories with stats
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, MessageCircle, Lock, Pin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ForumCategory {
  id: string;
  emoji: string;
  title: string;
  description: string;
  threadCount: number;
  postCount: number;
  lastPost?: {
    title: string;
    author: string;
    timestamp: string;
  };
  isLocked?: boolean;
  isPinned?: boolean;
}

const FORUM_CATEGORIES: ForumCategory[] = [
  {
    id: 'announcements',
    emoji: '📢',
    title: 'Announcements & News',
    description: 'Official Axanar project updates and important news from the fleet',
    threadCount: 12,
    postCount: 456,
    isPinned: true,
    lastPost: {
      title: 'Production Update - March 2025',
      author: 'CaptainQuessenberry',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'general',
    emoji: '💬',
    title: 'General Discussion',
    description: 'Talk about anything Axanar - theories, characters, storylines, and more!',
    threadCount: 234,
    postCount: 5678,
    lastPost: {
      title: 'Favorite Axanar moment so far?',
      author: 'VulcanLogic',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  },
  {
    id: 'trek-universe',
    emoji: '🖖',
    title: 'Star Trek Universe',
    description: 'Discuss the wider Star Trek universe - all series, movies, and canon',
    threadCount: 567,
    postCount: 12345,
    lastPost: {
      title: 'Best captain debate thread',
      author: 'KlingonWarrior',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    }
  },
  {
    id: 'fan-creations',
    emoji: '🎨',
    title: 'Fan Art & Creations',
    description: 'Share your artwork, videos, stories, and other creative contributions',
    threadCount: 89,
    postCount: 1234,
    lastPost: {
      title: 'My Axanar ship model WIP',
      author: 'ModelMaker42',
      timestamp: new Date(Date.now() - 14400000).toISOString()
    }
  },
  {
    id: 'support',
    emoji: '💖',
    title: 'Backer Support & Rewards',
    description: 'Questions about pledges, perks, and how to support the project',
    threadCount: 45,
    postCount: 678,
    lastPost: {
      title: 'When will digital rewards ship?',
      author: 'EagerBacker',
      timestamp: new Date(Date.now() - 28800000).toISOString()
    }
  },
  {
    id: 'off-topic',
    emoji: '🎮',
    title: 'Off-Topic Lounge',
    description: 'Non-Trek discussion - gaming, movies, life, and general chatter',
    threadCount: 178,
    postCount: 4567,
    lastPost: {
      title: 'What are you watching right now?',
      author: 'ChillVibes',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    }
  }
];

export const ForumCategoryList: React.FC = () => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {FORUM_CATEGORIES.map((category) => (
        <Card 
          key={category.id}
          className="overflow-hidden border-2 border-border/50 hover:border-axanar-teal/30 transition-all group"
        >
          <Link to={`/forum/${category.id}`}>
            <div className="flex items-start gap-4 p-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center text-4xl bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border-2 border-border/30 group-hover:border-axanar-teal/30 transition-colors">
                {category.emoji}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg group-hover:text-axanar-teal transition-colors">
                        {category.title}
                      </h3>
                      {category.isPinned && (
                        <Pin className="h-4 w-4 text-accent fill-current" />
                      )}
                      {category.isLocked && (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {category.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-axanar-teal group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>

                {/* Stats Bar */}
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="h-3 w-3" />
                    <span className="font-semibold">{category.threadCount}</span>
                    <span>threads</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span>💬</span>
                    <span className="font-semibold">{category.postCount.toLocaleString()}</span>
                    <span>posts</span>
                  </div>

                  {category.lastPost && (
                    <>
                      <div className="h-3 w-px bg-border mx-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span>Last:</span>
                          <span className="font-medium text-foreground truncate">
                            {category.lastPost.title}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          by <span className="font-semibold">{category.lastPost.author}</span>
                          {' '}{formatTimestamp(category.lastPost.timestamp)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </Card>
      ))}

      {/* Retro Footer */}
      <div className="text-center text-xs text-muted-foreground py-4">
        <div className="flex items-center justify-center gap-2">
          <span>━━━━</span>
          <span>🖖 Live Long and Prosper 🖖</span>
          <span>━━━━</span>
        </div>
        <div className="mt-2">
          Powered by friendship and warp cores 💖✨
        </div>
      </div>
    </div>
  );
};

export default ForumCategoryList;
