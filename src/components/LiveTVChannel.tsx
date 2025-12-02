import { useState, useMemo, useRef } from "react";
import { Tv, Radio, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        
        <div className="flex">
          {/* Left: Screen */}
          <div className="flex-1 p-3">
            {/* Inner screen frame */}
            <div className="relative rounded-lg overflow-hidden bg-black ring-1 ring-zinc-700 shadow-inner">
              {/* Vignette */}
              <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_80px_rgba(0,0,0,0.7)]" />
              
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
                      <Tv className="w-16 h-16 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No Signal</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* On-screen display */}
              <div className="absolute top-3 left-3 z-20 pointer-events-none">
                <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  <span className="text-xs font-bold text-white tracking-wider">LIVE</span>
                </div>
              </div>
            </div>
            
            {/* Now Playing bar */}
            <div className="mt-3 flex items-center gap-3">
              {video && (
                <div className="w-16 h-9 rounded overflow-hidden flex-shrink-0 bg-zinc-800">
                  <img 
                    src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                  <Radio className="w-2.5 h-2.5" />
                  NOW PLAYING
                </div>
                <h3 className="font-medium text-white line-clamp-1 text-xs">
                  {video?.title || "No video"}
                </h3>
              </div>
            </div>
          </div>
          
          {/* Right: Channel List */}
          <div className="w-48 border-l border-zinc-800 bg-zinc-900/50 flex flex-col">
            {/* Channel header */}
            <div className="p-3 border-b border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Channels</div>
              <div className="text-lg font-bold text-white tabular-nums">
                CH {currentChannelIndex.toString().padStart(2, '0')}
              </div>
            </div>
            
            {/* Channel nav */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleChannelChange("prev")}
              className="h-8 rounded-none bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            
            {/* Channel list */}
            <ScrollArea className="flex-1">
              <div className="p-1.5 space-y-1">
                {playlistNames.map((name, i) => (
                  <button
                    key={name}
                    onClick={() => setCurrentChannel(name)}
                    className={`
                      w-full px-2 py-2 rounded text-left transition-all flex items-center gap-2
                      ${currentChannel === name 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }
                    `}
                  >
                    <span className={`
                      w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${currentChannel === name ? 'bg-white/20' : 'bg-zinc-700'}
                    `}>
                      {i + 1}
                    </span>
                    <span className="text-xs truncate">{name}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
            
            {/* Channel nav */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleChannelChange("next")}
              className="h-8 rounded-none bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            
            {/* Up next */}
            {nextVideo && nextVideo.video_id !== video?.video_id && (
              <div className="p-3 border-t border-zinc-800 bg-zinc-900">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Up Next</div>
                <p className="text-xs text-zinc-300 line-clamp-2">{nextVideo.title}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* TV base accent */}
        <div className="h-1 bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
      </div>
      
      {/* Ambient glow */}
      <div className="absolute -inset-4 -z-10 bg-primary/5 blur-3xl rounded-full opacity-50" />
    </div>
  );
}
