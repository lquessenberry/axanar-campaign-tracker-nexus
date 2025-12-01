/**
 * LCARS Identity Panel
 * Rectangular avatar (4:5 ratio) + name + rank + total contributed + action buttons
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { OkudagramNumber } from "@/components/profile/OkudagramNumber";
import { Edit, Settings, Image, X, Copy, Link2, ChevronDown, Camera } from "lucide-react";
import { toast } from "sonner";

interface IdentityPanelProps {
  avatarUrl?: string | null;
  fullName: string;
  username?: string | null;
  rankTitle?: string;
  rankIcon?: React.ReactNode;
  totalContributed: number;
  profileId?: string;
  backgroundUrl?: string | null;
  isEditing?: boolean;
  isLoading?: boolean;
  isUploading?: boolean;
  isUploadingBackground?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onAvatarClick?: () => void;
  onBackgroundClick?: () => void;
  onRemoveBackground?: () => void;
  onToggleCollapse?: () => void;
}

export function IdentityPanel({
  avatarUrl,
  fullName,
  username,
  rankTitle,
  rankIcon,
  totalContributed,
  profileId,
  backgroundUrl,
  isEditing = false,
  isLoading = false,
  isUploading = false,
  isUploadingBackground = false,
  onEdit,
  onSave,
  onCancel,
  onAvatarClick,
  onBackgroundClick,
  onRemoveBackground,
  onToggleCollapse,
}: IdentityPanelProps) {
  return (
    <div className="bg-black border-2 border-[#FFCC33] p-6">
      <div className="flex gap-6 items-start flex-wrap lg:flex-nowrap">
        {/* Avatar - 4:5 ratio, sharp corners */}
        <div className="flex-shrink-0 relative">
          <div className="h-40 w-32 border-2 border-[#FFCC33] bg-black">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#FFCC33]">
                {fullName.split(' ').map(n => n[0]).join('')}
              </div>
            )}
          </div>
          {onAvatarClick && !isEditing && (
            <Button
              size="sm"
              onClick={onAvatarClick}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 h-8 w-8 p-0 bg-[#FFCC33] hover:bg-[#FFD700] text-black border-2 border-[#FFCC33]"
            >
              <Camera className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Identity Info */}
        <div className="flex-1 space-y-3 min-w-0">
          <div>
            <h1 className="text-3xl font-bold tracking-wider text-white uppercase" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.1em' }}>
              {fullName}
            </h1>
            {username && (
              <p className="text-[#FFCC33] text-sm mt-1">@{username}</p>
            )}
          </div>

          {/* Rank Badge */}
          {rankTitle && (
            <div className="flex items-center gap-2">
              {rankIcon}
              <Badge className="bg-[#1a1a1a] text-[#FFCC33] border-2 border-[#FFCC33] rounded-none px-3 py-1 uppercase text-xs font-bold tracking-wider">
                {rankTitle}
              </Badge>
            </div>
          )}

          {/* Total Contributed - Okudagram Style */}
          <div className="pt-2">
            <div className="space-y-1">
              <p className="text-[#FFCC33] text-xs uppercase tracking-wider font-bold">TOTAL CONTRIBUTED</p>
              <p className="text-[#33CCFF] text-5xl font-bold tracking-wider" style={{ fontFamily: 'monospace' }}>
                ${totalContributed.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap lg:flex-nowrap w-full lg:w-auto">
          {isEditing ? (
            <>
              <Button
                onClick={onSave}
                disabled={isLoading}
                className="bg-[#FFCC33] hover:bg-[#FFD700] text-black font-bold uppercase tracking-wider border-2 border-[#FFCC33] flex-1 lg:flex-initial"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={onCancel}
                className="bg-black hover:bg-[#1a1a1a] text-white font-bold uppercase tracking-wider border-2 border-[#FFCC33] flex-1 lg:flex-initial"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onEdit}
                className="bg-black hover:bg-[#1a1a1a] text-[#FFCC33] font-bold uppercase tracking-wider border-2 border-[#FFCC33] flex-1 lg:flex-initial"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="bg-black hover:bg-[#1a1a1a] text-[#33CCFF] font-bold uppercase tracking-wider border-2 border-[#33CCFF] flex-1 lg:flex-initial"
                    disabled={isUploading || isUploadingBackground}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black border-2 border-[#FFCC33]">
                  {onBackgroundClick && (
                    <DropdownMenuItem onClick={onBackgroundClick} className="text-white hover:bg-[#1a1a1a] focus:bg-[#1a1a1a]">
                      <Image className="mr-2 h-4 w-4" />
                      <span>{backgroundUrl ? 'Change Background' : 'Add Background'}</span>
                    </DropdownMenuItem>
                  )}
                  {backgroundUrl && onRemoveBackground && (
                    <DropdownMenuItem onClick={onRemoveBackground} className="text-white hover:bg-[#1a1a1a] focus:bg-[#1a1a1a]">
                      <X className="mr-2 h-4 w-4" />
                      <span>Remove Background</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-[#FFCC33]" />
                  <DropdownMenuItem onClick={() => {
                    const url = `${window.location.origin}/u/${username || profileId}`;
                    navigator.clipboard.writeText(url);
                    toast.success('Profile link copied to clipboard!');
                  }} className="text-white hover:bg-[#1a1a1a] focus:bg-[#1a1a1a]">
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Copy Profile Link</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    window.open(`/u/${username || profileId}`, '_blank');
                  }} className="text-white hover:bg-[#1a1a1a] focus:bg-[#1a1a1a]">
                    <Link2 className="mr-2 h-4 w-4" />
                    <span>View Public Profile</span>
                  </DropdownMenuItem>
                  {onToggleCollapse && (
                    <>
                      <DropdownMenuSeparator className="bg-[#FFCC33]" />
                      <DropdownMenuItem onClick={onToggleCollapse} className="text-white hover:bg-[#1a1a1a] focus:bg-[#1a1a1a]">
                        <ChevronDown className="h-4 w-4 mr-2" />
                        <span>Collapse Header</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
