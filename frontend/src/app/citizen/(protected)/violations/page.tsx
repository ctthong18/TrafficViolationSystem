"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CitizenApi, Configuration } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, Eye, CreditCard, Filter } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Violation {
  id: number;
  license_plate: string;
  violation_type: string;
  location: string;
  fine_amount: number;
  status: string;
  detected_at: string;
  vehicle_id?: number;
  evidence_url?: string;
}

export default function MyViolationsPage() {
  const { token } = useAuth();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchViolations();
  }, [token]);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const citizenApi = new CitizenApi(config);
      const { data } =
        await citizenApi.getMyViolationsApiV1CitizenMyViolationsGet();
      setViolations(data || []);
    } catch (error) {
      console.error("Failed to fetch violations:", error);
      toast.error("Failed to load violations");
    } finally {
      setLoading(false);
    }
  };

  const filteredViolations = violations.filter((violation) => {
    if (statusFilter === "all") return true;
    return violation.status?.toLowerCase() === statusFilter.toLowerCase();
  });

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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-600";
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "paid":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const totalAmountDue = filteredViolations
    .filter(
      (v) =>
        v.status?.toLowerCase() !== "paid" &&
        v.status?.toLowerCase() !== "rejected",
    )
    .reduce((sum, v) => sum + (v.fine_amount || 0), 0);

  const totalAmountPaid = filteredViolations
    .filter((v) => v.status?.toLowerCase() === "paid")
    .reduce((sum, v) => sum + (v.fine_amount || 0), 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Violations</h1>
          <p className="text-muted-foreground">
            View and manage your traffic violations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Total: {filteredViolations.length}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Violations
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{violations.length}</div>
            <p className="text-xs text-muted-foreground">All time violations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalAmountDue.toLocaleString()} VND
            </div>
            <p className="text-xs text-muted-foreground">Unpaid fines</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalAmountPaid.toLocaleString()} VND
            </div>
            <p className="text-xs text-muted-foreground">Total paid fines</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Violations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Violations List</CardTitle>
          <CardDescription>
            {filteredViolations.length} violation
            {filteredViolations.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Violation Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Fine Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredViolations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground"
                    >
                      No violations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredViolations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell className="font-medium">
                        #{violation.id}
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        {violation.license_plate || "N/A"}
                      </TableCell>
                      <TableCell>{violation.violation_type || "N/A"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {violation.location || "N/A"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {violation.fine_amount
                          ? `${violation.fine_amount.toLocaleString()} VND`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(
                            violation.status || "",
                          )}
                          className={getStatusColor(violation.status || "")}
                        >
                          {violation.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {violation.detected_at
                          ? new Date(violation.detected_at).toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/citizen/violations/${violation.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          {violation.status?.toLowerCase() === "approved" && (
                            <Link
                              href={`/citizen/payments/pay/${violation.id}`}
                            >
                              <Button variant="outline" size="sm">
                                <CreditCard className="h-4 w-4 mr-1" />
                                Pay
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
