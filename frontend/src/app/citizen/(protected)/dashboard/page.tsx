"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CitizenApi, Configuration } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { Car, AlertTriangle, CreditCard, FileText, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  total_vehicles: number;
  total_violations: number;
  pending_violations: number;
  paid_violations: number;
  unpaid_violations: number;
  total_amount_due: number;
  total_amount_paid: number;
  recent_violations: Array<{
    id: number;
    license_plate: string;
    violation_type: string;
    fine_amount: number;
    status: string;
    detected_at: string;
  }>;
}

export default function CitizenDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const config = new Configuration({
          basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
          accessToken: token || undefined,
        });
        const citizenApi = new CitizenApi(config);
        const { data } = await citizenApi.getCitizenDashboardApiV1CitizenDashboardStatsGet();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "secondary";
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "paid":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your vehicles and violations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_vehicles || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered vehicles
            </p>
            <Link href="/citizen/vehicles">
              <Button variant="link" className="px-0 mt-2">
                View all →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_violations || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pending_violations || 0} pending, {stats?.unpaid_violations || 0} unpaid
            </p>
            <Link href="/citizen/violations">
              <Button variant="link" className="px-0 mt-2">
                View all →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {(stats?.total_amount_due || 0).toLocaleString()} VND
            </div>
            <p className="text-xs text-muted-foreground">
              Unpaid fines
            </p>
            <Link href="/citizen/payments">
              <Button variant="link" className="px-0 mt-2">
                Pay now →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(stats?.total_amount_paid || 0).toLocaleString()} VND
            </div>
            <p className="text-xs text-muted-foreground">
              Total paid fines
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Violations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Violations
          </CardTitle>
          <CardDescription>Your latest traffic violations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recent_violations && stats.recent_violations.length > 0 ? (
              stats.recent_violations.map((violation) => (
                <div
                  key={violation.id}
                  className="flex items-center justify-between border-b pb-3 last:border-b-0"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {violation.violation_type}
                      </p>
                      <Badge variant={getStatusBadgeVariant(violation.status)}>
                        {violation.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-mono">{violation.license_plate}</span>
                      <span>•</span>
                      <span>{new Date(violation.detected_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">
                      {violation.fine_amount.toLocaleString()} VND
                    </p>
                    <Link href={`/citizen/violations/${violation.id}`}>
                      <Button variant="link" className="px-0 h-auto text-xs">
                        View details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No violations found. Keep driving safely!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/citizen/vehicles/register">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <Car className="h-6 w-6" />
                <span>Register Vehicle</span>
              </Button>
            </Link>
            <Link href="/citizen/violations">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                <span>View Violations</span>
              </Button>
            </Link>
            <Link href="/citizen/payments">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <CreditCard className="h-6 w-6" />
                <span>Pay Fines</span>
              </Button>
            </Link>
            <Link href="/citizen/complaints/create">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>File Complaint</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
