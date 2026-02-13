import { LCARSNavFrame } from "@/components/ui/lcars-nav-frame";
import { LCARSNavSlab } from "@/components/ui/lcars-nav-slab";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { Home, MessageCircle, User } from "lucide-react";

interface UnifiedBottomNavProps {
  profile?: any;
}

export function UnifiedBottomNav({ profile }: UnifiedBottomNavProps) {
  const { user } = useAuth();
  const { getUnreadCount } = useRealtimeMessages();

  if (!user) return null;

  const unreadCount = getUnreadCount();

  const primaryNavItems = [
    { label: "Dashboard", to: "/dashboard", icon: Home },
    {
      label: "Direct Messages",
      to: "/direct-messages",
      icon: MessageCircle,
      badge: unreadCount,
    },
    { label: "Forum", to: "/forum", icon: MessageCircle },
    { label: "Profile", to: "/profile", icon: User },
  ];

  return (
    <LCARSNavFrame
      position="top"
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-md border-t border-border/50 lg:hidden safe-area-bottom"
    >
      <nav className="flex items-center h-16 px-0">
        <div className="flex-1 flex items-center justify-around gap-0.5">
          {primaryNavItems.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === primaryNavItems.length - 1;
            const borderRadiusClass = isFirst
              ? "rounded-l-lg rounded-r-none"
              : isLast
                ? "rounded-r-lg rounded-l-none"
                : "rounded-none";

            return (
              <LCARSNavSlab
                key={item.to}
                to={item.to}
                icon={item.icon}
                variant="secondary"
                showLabel="hover"
                badge={item.badge}
                className={`${borderRadiusClass} flex-1 h-14`}
                aria-label={item.label}
              >
                {item.label}
              </LCARSNavSlab>
            );
          })}
        </div>
      </nav>
    </LCARSNavFrame>
  );
}
