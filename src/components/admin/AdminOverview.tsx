
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  DollarSign, 
  BarChart3,
  Gift
} from "lucide-react";

interface AdminOverviewProps {
  totalCount: number;
  activeDonorsCount: number;
  totalRaised: number;
  onSectionChange: (section: string) => void;
}

const AdminOverview = ({ 
  totalCount, 
  activeDonorsCount, 
  totalRaised, 
  onSectionChange 
}: AdminOverviewProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">All registered donors</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDonorsCount?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Donors with pledges</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRaised?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCount && activeDonorsCount 
                ? ((activeDonorsCount / totalCount) * 100).toFixed(1) + '%'
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">Active vs total donors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest donor activities and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Activity feed coming soon...
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onSectionChange("donors")}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Donors
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onSectionChange("pledges")}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              View Pledges
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onSectionChange("rewards")}
            >
              <Gift className="h-4 w-4 mr-2" />
              Manage Rewards
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
