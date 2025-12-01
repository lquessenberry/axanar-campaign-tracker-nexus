/**
 * LCARS Identity Panel
 * Rectangular avatar (4:5 ratio) + name + rank + total contributed + action buttons
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { OkudagramNumber } from "@/components/profile/OkudagramNumber";
import { MissionPatch } from "./MissionPatch";
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
  primaryTitleIcon?: string | null;
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
  primaryTitleIcon,
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
  onToggleCollapse
}: IdentityPanelProps) {
  return <div className="bg-black border-2 border-[#FFCC33] p-6">
      {/* Main Content - Two Rows stacked */}
      <div className="flex flex-col gap-6 mb-6">
        {/* Top Row: Avatar + Name + Rank on left, Mission Patch + Stats on right */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          {/* Left: Avatar + Name + Rank */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="h-28 w-24 border-2 border-[#33CCFF] bg-black">
                {avatarUrl ? <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#33CCFF]">
                    {fullName.split(' ').map(n => n[0]).join('')}
                  </div>}
              </div>
              {onAvatarClick && !isEditing && <Button size="sm" onClick={onAvatarClick} disabled={isUploading} className="absolute -bottom-1 -right-1 h-6 w-6 p-0 bg-[#33CCFF] hover:bg-[#00CCFF] text-black border border-[#33CCFF]">
                  <Camera className="h-3 w-3" />
                </Button>}
            </div>
            
            {/* Name & Username & Rank */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-wider text-white uppercase leading-tight" style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.1em'
              }}>
                {fullName}
              </h1>
              {username && <p className="text-[#FFCC33] text-sm">@{username}</p>}
              {rankTitle && <div className="flex items-center gap-2 mt-1">
                  {rankIcon}
                  <Badge className="bg-[#1a1a1a] text-[#FFCC33] border border-[#FFCC33] rounded-none px-2 py-0.5 uppercase text-xs font-bold tracking-wider">
                    {rankTitle}
                  </Badge>
                </div>}
            </div>
          </div>

          {/* Right: Mission Patch + Stats */}
          <div className="flex items-center gap-6">
            {/* Mission Patch */}
            <MissionPatch donorName={fullName} donorSince="2014" scale={0.4} badgeIcon={primaryTitleIcon} />
            
            {/* Total Contributed */}
            <div className="text-right">
              <p className="text-[#FFCC33] text-xs uppercase tracking-widest font-bold mb-1">TOTAL CONTRIBUTED</p>
              <p className="text-[#33CCFF] text-4xl lg:text-5xl font-bold tracking-wider" style={{
                fontFamily: 'monospace'
              }}>
                ${totalContributed.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Bottom */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-[#FFCC33]/30">
        {isEditing ? <>
            <Button onClick={onSave} disabled={isLoading} className="bg-[#FFCC33] hover:bg-[#FFD700] text-black font-bold uppercase tracking-wider border-2 border-[#FFCC33]">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button onClick={onCancel} className="bg-black hover:bg-[#1a1a1a] text-white font-bold uppercase tracking-wider border-2 border-[#FFCC33]">
              Cancel
            </Button>
          </> : <>
            <Button onClick={onEdit} className="bg-black hover:bg-[#1a1a1a] text-[#FFCC33] font-bold uppercase tracking-wider border-2 border-[#FFCC33]">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-black hover:bg-[#1a1a1a] text-[#33CCFF] font-bold uppercase tracking-wider border-2 border-[#33CCFF]" disabled={isUploading || isUploadingBackground}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-black border-2 border-[#FFCC33]">
                {onBackgroundClick && <DropdownMenuItem onClick={onBackgroundClick} className="text-white hover:bg-[#1a1a1a] focus:bg-[#1a1a1a]">
                    <Image className="mr-2 h-4 w-4" />
                    <span>{backgroundUrl ? 'Change Background' : 'Add Background'}</span>
                  </DropdownMenuItem>}
                {backgroundUrl && onRemoveBackground && <DropdownMenuItem onClick={onRemoveBackground} className="text-white hover:bg-[#1a1a1a] focus:bg-[#1a1a1a]">
                    <X className="mr-2 h-4 w-4" />
                    <span>Remove Background</span>
                  </DropdownMenuItem>}
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
                {onToggleCollapse && <>
                    <DropdownMenuSeparator className="bg-[#FFCC33]" />
                    <DropdownMenuItem onClick={onToggleCollapse} className="text-white hover:bg-[#1a1a1a] focus:bg-[#1a1a1a]">
                      <ChevronDown className="h-4 w-4 mr-2" />
                      <span>Collapse Header</span>
                    </DropdownMenuItem>
                  </>}
              </DropdownMenuContent>
            </DropdownMenu>
          </>}
      </div>
    </div>;
}