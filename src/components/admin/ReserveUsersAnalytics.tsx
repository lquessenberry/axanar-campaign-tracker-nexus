import { useMemo } from "react";
import { useReserveUserAnalytics, ReserveUserAnalyticsData } from "@/hooks/useReserveUserAnalytics";
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
  PieChart as PieChartIcon,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
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
  // Fetch analytics data from the dedicated edge function
  const { data: analytics, isLoading, error } = useReserveUserAnalytics();

  const chartData = useMemo(() => {
    if (!analytics) return null;

    // Transform data for charts
    const platformChartData = analytics.platformBreakdown.map(item => ({
      name: item.platform,
      count: item.count,
      percentage: item.percentage
    }));

    const sourceChartData = analytics.sourceBreakdown.map(item => ({
      name: item.source,
      count: item.count,
      percentage: item.percentage
    }));

    const statusChartData = analytics.statusBreakdown.map(item => ({
      name: item.status,
      count: item.count,
      percentage: item.percentage
    }));

    return {
      platforms: platformChartData,
      sources: sourceChartData,
      statuses: statusChartData
    };
  }, [analytics]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Failed to load analytics data: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !analytics || !chartData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Loading comprehensive analytics...</p>
        </CardContent>
      </Card>
    );
  }

  const MetricsList = ({ data, icon: Icon, title, showUsers = false }: { 
    data: any[], 
    icon: any, 
    title: string,
    showUsers?: boolean
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 5).map((item, index) => (
            <div key={item.platform || item.source || item.status} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium truncate max-w-[120px]" title={item.platform || item.source || item.status}>
                  {item.platform || item.source || item.status}
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
              {showUsers && item.users && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Sample: {item.users.slice(0, 3).map((u: any) => u.email).join(', ')}
                  {item.users.length > 3 && ` +${item.users.length - 3} more`}
                </div>
              )}
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

  const BarChartComponent = ({ data, title }: { data: any[], title: string }) => (
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

  const PieChartComponent = ({ data, title }: { data: any[], title: string }) => (
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
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Reserve users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platforms</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.platformBreakdown.length}</div>
            <p className="text-xs text-muted-foreground">Unique platforms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.sourceBreakdown.length}</div>
            <p className="text-xs text-muted-foreground">Unique sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Emails</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.dataQuality.validEmails}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((analytics.dataQuality.validEmails / analytics.totalUsers) * 100)}% valid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Original Dates</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.dateAnalysis.withOriginalDates}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((analytics.dateAnalysis.withOriginalDates / analytics.totalUsers) * 100)}% have original dates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>Data Quality Analysis</span>
          </CardTitle>
          <CardDescription>Detailed breakdown of data completeness and quality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Email Quality</h4>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Valid: {analytics.dataQuality.validEmails}</span>
              </div>
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Invalid: {analytics.dataQuality.invalidEmails}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Name Completeness</h4>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">With names: {analytics.dataQuality.withNames}</span>
              </div>
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Without names: {analytics.dataQuality.withoutNames}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Date Information</h4>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Original dates: {analytics.dateAnalysis.withOriginalDates}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Import only: {analytics.dateAnalysis.withImportedDatesOnly}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Date Range</h4>
              {analytics.dateAnalysis.oldestOriginalDate && (
                <p className="text-xs text-muted-foreground">
                  Oldest: {new Date(analytics.dateAnalysis.oldestOriginalDate).toLocaleDateString()}
                </p>
              )}
              {analytics.dateAnalysis.newestOriginalDate && (
                <p className="text-xs text-muted-foreground">
                  Newest: {new Date(analytics.dateAnalysis.newestOriginalDate).toLocaleDateString()}
                </p>
              )}
              {analytics.dateAnalysis.importBatchDate && (
                <p className="text-xs text-muted-foreground">
                  Import batch: {new Date(analytics.dateAnalysis.importBatchDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="statuses">Email Status</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricsList data={analytics.platformBreakdown} icon={Globe} title="Platform Breakdown" showUsers={true} />
            <div className="md:col-span-2">
              <BarChartComponent data={chartData.platforms} title="Users by Platform" />
            </div>
          </div>
          <PieChartComponent data={chartData.platforms} title="Platform Distribution" />
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricsList data={analytics.sourceBreakdown} icon={Database} title="Source Breakdown" showUsers={true} />
            <div className="md:col-span-2">
              <BarChartComponent data={chartData.sources} title="Users by Source" />
            </div>
          </div>
          <PieChartComponent data={chartData.sources} title="Source Distribution" />
        </TabsContent>

        <TabsContent value="statuses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricsList data={analytics.statusBreakdown} icon={Mail} title="Status Breakdown" showUsers={true} />
            <div className="md:col-span-2">
              <BarChartComponent data={chartData.statuses} title="Users by Email Status" />
            </div>
          </div>
          <PieChartComponent data={chartData.statuses} title="Status Distribution" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReserveUsersAnalytics;