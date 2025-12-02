import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Video, 
  Archive, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Play,
  ExternalLink,
  Clock,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface AxanarVideo {
  id: string;
  video_id: string;
  video_url: string;
  title: string | null;
  playlist_title: string | null;
  archive_url: string | null;
  position: number | null;
  created_at: string | null;
  updated_at: string | null;
}

const AxanarVideoArchiveStatus = () => {
  const queryClient = useQueryClient();
  const [isRunningCrawl, setIsRunningCrawl] = useState(false);

  // Fetch all videos with archive status
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['axanar-videos-archive-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('axanar_videos')
        .select('*')
        .order('playlist_title', { ascending: true })
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data as AxanarVideo[];
    }
  });

  // Run the scraper with archive mode
  const runCrawlMutation = useMutation({
    mutationFn: async (archiveMode: string) => {
      setIsRunningCrawl(true);
      const { data, error } = await supabase.functions.invoke('update-axanar-videos', {
        body: { archiveMode }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Crawl complete: ${data.videos_collected} videos, ${data.videos_archived} archived`);
      queryClient.invalidateQueries({ queryKey: ['axanar-videos-archive-status'] });
      setIsRunningCrawl(false);
    },
    onError: (error) => {
      toast.error(`Crawl failed: ${error.message}`);
      setIsRunningCrawl(false);
    }
  });

  // Calculate statistics
  const stats = videos ? {
    total: videos.length,
    archived: videos.filter(v => v.archive_url).length,
    pending: videos.filter(v => !v.archive_url).length,
    playlists: [...new Set(videos.map(v => v.playlist_title))].filter(Boolean).length,
    archivePercentage: videos.length > 0 
      ? Math.round((videos.filter(v => v.archive_url).length / videos.length) * 100) 
      : 0
  } : { total: 0, archived: 0, pending: 0, playlists: 0, archivePercentage: 0 };

  // Group videos by playlist
  const videosByPlaylist = videos?.reduce((acc, video) => {
    const playlist = video.playlist_title || 'Uncategorized';
    if (!acc[playlist]) acc[playlist] = [];
    acc[playlist].push(video);
    return acc;
  }, {} as Record<string, AxanarVideo[]>) || {};

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Error loading video archive status: {(error as Error).message}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Video className="h-4 w-4 text-primary" />
              Total Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Archived
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.archived}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Play className="h-4 w-4 text-muted-foreground" />
              Playlists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.playlists}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Archive className="h-4 w-4 text-primary" />
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.archivePercentage}%</div>
            <Progress value={stats.archivePercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Crawl Actions
          </CardTitle>
          <CardDescription>
            Run the YouTube scraper with different archive modes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => runCrawlMutation.mutate('smart')}
              disabled={isRunningCrawl}
              className="min-w-[140px]"
            >
              {isRunningCrawl ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Archive className="h-4 w-4 mr-2" />
              )}
              Smart Crawl
            </Button>
            
            <Button
              variant="outline"
              onClick={() => runCrawlMutation.mutate('lookup-only')}
              disabled={isRunningCrawl}
              className="min-w-[140px]"
            >
              Lookup Only
            </Button>
            
            <Button
              variant="outline"
              onClick={() => runCrawlMutation.mutate('submit-only')}
              disabled={isRunningCrawl}
              className="min-w-[140px]"
            >
              Submit Only
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => runCrawlMutation.mutate('skip')}
              disabled={isRunningCrawl}
              className="min-w-[140px]"
            >
              Scrape Only
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground space-y-1">
            <p><strong>Smart:</strong> Lookup first, submit only if no archive exists (recommended)</p>
            <p><strong>Lookup Only:</strong> Only check for existing archives, never submit</p>
            <p><strong>Submit Only:</strong> Submit all videos to archive.today (may create duplicates)</p>
            <p><strong>Scrape Only:</strong> Just scrape YouTube playlists, skip archiving</p>
          </div>
        </CardContent>
      </Card>

      {/* Videos by Playlist */}
      <Card>
        <CardHeader>
          <CardTitle>Videos by Playlist</CardTitle>
          <CardDescription>
            Archive status for each video organized by playlist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {Object.entries(videosByPlaylist).map(([playlist, playlistVideos]) => {
                const archivedCount = playlistVideos.filter(v => v.archive_url).length;
                const percentage = Math.round((archivedCount / playlistVideos.length) * 100);
                
                return (
                  <div key={playlist} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{playlist}</h3>
                      <Badge variant={percentage === 100 ? "default" : percentage >= 50 ? "secondary" : "outline"}>
                        {archivedCount}/{playlistVideos.length} archived ({percentage}%)
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {playlistVideos.map((video) => (
                        <div 
                          key={video.id} 
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {video.archive_url ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{video.title || 'Untitled'}</p>
                              <p className="text-xs text-muted-foreground">
                                Position: {video.position ?? 'N/A'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              asChild
                              className="h-8 w-8 p-0"
                            >
                              <a 
                                href={video.video_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                title="Watch on YouTube"
                              >
                                <Play className="h-4 w-4" />
                              </a>
                            </Button>
                            
                            {video.archive_url && (
                              <Button
                                size="sm"
                                variant="ghost"
                                asChild
                                className="h-8 w-8 p-0"
                              >
                                <a 
                                  href={video.archive_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  title="View Archive"
                                >
                                  <ExternalLink className="h-4 w-4 text-green-500" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AxanarVideoArchiveStatus;
