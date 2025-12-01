import { useState, useEffect, useMemo, useRef } from "react";
import { Tv, Radio, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Video {
  video_id: string;
  title: string | null;
  playlist_title: string | null;
  position: number | null;
}

interface LiveTVChannelProps {
  videos: Video[];
  playlists: Record<string, Video[]>;
  playlistNames: string[];
}

// Assume average video duration of 5 minutes for scheduling
const ASSUMED_DURATION_SECONDS = 300;

function calculateCurrentVideo(videos: Video[]) {
  if (!videos.length) return { video: null, startSeconds: 0, index: 0 };
  
  const totalDuration = videos.length * ASSUMED_DURATION_SECONDS;
  const now = Date.now() / 1000; // Current time in seconds
  const positionInLoop = now % totalDuration;
  
  const videoIndex = Math.floor(positionInLoop / ASSUMED_DURATION_SECONDS);
  const startSeconds = Math.floor(positionInLoop % ASSUMED_DURATION_SECONDS);
  
  return {
    video: videos[videoIndex],
    startSeconds,
    index: videoIndex,
  };
}

export function LiveTVChannel({ videos, playlists, playlistNames }: LiveTVChannelProps) {
  const [currentChannel, setCurrentChannel] = useState<string | null>(
    playlistNames[0] || null
  );
  const [isLive, setIsLive] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const channelVideos = currentChannel ? playlists[currentChannel] || [] : videos;
  
  const { video, startSeconds, index } = useMemo(
    () => calculateCurrentVideo(channelVideos),
    [channelVideos]
  );
  
  const nextVideo = channelVideos[(index + 1) % channelVideos.length];
  
  // Generate YouTube embed URL with start time
  const embedUrl = video
    ? `https://www.youtube.com/embed/${video.video_id}?autoplay=1&start=${startSeconds}&rel=0&modestbranding=1`
    : null;

  const handleChannelChange = (direction: "prev" | "next") => {
    const currentIndex = playlistNames.indexOf(currentChannel || "");
    let newIndex: number;
    
    if (direction === "next") {
      newIndex = (currentIndex + 1) % playlistNames.length;
    } else {
      newIndex = currentIndex <= 0 ? playlistNames.length - 1 : currentIndex - 1;
    }
    
    setCurrentChannel(playlistNames[newIndex]);
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border">
      {/* TV Screen */}
      <div className="relative aspect-video bg-black">
        {embedUrl ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={video?.title || "Live TV"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Tv className="w-16 h-16 opacity-50" />
          </div>
        )}
        
        {/* Live indicator */}
        {isLive && video && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-medium text-white">LIVE</span>
          </div>
        )}
      </div>
      
      {/* Info Bar */}
      <div className="p-4 space-y-3">
        {/* Now Playing */}
        {video && (
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Radio className="w-3 h-3" />
              NOW PLAYING
            </div>
            <h3 className="font-medium text-foreground line-clamp-1">
              {video.title || "Untitled"}
            </h3>
          </div>
        )}
        
        {/* Up Next */}
        {nextVideo && nextVideo.video_id !== video?.video_id && (
          <div className="text-sm text-muted-foreground">
            <span className="text-xs">UP NEXT: </span>
            <span className="line-clamp-1">{nextVideo.title || "Untitled"}</span>
          </div>
        )}
        
        {/* Channel Selector */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleChannelChange("prev")}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 text-center">
            <div className="text-xs text-muted-foreground">CHANNEL</div>
            <div className="font-medium text-sm truncate px-2">
              {currentChannel || "All Videos"}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleChannelChange("next")}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Channel Quick Select */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {playlistNames.map((name, i) => (
            <Button
              key={name}
              variant={currentChannel === name ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs whitespace-nowrap flex-shrink-0"
              onClick={() => setCurrentChannel(name)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
