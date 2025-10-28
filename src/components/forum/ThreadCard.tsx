import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Eye, Pin, Bookmark, MoreVertical, Edit, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ForumThread } from '@/hooks/useForumThreads';
import { parseEmojis } from '@/lib/forum-emojis';
import { sanitizeHtml } from '@/utils/sanitizeHtml';
import { useToggleBookmark } from '@/hooks/useForumBookmarks';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateThread, useDeleteThread } from '@/hooks/useForumThreads';

interface ThreadCardProps {
  thread: ForumThread;
  onLike?: () => void;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export const ThreadCard: React.FC<ThreadCardProps> = ({ thread, onLike, isLiked, isBookmarked = false }) => {
  const { user } = useAuth();
  const toggleBookmark = useToggleBookmark();
  const updateThread = useUpdateThread();
  const deleteThread = useDeleteThread();
  
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(thread.title);
  const [editContent, setEditContent] = useState(thread.content);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isAuthor = user?.id === thread.author_user_id;

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

  const handleEdit = () => {
    updateThread.mutate({ threadId: thread.id, title: editTitle, content: editContent });
    setEditOpen(false);
  };

  const handleDelete = () => {
    deleteThread.mutate(thread.id);
    setDeleteOpen(false);
  };

  return (
    <>
      <Card className="overflow-hidden border-2 border-border/50 hover:border-axanar-teal/30 transition-all group">
        {thread.is_pinned && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-b border-yellow-500/30 px-4 py-1.5 text-xs font-semibold flex items-center gap-2">
            <Pin className="h-3 w-3 fill-current" />
            PINNED POST
          </div>
        )}

        <div className="p-4">
          <Link to={`/forum/thread/${thread.id}`}>
            <div className="flex items-start gap-4">
              {/* Author Avatar */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-axanar-teal/30 to-blue-500/30 flex items-center justify-center font-bold text-lg border-2 border-axanar-teal/50">
                {thread.author_username.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg group-hover:text-axanar-teal transition-colors line-clamp-2">
                      {thread.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="font-semibold text-foreground">{thread.author_username}</span>
                      {thread.author_rank_name && (
                        <>
                          <span>•</span>
                          <span className="text-axanar-teal">⭐ {thread.author_rank_name}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatTimestamp(thread.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs bg-muted rounded-full">{thread.category}</span>
                    {isAuthor && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.preventDefault(); setEditOpen(true); }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => { e.preventDefault(); setDeleteOpen(true); }}
                            className="text-destructive"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Preview */}
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert line-clamp-2 text-muted-foreground"
                  dangerouslySetInnerHTML={{ 
                    __html: sanitizeHtml(parseEmojis(thread.content).replace(/\n/g, ' '))
                  }}
                />

                {/* Image Preview */}
                {thread.image_url && (
                  <img 
                    src={thread.image_url} 
                    alt="Thread preview"
                    className="mt-3 rounded-lg max-h-48 object-cover w-full"
                  />
                )}
              </div>
            </div>
          </Link>

          {/* Stats & Actions */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/30">
            <Button
              variant={isLiked ? "default" : "ghost"}
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onLike?.();
              }}
              className={isLiked ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {thread.like_count}
            </Button>

            <Link to={`/forum/thread/${thread.id}`}>
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4 mr-1" />
                {thread.comment_count}
              </Button>
            </Link>

            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  toggleBookmark.mutate({ threadId: thread.id, isBookmarked });
                }}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            )}

            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Eye className="h-3 w-3" />
              {thread.view_count}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Thread</DialogTitle>
            <DialogDescription>Update your thread details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Thread title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <Textarea
              placeholder="Thread content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Thread</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this thread? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ThreadCard;
