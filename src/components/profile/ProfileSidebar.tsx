
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Heart, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface User {
  email: string;
}

interface ProfileSidebarProps {
  user: User;
  memberSince: string;
  onSignOut: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  user,
  memberSince,
  onSignOut,
}) => {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Account Created</span>
              <span className="text-sm font-medium">{memberSince}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium truncate">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Profile Views</span>
              <span className="text-sm font-medium">-</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/dashboard">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full justify-start">
                <Heart className="h-4 w-4 mr-2" />
                Explore Campaigns
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onSignOut}
            >
              <Settings className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSidebar;
