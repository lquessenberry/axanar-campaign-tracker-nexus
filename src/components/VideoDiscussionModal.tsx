import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Send, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface VideoDiscussionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
  videoTitle: string;
  videoUrl?: string;
}

export function VideoDiscussionModal({
  open,
  onOpenChange,
  videoId,
  videoTitle,
  videoUrl,
}: VideoDiscussionModalProps) {
  const queryClient = useQueryClient();
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newComment, setNewComment] = useState("");

  // Check if user is authenticated
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Get user profile
  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("username, full_name")
        .eq("id", session.user.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Check if a thread exists for this video
  const { data: existingThread, isLoading: loadingThread } = useQuery({
    queryKey: ["video-thread", videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select("*, forum_comments(id, content, author_username, created_at)")
        .eq("video_id", videoId)
        .single();
      
      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
      return data;
    },
    enabled: open && !!videoId,
  });

  // Create new thread mutation
  const createThreadMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !profile) throw new Error("Must be logged in");
      
      const username = profile.full_name || profile.username || "Anonymous";
      const title = newPostTitle.trim() || `Discussion: ${videoTitle}`;
      const videoLink = videoUrl || `https://youtube.com/watch?v=${videoId}`;
      const content = newPostContent.trim() 
        ? `${newPostContent}\n\n---\n📺 [Watch the video](${videoLink})`
        : `What are your thoughts on this video?\n\n📺 [Watch the video](${videoLink})`;

      const { data, error } = await supabase
        .from("forum_threads")
        .insert({
          title,
          content,
          author_user_id: session.user.id,
          author_username: username,
          category: "general",
          video_id: videoId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Discussion started!");
      setNewPostTitle("");
      setNewPostContent("");
      queryClient.invalidateQueries({ queryKey: ["video-thread", videoId] });
    },
    onError: (error) => {
      toast.error(`Failed to create discussion: ${error.message}`);
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !profile || !existingThread) {
        throw new Error("Must be logged in");
      }
      
      const username = profile.full_name || profile.username || "Anonymous";

      const { data, error } = await supabase
        .from("forum_comments")
        .insert({
          thread_id: existingThread.id,
          content: newComment.trim(),
          author_user_id: session.user.id,
          author_username: username,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Comment added!");
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["video-thread", videoId] });
    },
    onError: (error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    },
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setNewPostTitle("");
      setNewPostContent("");
      setNewComment("");
    }
  }, [open]);

  const isLoggedIn = !!session?.user;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {existingThread ? "Video Discussion" : "Start Discussion"}
          </DialogTitle>
        </DialogHeader>

        {/* Video info */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <img
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
            alt=""
            className="w-20 h-12 object-cover rounded"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm line-clamp-2">{videoTitle}</p>
          </div>
        </div>

        {loadingThread ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : existingThread ? (
          /* Existing thread - show comments and add comment form */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {existingThread.forum_comments?.length || 0} comments
              </p>
              <Link 
                to={`/forum/thread/${existingThread.id}`}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View full thread <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Recent comments */}
            <ScrollArea className="h-48 border rounded-lg p-3">
              {existingThread.forum_comments && existingThread.forum_comments.length > 0 ? (
                <div className="space-y-3">
                  {existingThread.forum_comments.slice(-5).map((comment: any) => (
                    <div key={comment.id} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{comment.author_username}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-muted-foreground line-clamp-3">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No comments yet. Be the first!
                </p>
              )}
            </ScrollArea>

            {/* Add comment form */}
            {isLoggedIn ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newComment.trim()) {
                      addCommentMutation.mutate();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={() => addCommentMutation.mutate()}
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to join the discussion
              </p>
            )}
          </div>
        ) : (
          /* No thread - show create form */
          <div className="space-y-4">
            {isLoggedIn ? (
              <>
                <p className="text-sm text-muted-foreground">
                  No discussion exists for this video yet. Start one!
                </p>
                <Input
                  placeholder={`Discussion: ${videoTitle.slice(0, 50)}...`}
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Share your thoughts about this video..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                />
                <Button
                  className="w-full"
                  onClick={() => createThreadMutation.mutate()}
                  disabled={createThreadMutation.isPending}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {createThreadMutation.isPending ? "Creating..." : "Start Discussion"}
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in to start a discussion about this video
                </p>
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
