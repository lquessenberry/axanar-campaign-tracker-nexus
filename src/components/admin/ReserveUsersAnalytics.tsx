import { useMemo } from "react";
import { useReserveUsers, ReserveUser } from "@/hooks/useReserveUsers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Database, 
  Globe, 
  Mail, 
  TrendingUp,
  Users,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
  'hsl(220, 70%, 50%)',
  'hsl(280, 70%, 50%)',
  'hsl(340, 70%, 50%)',
  'hsl(40, 70%, 50%)',
];

interface AnalyticsGroup {
  name: string;
  count: number;
  percentage: number;
}

const ReserveUsersAnalytics = () => {
  // Fetch all reserve users for analytics (no pagination)
  const { data, isLoading, error } = useReserveUsers({
    limit: 10000 // Get all users for analytics
  });

  const users = data?.data || [];
  const totalUsers = users.length;

  const analytics = useMemo(() => {
    if (!users.length) return null;

    // Group by platform
    const platformGroups = users.reduce((acc: Record<string, number>, user: ReserveUser) => {
      const platform = user.sourcePlatform || 'Unknown';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {});

    // Group by source
    const sourceGroups = users.reduce((acc: Record<string, number>, user: ReserveUser) => {
      const source = user.sourceName || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    // Group by email status
    const statusGroups = users.reduce((acc: Record<string, number>, user: ReserveUser) => {
      const status = user.emailStatus || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Convert to analytics format
    const platformAnalytics: AnalyticsGroup[] = Object.entries(platformGroups)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalUsers) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    const sourceAnalytics: AnalyticsGroup[] = Object.entries(sourceGroups)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalUsers) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    const statusAnalytics: AnalyticsGroup[] = Object.entries(statusGroups)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalUsers) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    return {
      platforms: platformAnalytics,
      sources: sourceAnalytics,
      statuses: statusAnalytics
    };
  }, [users, totalUsers]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Failed to load analytics data</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  const MetricsList = ({ data, icon: Icon, title }: { 
    data: AnalyticsGroup[], 
    icon: any, 
    title: string 
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 5).map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium truncate max-w-[120px]" title={item.name}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {item.count}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
          {data.length > 5 && (
            <p className="text-xs text-muted-foreground">
              +{data.length - 5} more items
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const BarChartComponent = ({ data, title }: { data: AnalyticsGroup[], title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-4 w-4" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>Distribution breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis fontSize={12} />
            <Tooltip 
              formatter={(value, name) => [value, 'Count']}
              labelFormatter={(label) => `${label}`}
            />
            <Bar 
              dataKey="count" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const PieChartComponent = ({ data, title }: { data: AnalyticsGroup[], title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChartIcon className="h-4 w-4" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>Percentage distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.slice(0, 8)}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.slice(0, 8).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, 'Count']} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Reserve Users Analytics</h2>
          <p className="text-muted-foreground mt-2">
            Detailed breakdown and insights into reserve user data
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Reserve users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platforms</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.platforms.length}</div>
            <p className="text-xs text-muted-foreground">Unique platforms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.sources.length}</div>
            <p className="text-xs text-muted-foreground">Unique sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Statuses</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.statuses.length}</div>
            <p className="text-xs text-muted-foreground">Different statuses</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="statuses">Email Status</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricsList data={analytics.platforms} icon={Globe} title="Platform Breakdown" />
            <div className="md:col-span-2">
              <BarChartComponent data={analytics.platforms} title="Users by Platform" />
            </div>
          </div>
          <PieChartComponent data={analytics.platforms} title="Platform Distribution" />
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricsList data={analytics.sources} icon={Database} title="Source Breakdown" />
            <div className="md:col-span-2">
              <BarChartComponent data={analytics.sources} title="Users by Source" />
            </div>
          </div>
          <PieChartComponent data={analytics.sources} title="Source Distribution" />
        </TabsContent>

        <TabsContent value="statuses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricsList data={analytics.statuses} icon={Mail} title="Status Breakdown" />
            <div className="md:col-span-2">
              <BarChartComponent data={analytics.statuses} title="Users by Email Status" />
            </div>
          </div>
          <PieChartComponent data={analytics.statuses} title="Status Distribution" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReserveUsersAnalytics;