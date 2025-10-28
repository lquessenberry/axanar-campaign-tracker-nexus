import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, UserPlus, DollarSign, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart } from "recharts";

const VisitorAnalytics = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["visitor-analytics"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await supabase.functions.invoke("visitor-analytics", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds for "real-time"
  });

  if (isLoading) {
    return (
      <AdminLayout title="Visitor Analytics" description="Real-time visitor statistics">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Visitor Analytics" description="Real-time visitor statistics">
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Error loading analytics: {error.message}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Visitor Analytics" description="Real-time visitor statistics">
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users (30d)</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.summary?.totalRequests30d || 0}</div>
              <p className="text-xs text-muted-foreground">User activity events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.summary?.uniqueVisitors30d || 0}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently Online</CardTitle>
              <Eye className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{data?.summary?.currentlyOnline || 0}</div>
              <p className="text-xs text-muted-foreground">Active right now</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Users (30d)</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.summary?.newUsers30d || 0}</div>
              <p className="text-xs text-muted-foreground">New signups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Pledges (30d)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.summary?.recentPledges30d || 0}</div>
              <p className="text-xs text-muted-foreground">Pledge activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity (Last 30 Days)</CardTitle>
            <CardDescription>Active users by day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.dailyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [`${value} users`, 'Active Users']}
                />
                <Line type="monotone" dataKey="activeUsers" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Signups Chart */}
        {data?.dailySignups && data.dailySignups.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>New User Signups (Last 30 Days)</CardTitle>
              <CardDescription>Daily registration activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.dailySignups}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Bar dataKey="signups" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Pledge Activity */}
        {data?.pledgeActivity && data.pledgeActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pledge Activity (Last 30 Days)</CardTitle>
              <CardDescription>Pledge count and total amount</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={data.pledgeActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Bar yAxisId="left" dataKey="count" fill="hsl(var(--primary))" name="Pledges" />
                  <Line yAxisId="right" type="monotone" dataKey="totalAmount" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Amount ($)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Presence Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle>User Presence Snapshot</CardTitle>
            <CardDescription>Current system activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold text-green-600">{data?.presenceSnapshot?.currentlyOnline || 0}</div>
                <div className="text-xs text-muted-foreground">Currently Online</div>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold">{data?.presenceSnapshot?.last30d || 0}</div>
                <div className="text-xs text-muted-foreground">Active (30d)</div>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold">{data?.presenceSnapshot?.uniqueUsers || 0}</div>
                <div className="text-xs text-muted-foreground">Unique Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default VisitorAnalytics;
