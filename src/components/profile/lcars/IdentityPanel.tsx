/**
 * LCARS Identity Panel
 * Rectangular avatar (4:5 ratio) + name + rank + total contributed
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OkudagramNumber } from "@/components/profile/OkudagramNumber";

interface IdentityPanelProps {
  avatarUrl?: string | null;
  fullName: string;
  username?: string | null;
  rankTitle?: string;
  rankIcon?: React.ReactNode;
  totalContributed: number;
}

export function IdentityPanel({
  avatarUrl,
  fullName,
  username,
  rankTitle,
  rankIcon,
  totalContributed,
}: IdentityPanelProps) {
  return (
    <div className="bg-card border border-border p-6">
      <div className="flex gap-6 items-start">
        {/* Avatar - 4:5 ratio, sharp corners */}
        <div className="flex-shrink-0">
          <Avatar className="h-40 w-32 rounded-none">
            <AvatarImage src={avatarUrl || undefined} alt={fullName} />
            <AvatarFallback className="rounded-none bg-muted text-2xl font-bold">
              {fullName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Identity Info */}
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
              {fullName}
            </h1>
            {username && (
              <p className="text-muted-foreground text-sm mt-1">@{username}</p>
            )}
          </div>

          {/* Rank Badge */}
          {rankTitle && (
            <div className="flex items-center gap-2">
              {rankIcon}
              <Badge variant="secondary" className="rounded-none px-3 py-1 uppercase text-xs font-bold tracking-wider">
                {rankTitle}
              </Badge>
            </div>
          )}

          {/* Total Contributed - Okudagram Style */}
          <div className="pt-2">
            <OkudagramNumber
              value={totalContributed}
              label="TOTAL CONTRIBUTED"
              prefix="$"
              animate={false}
              className="text-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
