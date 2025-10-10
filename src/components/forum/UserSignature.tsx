/**
 * 💫 User Signature Component
 * Classic phpBB/forum signature with rank, badges, and custom text
 */

import React from 'react';
import { Award, Star } from 'lucide-react';
import { parseEmojis } from '@/lib/forum-emojis';

interface UserSignatureProps {
  username: string;
  rank?: {
    name: string;
    min_points: number;
  };
  badges?: Array<{
    label: string;
    icon?: string;
  }>;
  postCount?: number;
  joinedDate?: string;
  signatureText?: string;
  avatarUrl?: string;
}

export const UserSignature: React.FC<UserSignatureProps> = ({
  username,
  rank,
  badges = [],
  postCount = 0,
  joinedDate,
  signatureText,
  avatarUrl
}) => {
  return (
    <div className="border-t-2 border-dashed border-border/50 mt-4 pt-3 text-xs space-y-2">
      {/* User Info Bar */}
      <div className="flex items-center gap-3">
        {/* Mini Avatar */}
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={username}
            className="w-8 h-8 rounded-full border-2 border-axanar-teal/50"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-axanar-teal/30 to-blue-500/30 flex items-center justify-center font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Rank */}
          {rank && (
            <div className="flex items-center gap-1 text-axanar-teal font-bold">
              <Star className="h-3 w-3 fill-current" />
              <span>{rank.name}</span>
            </div>
          )}
          
          {/* Stats */}
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>💬 {postCount} posts</span>
            {joinedDate && (
              <span>📅 Joined {new Date(joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
            )}
          </div>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {badges.slice(0, 5).map((badge, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-axanar-teal/10 border border-axanar-teal/30 text-[10px] font-semibold"
              title={badge.label}
            >
              {badge.icon || <Award className="h-2.5 w-2.5" />}
              {badge.label}
            </span>
          ))}
          {badges.length > 5 && (
            <span className="text-muted-foreground">+{badges.length - 5} more</span>
          )}
        </div>
      )}

      {/* Custom Signature Text */}
      {signatureText && (
        <div className="border-l-2 border-axanar-teal/30 pl-3 italic text-muted-foreground">
          <div 
            className="prose prose-xs max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: parseEmojis(signatureText).replace(/\n/g, '<br />') 
            }}
          />
        </div>
      )}

      {/* Retro Separator */}
      <div className="flex items-center justify-center gap-2 text-[8px] text-muted-foreground/50">
        <span>━━━━</span>
        <span>🖖</span>
        <span>━━━━</span>
      </div>
    </div>
  );
};

export default UserSignature;
