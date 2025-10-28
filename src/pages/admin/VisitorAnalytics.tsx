import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, MousePointerClick, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

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
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests (24h)</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.summary?.totalRequests24h || 0}</div>
              <p className="text-xs text-muted-foreground">Edge function requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors (24h)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.summary?.uniqueVisitors24h || 0}</div>
              <p className="text-xs text-muted-foreground">Based on IP addresses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Auth Events (24h)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.summary?.authEvents24h || 0}</div>
              <p className="text-xs text-muted-foreground">Login/signup activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Activity (Last 24h)</CardTitle>
            <CardDescription>Request volume by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.hourlyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString('en-US', { hour: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Line type="monotone" dataKey="requests" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Paths */}
        <Card>
          <CardHeader>
            <CardTitle>Top Paths</CardTitle>
            <CardDescription>Most visited endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.topPaths || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="path" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Auth Events Breakdown */}
        {data?.authEventBreakdown && data.authEventBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Authentication Events</CardTitle>
              <CardDescription>Login and signup activity breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.authEventBreakdown.map((item: any) => (
                  <div key={item.event} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">{item.event}</span>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default VisitorAnalytics;
