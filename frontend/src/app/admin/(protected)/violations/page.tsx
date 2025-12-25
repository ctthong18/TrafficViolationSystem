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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  MapPin,
  Calendar,
  Car,
  Camera,
  FileText,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case ViolationStatus.Pending:
        return "secondary";
      case ViolationStatus.Approved:
        return "default";
      case ViolationStatus.Rejected:
        return "destructive";
      case ViolationStatus.Paid:
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case ViolationStatus.Pending:
        return "text-yellow-600";
      case ViolationStatus.Approved:
        return "text-green-600";
      case ViolationStatus.Rejected:
        return "text-red-600";
      case ViolationStatus.Paid:
        return "text-blue-600";
      case ViolationStatus.Verified:
        return "text-blue-500";
      case ViolationStatus.Reviewing:
        return "text-orange-600";
      case ViolationStatus.Processed:
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Violation Details #{selectedViolation?.id}
            </DialogTitle>
            <DialogDescription>
              Complete information about this traffic violation
            </DialogDescription>
          </DialogHeader>

          {selectedViolation && (
            <div className="space-y-6 mt-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge
                  variant={getStatusBadgeVariant(
                    selectedViolation.status || "",
                  )}
                  className={`${getStatusColor(selectedViolation.status || "")} text-base px-4 py-2`}
                >
                  {selectedViolation.status}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {new Date(selectedViolation.detected_at).toLocaleString()}
                </div>
              </div>

              {/* Vehicle Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">
                      License Plate
                    </Label>
                    <p className="font-mono font-bold text-lg">
                      {selectedViolation.license_plate}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Vehicle Type
                    </Label>
                    <p className="font-semibold">
                      {selectedViolation.vehicle_type || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Color</Label>
                    <p className="font-semibold">
                      {selectedViolation.vehicle_color || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Brand</Label>
                    <p className="font-semibold">
                      {selectedViolation.vehicle_brand || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Violation Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Violation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">
                      Violation Type
                    </Label>
                    <p className="font-semibold text-lg">
                      {selectedViolation.violation_type}
                    </p>
                  </div>
                  {selectedViolation.violation_description && (
                    <div>
                      <Label className="text-muted-foreground">
                        Description
                      </Label>
                      <p className="text-sm">
                        {selectedViolation.violation_description}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">
                        Confidence Score
                      </Label>
                      <p className="font-semibold">
                        {selectedViolation.confidence_score
                          ? `${(selectedViolation.confidence_score * 100).toFixed(2)}%`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Priority</Label>
                      <p className="font-semibold">
                        {selectedViolation.priority}
                      </p>
                    </div>
                  </div>
                  {selectedViolation.legal_reference && (
                    <div>
                      <Label className="text-muted-foreground">
                        Legal Reference
                      </Label>
                      <p className="text-sm">
                        {selectedViolation.legal_reference}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">Location</Label>
                    <p className="font-semibold">
                      {selectedViolation.location_name || "N/A"}
                    </p>
                  </div>
                  {(selectedViolation.latitude ||
                    selectedViolation.longitude) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">
                          Latitude
                        </Label>
                        <p className="font-mono text-sm">
                          {selectedViolation.latitude}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Longitude
                        </Label>
                        <p className="font-mono text-sm">
                          {selectedViolation.longitude}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedViolation.camera_id && (
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-1">
                        <Camera className="h-4 w-4" />
                        Camera ID
                      </Label>
                      <p className="font-mono">{selectedViolation.camera_id}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fine Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Fine Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Fine Amount</Label>
                    <p className="font-bold text-xl text-red-600">
                      {selectedViolation.fine_amount
                        ? `${parseFloat(selectedViolation.fine_amount).toLocaleString()} VND`
                        : "N/A"}
                    </p>
                  </div>
                  {selectedViolation.points_deducted && (
                    <div>
                      <Label className="text-muted-foreground">
                        Points Deducted
                      </Label>
                      <p className="font-bold text-xl text-orange-600">
                        {selectedViolation.points_deducted}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Evidence Images */}
              {selectedViolation.evidence_images &&
                selectedViolation.evidence_images.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Evidence Images
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedViolation.evidence_images.map((image, idx) => (
                          <div
                            key={idx}
                            className="border rounded-lg overflow-hidden"
                          >
                            <img
                              src={image}
                              alt={`Evidence ${idx + 1}`}
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Evidence GIF */}
              {selectedViolation.evidence_gif && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Evidence GIF</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={selectedViolation.evidence_gif}
                        alt="Evidence GIF"
                        className="w-full h-auto"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Review Information */}
              {selectedViolation.reviewed_by && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Review Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">
                          Reviewed By
                        </Label>
                        <p className="font-semibold">
                          User #{selectedViolation.reviewed_by}
                        </p>
                      </div>
                      {selectedViolation.reviewed_at && (
                        <div>
                          <Label className="text-muted-foreground">
                            Reviewed At
                          </Label>
                          <p className="font-semibold">
                            {new Date(
                              selectedViolation.reviewed_at,
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    {selectedViolation.review_notes && (
                      <div>
                        <Label className="text-muted-foreground">
                          Review Notes
                        </Label>
                        <p className="text-sm bg-muted p-3 rounded-md">
                          {selectedViolation.review_notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Timestamps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timestamps</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Created At</Label>
                    <p>
                      {new Date(selectedViolation.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Updated At</Label>
                    <p>
                      {new Date(selectedViolation.updated_at).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
