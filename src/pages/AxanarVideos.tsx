import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Play, ExternalLink, Download, Calendar } from "lucide-react";
import { toast } from "sonner";
import { VideoTheaterDialog } from "@/components/VideoTheaterDialog";
import { format } from "date-fns";

interface AxanarVideo {
  id: string;
  video_id: string;
  video_url: string;
  title: string | null;
  playlist_title: string | null;
  position: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function AxanarVideos() {
  const queryClient = useQueryClient();
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [theaterVideo, setTheaterVideo] = useState<{ id: string; title: string } | null>(null);

  // Fetch videos from database
  const { data: videos, isLoading } = useQuery({
    queryKey: ["axanar-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("axanar_videos")
        .select("*")
        .order("playlist_title", { ascending: true })
        .order("position", { ascending: true });

      if (error) throw error;
      return data as AxanarVideo[];
    },
  });

  // Mutation to trigger video scrape
  const scrapeMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke("update-axanar-videos");
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Scraped ${data.videos_collected} videos from ${data.playlists_found} playlists`);
      queryClient.invalidateQueries({ queryKey: ["axanar-videos"] });
    },
    onError: (error) => {
      toast.error(`Scrape failed: ${error.message}`);
    },
  });

  // Group videos by playlist
  const playlists = videos?.reduce((acc, video) => {
    const playlist = video.playlist_title || "Uncategorized";
    if (!acc[playlist]) acc[playlist] = [];
    acc[playlist].push(video);
    return acc;
  }, {} as Record<string, AxanarVideo[]>) || {};

  const playlistNames = Object.keys(playlists);
  const filteredVideos = selectedPlaylist 
    ? playlists[selectedPlaylist] || []
    : videos || [];

  // Generate M3U playlist
  const generateM3U = () => {
    if (!videos || videos.length === 0) return;
    
    const m3u = [
      "#EXTM3U",
      ...videos.map(v => `#EXTINF:-1,${v.title || "Untitled"}\n${v.video_url}`)
    ].join("\n");

    const blob = new Blob([m3u], { type: "audio/x-mpegurl" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "axanar-videos.m3u8";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Axanar Videos</h1>
            <p className="text-muted-foreground">
              {videos?.length || 0} videos from @AxanarHQ YouTube channel
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generateM3U}
              disabled={!videos || videos.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download .m3u8
            </Button>
            <Button
              onClick={() => scrapeMutation.mutate()}
              disabled={scrapeMutation.isPending}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${scrapeMutation.isPending ? "animate-spin" : ""}`} />
              {scrapeMutation.isPending ? "Scraping..." : "Refresh Videos"}
            </Button>
          </div>
        </div>

        {/* Playlist Filter */}
        {playlistNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedPlaylist === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPlaylist(null)}
            >
              All ({videos?.length || 0})
            </Button>
            {playlistNames.map((playlist) => (
              <Button
                key={playlist}
                variant={selectedPlaylist === playlist ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPlaylist(playlist)}
              >
                {playlist} ({playlists[playlist].length})
              </Button>
            ))}
          </div>
        )}

        {/* Video Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No videos found. Click "Refresh Videos" to scrape from YouTube.
              </p>
              <Button onClick={() => scrapeMutation.mutate()} disabled={scrapeMutation.isPending}>
                <RefreshCw className={`w-4 h-4 mr-2 ${scrapeMutation.isPending ? "animate-spin" : ""}`} />
                Scrape Videos Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted group">
                  <img
                    src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                    alt={video.title || "Video thumbnail"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <button
                    onClick={() => setTheaterVideo({ id: video.video_id, title: video.title || "Untitled" })}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Play className="w-12 h-12 text-white fill-white" />
                  </button>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground line-clamp-2 mb-1">
                    {video.title || "Untitled"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span>{video.playlist_title || "No playlist"}</span>
                    {video.published_at && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(video.published_at), "MMM d, yyyy")}
                        </span>
                      </>
                    )}
                  </div>
                  <a
                    href={video.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                  >
                    Watch on YouTube <ExternalLink className="w-3 h-3" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <VideoTheaterDialog
          open={!!theaterVideo}
          onOpenChange={(open) => !open && setTheaterVideo(null)}
          videoId={theaterVideo?.id || null}
          title={theaterVideo?.title || ""}
        />
      </div>
    </div>
  );
}
