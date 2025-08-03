
import { 
  Users, 
  Gift, 
  DollarSign, 
  Settings, 
  BarChart3, 
  UserCog,
  Home,
  Bell,
  FileText,
  MessageCircle,
} from "lucide-react";

export const sidebarItems = [
  { id: "overview", label: "Dashboard", icon: Home },
  { id: "donors", label: "Donors", icon: Users },
  { id: "pledges", label: "Pledges", icon: DollarSign },
  { id: "rewards", label: "Rewards", icon: Gift },
  { id: "campaigns", label: "Campaigns", icon: BarChart3 },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "admins", label: "Admin Users", icon: UserCog },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];
