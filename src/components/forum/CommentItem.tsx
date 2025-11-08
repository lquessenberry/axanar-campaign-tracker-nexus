import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { ForumComment } from '@/hooks/useForumComments';
import { OnlineIndicator } from './OnlineIndicator';
import { parseEmojis } from '@/lib/forum-emojis';
import { sanitizeHtml } from '@/utils/sanitizeHtml';
import { parseMentions } from '@/utils/mentionParser';
import { ProfileHoverCard } from './ProfileHoverCard';
import { Link } from 'react-router-dom';

interface CommentItemProps {
  comment: ForumComment;
  onLike?: () => void;
  isLiked?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, onLike, isLiked }) => {
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
    <Card className="bg-muted/30 border-border/50">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <Link to={`/u/${comment.author_username}`} className="relative">
            <ProfileHoverCard username={comment.author_username}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-axanar-teal/30 to-blue-500/30 flex items-center justify-center font-bold border-2 border-axanar-teal/50 cursor-pointer hover:border-axanar-teal transition-colors">
                {comment.author_username.charAt(0).toUpperCase()}
              </div>
            </ProfileHoverCard>
            {comment.author_user_id && (
              <div className="absolute -bottom-1 -right-1">
                <OnlineIndicator userId={comment.author_user_id} />
              </div>
            )}
          </Link>
          <div className="flex-1">
            <ProfileHoverCard username={comment.author_username}>
              <Link 
                to={`/u/${comment.author_username}`}
                className="font-semibold text-sm hover:text-axanar-teal transition-colors"
              >
                {comment.author_username}
              </Link>
            </ProfileHoverCard>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span>{formatTimestamp(comment.created_at)}</span>
              {comment.is_edited && <span className="italic">• edited</span>}
            </div>
          </div>
        </div>

        {/* Content */}
        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ 
            __html: sanitizeHtml(
              parseMentions(
                parseEmojis(comment.content).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />')
              )
            )
          }}
        />

        {/* Image */}
        {comment.image_url && (
          <img 
            src={comment.image_url} 
            alt="Comment attachment"
            className="mt-3 rounded-lg max-h-64 object-cover"
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
          <Button
            variant={isLiked ? "default" : "ghost"}
            size="sm"
            onClick={onLike}
            className={isLiked ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
            {comment.like_count}
          </Button>
          <span className="ml-auto px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs font-semibold">
            +20 ARES
          </span>
        </div>
      </div>
    </Card>
  );
};

export default CommentItem;
