"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  StatisticsApi,
  ActivitiesApi,
  AnalyticsApi,
  Configuration,
} from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Activity,
  AlertTriangle,
  Camera,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface StatisticsData {
  total_violations: number;
  pending_violations: number;
  approved_violations: number;
  rejected_violations: number;
  total_videos: number;
  processed_videos: number;
  pending_videos: number;
  total_cameras: number;
  active_cameras: number;
  violations_trend: number;
  videos_trend: number;
  period: string;
}

interface RecentActivity {
  id: number;
  user_id: number;
  activity: string;
  type?: string;
  date: string;
}

interface CalendarDayStats {
  date: string;
  violations: number;
  videos: number;
  processed: number;
}
interface CalendarRangeData {
  start_date: string;
  end_date: string;
  total_violations: number;
  total_videos: number;
  daily_stats: CalendarDayStats[];
}
export default function DashboardPage() {
  const { token } = useAuth();
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [dateRange, setDateRange] = useState<string>("7days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activitiesLimit, setActivitiesLimit] = useState<number>(10);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const config = new Configuration({
          basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
          accessToken: token || undefined,
        });

        const statsApi = new StatisticsApi(config);
        const activitiesApi = new ActivitiesApi(config);

        // Fetch statistics
        const { data: statsData } =
          await statsApi.getStatisticsApiV1StatisticsGet(dateRange);
        setStatistics(statsData);

        // Fetch recent activities
        const { data: activitiesData } =
          await activitiesApi.getRecentActivitiesApiV1ActivitiesRecentGet(
            activitiesLimit,
          );
        setActivities(activitiesData || []);

        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token, dateRange, activitiesLimit]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getActivityIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "violation":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "video":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "camera":
        return <Camera className="h-4 w-4 text-purple-500" />;
      case "user":
        return <Users className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadgeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "violation":
        return "destructive";
      case "video":
        return "default";
      case "camera":
        return "secondary";
      case "user":
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const violationApprovalRate = statistics?.total_violations
    ? (
        (statistics.approved_violations / statistics.total_violations) *
        100
      ).toFixed(1)
    : "0";

  const videoProcessingRate = statistics?.total_videos
    ? ((statistics.processed_videos / statistics.total_videos) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            System-wide analytics and statistics overview
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="3months">Last 3 months</SelectItem>
            <SelectItem value="year">This year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Violations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Violations
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.total_violations?.toLocaleString() || 0}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {statistics?.violations_trend !== undefined &&
              statistics.violations_trend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span
                className={
                  statistics?.violations_trend !== undefined &&
                  statistics.violations_trend >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {Math.abs(statistics?.violations_trend || 0)}%
              </span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Violations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statistics?.pending_violations?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting officer review
            </p>
          </CardContent>
        </Card>

        {/* Approved Violations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics?.approved_violations?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {violationApprovalRate}% approval rate
            </p>
          </CardContent>
        </Card>

        {/* Rejected Violations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statistics?.rejected_violations?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Invalid violations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Video Processing & Camera Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Videos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.total_videos?.toLocaleString() || 0}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {statistics?.videos_trend !== undefined &&
              statistics.videos_trend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span
                className={
                  statistics?.videos_trend !== undefined &&
                  statistics.videos_trend >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {Math.abs(statistics?.videos_trend || 0)}%
              </span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        {/* Processed Videos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Processed Videos
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statistics?.processed_videos?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {videoProcessingRate}% processing rate
            </p>
          </CardContent>
        </Card>

        {/* Active Cameras */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Cameras
            </CardTitle>
            <Camera className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {statistics?.active_cameras?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of {statistics?.total_cameras || 0} total cameras
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* Recent Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent System Activities
                  </CardTitle>
                  <CardDescription>
                    Latest actions and updates across the system
                  </CardDescription>
                </div>
                <Select
                  value={activitiesLimit.toString()}
                  onValueChange={(value) => setActivitiesLimit(parseInt(value))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Show 5</SelectItem>
                    <SelectItem value="10">Show 10</SelectItem>
                    <SelectItem value="20">Show 20</SelectItem>
                    <SelectItem value="50">Show 50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities && activities.length > 0 ? (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start justify-between border-b pb-3 last:border-b-0 hover:bg-muted/50 p-2 rounded-md transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-none">
                              {activity.activity}
                            </p>
                            {activity.type && (
                              <Badge
                                variant={
                                  getActivityBadgeColor(activity.type) as any
                                }
                                className="text-xs"
                              >
                                {activity.type}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            User ID: {activity.user_id}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {formatDate(activity.date)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No recent activities found
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Violation Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Violation Status Breakdown</CardTitle>
                <CardDescription>
                  Distribution of violation statuses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="font-semibold">
                    {statistics?.pending_violations?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Approved</span>
                  </div>
                  <span className="font-semibold">
                    {statistics?.approved_violations?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Rejected</span>
                  </div>
                  <span className="font-semibold">
                    {statistics?.rejected_violations?.toLocaleString() || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Video Processing Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Video Processing Overview</CardTitle>
                <CardDescription>
                  Current video processing status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Processed</span>
                  </div>
                  <span className="font-semibold">
                    {statistics?.processed_videos?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="font-semibold">
                    {statistics?.pending_videos?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span className="text-sm">Total</span>
                  </div>
                  <span className="font-semibold">
                    {statistics?.total_videos?.toLocaleString() || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Period Summary
              </CardTitle>
              <CardDescription>
                Statistics for the selected time range:{" "}
                {statistics?.period || dateRange}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Total Violations
                  </p>
                  <p className="text-2xl font-bold">
                    {statistics?.total_violations?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Videos</p>
                  <p className="text-2xl font-bold">
                    {statistics?.total_videos?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Active Cameras
                  </p>
                  <p className="text-2xl font-bold">
                    {statistics?.active_cameras?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
