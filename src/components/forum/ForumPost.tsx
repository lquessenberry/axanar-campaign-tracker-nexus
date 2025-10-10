/**
 * 📝 Forum Post Component
 * phpBB/early 2000s style forum post with all the nostalgic features
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MessageCircle, 
  Flag, 
  Share2, 
  MoreVertical,
  Quote,
  ThumbsUp
} from 'lucide-react';
import UserSignature from './UserSignature';
import { parseEmojis } from '@/lib/forum-emojis';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ForumPostProps {
  id: string;
  author: {
    username: string;
    avatarUrl?: string;
    rank?: {
      name: string;
      min_points: number;
    };
    badges?: Array<{ label: string; icon?: string; }>;
    postCount?: number;
    joinedDate?: string;
    signatureText?: string;
  };
  content: string;
  timestamp: string;
  likes?: number;
  replies?: number;
  isLiked?: boolean;
  isPinned?: boolean;
  isEdited?: boolean;
}

export const ForumPost: React.FC<ForumPostProps> = ({
  id,
  author,
  content,
  timestamp,
  likes = 0,
  replies = 0,
  isLiked = false,
  isPinned = false,
  isEdited = false
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <Card className="overflow-hidden border-2 border-border/50 hover:border-axanar-teal/30 transition-colors bg-gradient-to-br from-card via-card to-card/80">
      {/* Pinned Indicator */}
      {isPinned && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-b border-yellow-500/30 px-4 py-1.5 text-xs font-semibold flex items-center gap-2">
          📌 PINNED POST
        </div>
      )}

      <div className="flex flex-col md:flex-row">
        {/* Author Sidebar - Classic phpBB style */}
        <div className="md:w-48 bg-muted/30 border-b md:border-b-0 md:border-r border-border/50 p-4 flex md:flex-col items-center md:items-start gap-3">
          {/* Avatar */}
          {author.avatarUrl ? (
            <img 
              src={author.avatarUrl} 
              alt={author.username}
              className="w-16 h-16 md:w-20 md:h-20 rounded-lg border-3 border-axanar-teal/50 shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gradient-to-br from-axanar-teal/30 to-blue-500/30 flex items-center justify-center font-bold text-2xl border-3 border-axanar-teal/50">
              {author.username.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Username */}
          <div className="flex-1 md:text-center md:w-full">
            <div className="font-bold text-sm hover:text-axanar-teal transition-colors cursor-pointer">
              {author.username}
            </div>
            
            {/* Rank */}
            {author.rank && (
              <div className="text-xs text-axanar-teal font-semibold mt-1 flex items-center gap-1 md:justify-center">
                ⭐ {author.rank.name}
              </div>
            )}

            {/* Mini Badges */}
            {author.badges && author.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 md:justify-center">
                {author.badges.slice(0, 3).map((badge, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-1.5 py-0.5 bg-axanar-teal/10 border border-axanar-teal/30 rounded"
                    title={badge.label}
                  >
                    {badge.icon || '🏅'}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="text-[10px] text-muted-foreground mt-2 space-y-0.5">
              <div>💬 {author.postCount || 0} posts</div>
              {author.joinedDate && (
                <div>📅 {new Date(author.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
              )}
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="flex-1 p-4">
          {/* Post Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>🕐 {new Date(timestamp).toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}</span>
              {isEdited && (
                <span className="italic">✏️ edited</span>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Quote className="h-4 w-4 mr-2" />
                  Quote
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Post Body */}
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ 
              __html: parseEmojis(content).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />') 
            }}
          />

          {/* User Signature */}
          <UserSignature
            username={author.username}
            rank={author.rank}
            badges={author.badges}
            postCount={author.postCount}
            joinedDate={author.joinedDate}
            signatureText={author.signatureText}
            avatarUrl={author.avatarUrl}
          />

          {/* Action Bar */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/30">
            <Button
              variant={liked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              className={liked ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
              {likeCount}
            </Button>

            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-1" />
              Reply
            </Button>

            <Button variant="outline" size="sm">
              <ThumbsUp className="h-4 w-4 mr-1" />
              Thank
            </Button>

            {replies > 0 && (
              <span className="ml-auto text-xs text-muted-foreground">
                💬 {replies} {replies === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ForumPost;
