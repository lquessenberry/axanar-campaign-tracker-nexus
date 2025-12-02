import { useState, useMemo, useRef } from "react";
import { Tv, Radio, ChevronLeft, ChevronRight, Volume2, Maximize2 } from "lucide-react";
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
  const now = Date.now() / 1000;
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const channelVideos = currentChannel ? playlists[currentChannel] || [] : videos;
  const currentChannelIndex = playlistNames.indexOf(currentChannel || "") + 1;
  
  const { video, startSeconds, index } = useMemo(
    () => calculateCurrentVideo(channelVideos),
    [channelVideos]
  );
  
  const nextVideo = channelVideos[(index + 1) % channelVideos.length];
  
  const embedUrl = video
    ? `https://www.youtube.com/embed/${video.video_id}?autoplay=1&start=${startSeconds}&rel=0&modestbranding=1`
    : null;

  const handleChannelChange = (direction: "prev" | "next") => {
    const currentIdx = playlistNames.indexOf(currentChannel || "");
    let newIndex: number;
    
    if (direction === "next") {
      newIndex = (currentIdx + 1) % playlistNames.length;
    } else {
      newIndex = currentIdx <= 0 ? playlistNames.length - 1 : currentIdx - 1;
    }
    
    setCurrentChannel(playlistNames[newIndex]);
  };

  return (
    <div className="relative">
      {/* TV Unit */}
      <div className="bg-gradient-to-b from-zinc-900 to-black rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-zinc-800">
        
        {/* Screen bezel */}
        <div className="p-3 pb-0">
          {/* Inner screen frame with glow */}
          <div className="relative rounded-lg overflow-hidden bg-black ring-1 ring-zinc-700 shadow-inner">
            {/* Vignette overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
            
            {/* Scan line effect (subtle) */}
            <div 
              className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.5) 1px, rgba(0,0,0,0.5) 2px)',
              }}
            />
            
            {/* Video */}
            <div className="aspect-video">
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
                <div className="flex items-center justify-center h-full bg-zinc-950 text-zinc-600">
                  <div className="text-center">
                    <Tv className="w-20 h-20 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">No Signal</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* On-screen display overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none z-20">
              <div className="flex items-start justify-between">
                {/* Live badge */}
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  <span className="text-xs font-bold text-white tracking-wider">LIVE</span>
                </div>
                
                {/* Channel number */}
                <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded text-right">
                  <div className="text-2xl font-bold text-white tabular-nums">
                    CH {currentChannelIndex.toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Control panel */}
        <div className="p-4 space-y-4">
          {/* Now Playing info */}
          <div className="flex items-start gap-4">
            {/* Thumbnail */}
            {video && (
              <div className="w-24 h-14 rounded overflow-hidden flex-shrink-0 bg-zinc-800">
                <img 
                  src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mb-1">
                <Radio className="w-3 h-3" />
                NOW PLAYING
              </div>
              <h3 className="font-medium text-white line-clamp-1 text-sm">
                {video?.title || "No video"}
              </h3>
              {nextVideo && nextVideo.video_id !== video?.video_id && (
                <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                  Up next: {nextVideo.title}
                </p>
              )}
            </div>
          </div>
          
          {/* Channel selector */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleChannelChange("prev")}
              className="h-10 w-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 bg-zinc-800/50 rounded-lg px-4 py-2">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Channel</div>
              <div className="text-sm font-medium text-white truncate">
                {currentChannel || "All Videos"}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleChannelChange("next")}
              className="h-10 w-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Channel grid */}
          <div className="grid grid-cols-6 gap-1.5">
            {playlistNames.map((name, i) => (
              <button
                key={name}
                onClick={() => setCurrentChannel(name)}
                className={`
                  h-10 rounded-md text-sm font-bold transition-all
                  ${currentChannel === name 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                  }
                `}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        
        {/* TV base/stand accent */}
        <div className="h-1 bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
      </div>
      
      {/* TV glow effect */}
      <div className="absolute -inset-4 -z-10 bg-primary/5 blur-3xl rounded-full opacity-50" />
    </div>
  );
}
