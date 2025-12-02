import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Play, ExternalLink, Download, Calendar, Tv, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { VideoTheaterDialog } from "@/components/VideoTheaterDialog";
import { LiveTVChannel } from "@/components/LiveTVChannel";
import Navigation from "@/components/Navigation";
import { VideoFilterBar } from "@/components/VideoFilterBar";
import { format } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  content_type: string | null;
  subject_matter: string | null;
  source_channel: string | null;
}

export default function AxanarVideos() {
  const queryClient = useQueryClient();
  const [theaterVideo, setTheaterVideo] = useState<{ id: string; title: string } | null>(null);
  const [showTV, setShowTV] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  
  // Filter state
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

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

  // Mutation to trigger video scrape (quick mode - skips archiving)
  const scrapeMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke("update-axanar-videos", {
        body: { archiveMode: 'skip', refreshPlaylists: true }
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Refreshed ${data.videos_total} videos from YouTube channels`);
      queryClient.invalidateQueries({ queryKey: ["axanar-videos"] });
    },
    onError: (error) => {
      toast.error(`Refresh failed: ${error.message}`);
    },
  });

  // Extract unique filter options
  const filterOptions = useMemo(() => {
    if (!videos) return { playlists: [], contentTypes: [], subjects: [], channels: [] };
    
    const playlists = [...new Set(videos.map(v => v.playlist_title).filter(Boolean))] as string[];
    const contentTypes = [...new Set(videos.map(v => v.content_type).filter(Boolean))] as string[];
    const subjects = [...new Set(videos.map(v => v.subject_matter).filter(Boolean))] as string[];
    const channels = [...new Set(videos.map(v => v.source_channel).filter(Boolean))] as string[];
    
    return { playlists, contentTypes, subjects, channels };
  }, [videos]);

  // Group videos by playlist (for Live TV)
  const playlists = useMemo(() => {
    return videos?.reduce((acc, video) => {
      const playlist = video.playlist_title || "Uncategorized";
      if (!acc[playlist]) acc[playlist] = [];
      acc[playlist].push(video);
      return acc;
    }, {} as Record<string, AxanarVideo[]>) || {};
  }, [videos]);

  const playlistNames = Object.keys(playlists);
  
  // Apply filters
  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    
    return videos.filter(video => {
      if (selectedPlaylist && video.playlist_title !== selectedPlaylist) return false;
      if (selectedContentType && video.content_type !== selectedContentType) return false;
      if (selectedSubject && video.subject_matter !== selectedSubject) return false;
      if (selectedChannel && video.source_channel !== selectedChannel) return false;
      return true;
    });
  }, [videos, selectedPlaylist, selectedContentType, selectedSubject, selectedChannel]);

  const clearAllFilters = () => {
    setSelectedPlaylist(null);
    setSelectedContentType(null);
    setSelectedSubject(null);
    setSelectedChannel(null);
  };

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
    <>
      <Navigation />
      <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Axanar TV</h1>
            <p className="text-muted-foreground">
              {videos?.length || 0} videos from Axanar & Friends
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={showTV ? "default" : "outline"}
              onClick={() => setShowTV(!showTV)}
            >
              <Tv className="w-4 h-4 mr-2" />
              {showTV ? "Hide TV" : "Live TV"}
            </Button>
            <Button
              variant="outline"
              onClick={generateM3U}
              disabled={!videos || videos.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download .m3u8
            </Button>
            <Button
              variant="outline"
              onClick={() => scrapeMutation.mutate()}
              disabled={scrapeMutation.isPending}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${scrapeMutation.isPending ? "animate-spin" : ""}`} />
              {scrapeMutation.isPending ? "Scraping..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Live TV Channel */}
        {showTV && videos && videos.length > 0 && (
          <div className="w-full">
            <LiveTVChannel
              videos={videos}
              playlists={playlists}
              playlistNames={playlistNames}
            />
          </div>
        )}

        {/* Collapsible Filters */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
                {filtersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            {!filtersOpen && (selectedPlaylist || selectedContentType || selectedSubject || selectedChannel) && (
              <span className="text-sm text-muted-foreground">
                Showing {filteredVideos.length} of {videos?.length || 0}
              </span>
            )}
          </div>
          <CollapsibleContent className="pt-4">
            <Card>
              <CardContent className="p-4">
                <VideoFilterBar
                  playlists={filterOptions.playlists}
                  contentTypes={filterOptions.contentTypes}
                  subjects={filterOptions.subjects}
                  channels={filterOptions.channels}
                  selectedPlaylist={selectedPlaylist}
                  selectedContentType={selectedContentType}
                  selectedSubject={selectedSubject}
                  selectedChannel={selectedChannel}
                  totalVideos={videos?.length || 0}
                  filteredCount={filteredVideos.length}
                  onPlaylistChange={setSelectedPlaylist}
                  onContentTypeChange={setSelectedContentType}
                  onSubjectChange={setSelectedSubject}
                  onChannelChange={setSelectedChannel}
                  onClearAll={clearAllFilters}
                />
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

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
                {videos && videos.length > 0 
                  ? "No videos match your filters. Try adjusting your selection."
                  : "No videos found. Click \"Refresh\" to scrape from YouTube."}
              </p>
              {videos && videos.length > 0 ? (
                <Button onClick={clearAllFilters}>Clear Filters</Button>
              ) : (
                <Button onClick={() => scrapeMutation.mutate()} disabled={scrapeMutation.isPending}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${scrapeMutation.isPending ? "animate-spin" : ""}`} />
                  Scrape Videos Now
                </Button>
              )}
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
                  {/* Category badges on thumbnail */}
                  <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
                    {video.content_type && video.content_type !== 'General' && (
                      <Badge variant="secondary" className="text-xs bg-black/70 text-white border-0">
                        {video.content_type}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground line-clamp-2 mb-2">
                    {video.title || "Untitled"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground mb-2">
                    {video.source_channel && (
                      <Badge variant="outline" className="text-xs">
                        {video.source_channel}
                      </Badge>
                    )}
                    {video.subject_matter && video.subject_matter !== 'General' && (
                      <Badge variant="outline" className="text-xs">
                        {video.subject_matter}
                      </Badge>
                    )}
                  </div>
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
    </>
  );
}
