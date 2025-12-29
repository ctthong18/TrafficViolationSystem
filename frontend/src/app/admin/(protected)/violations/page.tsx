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
import { Input } from "@/components/ui/input";
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
import {
  ViolationsApi,
  Configuration,
  ViolationResponse,
  ViolationStatus,
} from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Filter,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { ViolationDetailsDialog } from "./ViolationDetailsDialog";
import { getStatusBadgeVariant, getStatusColor } from "@/lib/violation-utils";

export default function ViolationsPage() {
  const { token } = useAuth();
  const [violations, setViolations] = useState<ViolationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [selectedViolation, setSelectedViolation] =
    useState<ViolationResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchViolations();
  }, [token, statusFilter, page]);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const violationsApi = new ViolationsApi(config);

      const { data } = await violationsApi.getViolationsApiV1ViolationsGet(
        page * limit, // skip
        limit, // limit
        statusFilter !== "all" ? statusFilter : undefined, // status
        searchTerm || undefined, // licensePlate
      );

      setViolations(data.violations || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch violations:", error);
      toast.error("Failed to load violations");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchViolations();
  };

  const handleViewViolation = (violation: ViolationResponse) => {
    setSelectedViolation(violation);
    setDialogOpen(true);
  };


  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Violations Management
          </h1>
          <p className="text-muted-foreground">
            View and manage traffic violations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Total: {total}
          </Badge>
        </div>
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
            <div className="flex-1">
              <Label htmlFor="search">Search by License Plate</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Enter license plate..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={ViolationStatus.Pending}>
                    Pending
                  </SelectItem>
                  <SelectItem value={ViolationStatus.Reviewing}>
                    Reviewing
                  </SelectItem>
                  <SelectItem value={ViolationStatus.Verified}>
                    Verified
                  </SelectItem>
                  <SelectItem value={ViolationStatus.Approved}>
                    Approved
                  </SelectItem>
                  <SelectItem value={ViolationStatus.Rejected}>
                    Rejected
                  </SelectItem>
                  <SelectItem value={ViolationStatus.Paid}>Paid</SelectItem>
                  <SelectItem value={ViolationStatus.Processed}>
                    Processed
                  </SelectItem>
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
            Showing {violations.length} of {total} violation
            {total !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
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
                  {violations.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground"
                      >
                        No violations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    violations.map((violation) => (
                      <TableRow key={violation.id}>
                        <TableCell className="font-medium">
                          #{violation.id}
                        </TableCell>
                        <TableCell className="font-mono font-semibold">
                          {violation.license_plate || "N/A"}
                        </TableCell>
                        <TableCell>
                          {violation.violation_type || "N/A"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {violation.location_name || "N/A"}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {violation.fine_amount
                            ? `${parseFloat(violation.fine_amount).toLocaleString()} VND`
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewViolation(violation)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {total > limit && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page + 1} of {Math.ceil(total / limit)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={(page + 1) * limit >= total}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Violation Details Dialog */}
      <ViolationDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        violation={selectedViolation}
      />
    </div>
  );
}
