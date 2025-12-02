import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Film, Clapperboard, Users, Rocket, MessageCircle, X } from "lucide-react";

interface VideoFilterBarProps {
  // Available options
  playlists: string[];
  contentTypes: string[];
  subjects: string[];
  channels: string[];
  // Selected filters
  selectedPlaylist: string | null;
  selectedContentType: string | null;
  selectedSubject: string | null;
  selectedChannel: string | null;
  // Counts
  totalVideos: number;
  filteredCount: number;
  // Callbacks
  onPlaylistChange: (playlist: string | null) => void;
  onContentTypeChange: (type: string | null) => void;
  onSubjectChange: (subject: string | null) => void;
  onChannelChange: (channel: string | null) => void;
  onClearAll: () => void;
}

const CONTENT_TYPE_ICONS: Record<string, typeof Film> = {
  'Episode': Film,
  'Behind the Scenes': Clapperboard,
  'Interview': Users,
  'Q&A / Live Stream': MessageCircle,
  'Trailer': Rocket,
};

export function VideoFilterBar({
  playlists,
  contentTypes,
  subjects,
  channels,
  selectedPlaylist,
  selectedContentType,
  selectedSubject,
  selectedChannel,
  totalVideos,
  filteredCount,
  onPlaylistChange,
  onContentTypeChange,
  onSubjectChange,
  onChannelChange,
  onClearAll,
}: VideoFilterBarProps) {
  const hasActiveFilters = selectedPlaylist || selectedContentType || selectedSubject || selectedChannel;
  
  return (
    <div className="space-y-4">
      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedPlaylist && (
            <Badge variant="secondary" className="gap-1">
              Playlist: {selectedPlaylist}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onPlaylistChange(null)} />
            </Badge>
          )}
          {selectedContentType && (
            <Badge variant="secondary" className="gap-1">
              Type: {selectedContentType}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onContentTypeChange(null)} />
            </Badge>
          )}
          {selectedSubject && (
            <Badge variant="secondary" className="gap-1">
              Subject: {selectedSubject}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onSubjectChange(null)} />
            </Badge>
          )}
          {selectedChannel && (
            <Badge variant="secondary" className="gap-1">
              Channel: {selectedChannel}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onChannelChange(null)} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs">
            Clear all
          </Button>
          <span className="text-sm text-muted-foreground ml-2">
            Showing {filteredCount} of {totalVideos}
          </span>
        </div>
      )}

      {/* Source Channel Filter */}
      {channels.length > 1 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-foreground">Source Channel</span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedChannel === null ? "default" : "outline"}
              size="sm"
              onClick={() => onChannelChange(null)}
            >
              All Channels
            </Button>
            {channels.map((channel) => (
              <Button
                key={channel}
                variant={selectedChannel === channel ? "default" : "outline"}
                size="sm"
                onClick={() => onChannelChange(channel)}
              >
                {channel}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Content Type Filter */}
      {contentTypes.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-foreground">Content Type</span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedContentType === null ? "default" : "outline"}
              size="sm"
              onClick={() => onContentTypeChange(null)}
            >
              All Types
            </Button>
            {contentTypes.map((type) => {
              const Icon = CONTENT_TYPE_ICONS[type];
              return (
                <Button
                  key={type}
                  variant={selectedContentType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => onContentTypeChange(type)}
                  className="gap-1"
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {type}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Subject Matter Filter */}
      {subjects.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-foreground">Subject</span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSubject === null ? "default" : "outline"}
              size="sm"
              onClick={() => onSubjectChange(null)}
            >
              All Subjects
            </Button>
            {subjects.map((subject) => (
              <Button
                key={subject}
                variant={selectedSubject === subject ? "default" : "outline"}
                size="sm"
                onClick={() => onSubjectChange(subject)}
              >
                {subject}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Playlist Filter */}
      {playlists.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-foreground">Playlist</span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedPlaylist === null ? "default" : "outline"}
              size="sm"
              onClick={() => onPlaylistChange(null)}
            >
              All Playlists
            </Button>
            {playlists.map((playlist) => (
              <Button
                key={playlist}
                variant={selectedPlaylist === playlist ? "default" : "outline"}
                size="sm"
                onClick={() => onPlaylistChange(playlist)}
              >
                {playlist}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
