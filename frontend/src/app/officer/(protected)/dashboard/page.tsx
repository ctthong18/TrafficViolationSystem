"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OfficerApi, Configuration } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { ClipboardCheck, AlertTriangle, MessageSquare, Activity, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  total_assigned_violations: number;
  pending_review_violations: number;
  reviewed_today: number;
  total_assigned_complaints: number;
  pending_complaints: number;
  resolved_complaints: number;
}

interface RecentActivity {
  id: number;
  activity: string;
  type?: string | null;
  date: string;
}

export default function OfficerDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const config = new Configuration({
          basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
          accessToken: token || undefined,
        });
        const officerApi = new OfficerApi(config);

        // Fetch dashboard stats
        const { data: statsData } = await officerApi.getOfficerDashboardApiV1OfficerDashboardStatsGet();
        setStats(statsData);

        // Fetch recent activities
        const { data: activitiesData } = await officerApi.getOfficerActivitiesApiV1OfficerDashboardActivitiesGet();
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
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Officer Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your assigned tasks and activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_review_violations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Violations awaiting review
            </p>
            <Link href="/officer/review-queue">
              <Button variant="link" className="px-0 mt-2">
                Review now →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_assigned_violations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total assigned to you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Complaints</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_assigned_complaints || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pending_complaints || 0} pending resolution
            </p>
            <Link href="/officer/complaints">
              <Button variant="link" className="px-0 mt-2">
                View all →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.reviewed_today || 0}</div>
            <p className="text-xs text-muted-foreground">
              Violations processed today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activities
          </CardTitle>
          <CardDescription>Your latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities && activities.length > 0 ? (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between border-b pb-3 last:border-b-0"
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.activity}</p>
                    <p className="text-xs text-muted-foreground uppercase">{activity.type}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.date).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activities
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/officer/review-queue">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <ClipboardCheck className="h-6 w-6" />
                <span>Review Queue</span>
              </Button>
            </Link>
            <Link href="/officer/violations">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                <span>All Violations</span>
              </Button>
            </Link>
            <Link href="/officer/complaints">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <MessageSquare className="h-6 w-6 text-info" />
                <span>Complaints</span>
              </Button>
            </Link>
            <Link href="/officer/record">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                <span>Duty Logs</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
