
import { 
  Users, 
  Gift, 
  Settings, 
  BarChart3, 
  UserCog,
  Home,
  MessageCircle,
  FolderOpen,
  Activity,
} from "lucide-react";

export const sidebarItems = [
  { id: "overview", label: "Dashboard", icon: Home },
  { id: "donor-management", label: "Donor Management", icon: Users },
  { id: "campaigns", label: "Campaigns", icon: BarChart3 },
  { id: "rewards", label: "Rewards & Benefits", icon: Gift },
  { id: "analytics", label: "Visitor Analytics", icon: Activity },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "media-files", label: "Media & Files", icon: FolderOpen },
  { id: "admins", label: "Admin Users", icon: UserCog },
  { id: "settings", label: "Settings", icon: Settings },
];
