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
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ComplaintsApi,
  AdminApi,
  Configuration,
  ComplaintResponse,
  ComplaintStatus,
  ComplaintType,
  ComplaintActivityResponse,
  UserResponse,
  Role,
} from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Filter,
  Eye,
  AlertCircle,
  UserX,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  UserCheck,
  FileText,
  Calendar,
  Star,
  TrendingUp,
  User,
  Phone,
  Mail,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ComplaintManagementPage() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintResponse | null>(null);
  const [activities, setActivities] = useState<ComplaintActivityResponse[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [officers, setOfficers] = useState<UserResponse[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<string>("");
  const [resolution, setResolution] = useState("");
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
    fetchOfficers();
  }, [token, statusFilter, typeFilter, page]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const complaintsApi = new ComplaintsApi(config);

      const { data } = await complaintsApi.getComplaintsApiV1ComplaintsGet(
        statusFilter !== "all" ? (statusFilter as ComplaintStatus) : undefined,
        typeFilter !== "all" ? (typeFilter as ComplaintType) : undefined,
        page * limit,
        limit,
      );

      setComplaints(data.complaints || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const adminApi = new AdminApi(config);

      const { data } = await adminApi.getAllUsersApiV1AdminUsersGet(
        0,
        100,
        Role.Officer,
        true,
      );

      setOfficers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch officers:", error);
    }
  };

  const fetchComplaintActivities = async (complaintId: number) => {
    try {
      setActivityLoading(true);
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const complaintsApi = new ComplaintsApi(config);

      const { data } =
        await complaintsApi.getComplaintActivitiesApiV1ComplaintsComplaintIdActivitiesGet(
          complaintId,
        );

      setActivities(data || []);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      toast.error("Failed to load complaint activities");
    } finally {
      setActivityLoading(false);
    }
  };

  const handleViewComplaint = async (complaint: ComplaintResponse) => {
    setSelectedComplaint(complaint);
    setDialogOpen(true);
    if (complaint.id) {
      await fetchComplaintActivities(complaint.id);
    }
  };

  const handleAssignOfficer = async () => {
    if (!selectedComplaint?.id || !selectedOfficer) {
      toast.error("Please select an officer");
      return;
    }

    try {
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const complaintsApi = new ComplaintsApi(config);

      await complaintsApi.assignComplaintApiV1ComplaintsComplaintIdAssignPost(
        selectedComplaint.id,
        parseInt(selectedOfficer),
      );

      toast.success("Officer assigned successfully");
      setAssignDialogOpen(false);
      setSelectedOfficer("");
      fetchComplaints();
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to assign officer:", error);
      toast.error("Failed to assign officer");
    }
  };

  const handleResolveComplaint = async () => {
    if (!selectedComplaint?.id || !resolution.trim()) {
      toast.error("Please provide a resolution");
      return;
    }

    try {
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const complaintsApi = new ComplaintsApi(config);

      await complaintsApi.resolveComplaintApiV1ComplaintsComplaintIdResolvePost(
        selectedComplaint.id,
        resolution,
      );

      toast.success("Complaint resolved successfully");
      setResolveDialogOpen(false);
      setResolution("");
      fetchComplaints();
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to resolve complaint:", error);
      toast.error("Failed to resolve complaint");
    }
  };

  const handleUpdateStatus = async (
    complaintId: number,
    status: ComplaintStatus,
  ) => {
    try {
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const complaintsApi = new ComplaintsApi(config);

      await complaintsApi.updateComplaintApiV1ComplaintsComplaintIdPut(
        complaintId,
        { status },
      );

      toast.success("Complaint status updated");
      fetchComplaints();
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update complaint status");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case ComplaintStatus.Pending:
        return "secondary";
      case ComplaintStatus.UnderReview:
        return "default";
      case ComplaintStatus.Resolved:
        return "outline";
      case ComplaintStatus.Rejected:
        return "destructive";
      case ComplaintStatus.Cancelled:
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case ComplaintStatus.Pending:
        return "text-yellow-600";
      case ComplaintStatus.UnderReview:
        return "text-blue-600";
      case ComplaintStatus.Resolved:
        return "text-green-600";
      case ComplaintStatus.Rejected:
        return "text-red-600";
      case ComplaintStatus.Cancelled:
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case ComplaintStatus.Pending:
        return Clock;
      case ComplaintStatus.UnderReview:
        return Activity;
      case ComplaintStatus.Resolved:
        return CheckCircle;
      case ComplaintStatus.Rejected:
        return XCircle;
      case ComplaintStatus.Cancelled:
        return UserX;
      default:
        return AlertCircle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-orange-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getTypeLabel = (type: ComplaintType) => {
    const labels: Record<ComplaintType, string> = {
      [ComplaintType.ViolationDispute]: "Violation Dispute",
      [ComplaintType.FalsePositive]: "False Positive",
      [ComplaintType.MissingViolation]: "Missing Violation",
      [ComplaintType.OfficerBehavior]: "Officer Behavior",
      [ComplaintType.SystemError]: "System Error",
      [ComplaintType.Other]: "Other",
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Complaint Management
          </h1>
          <p className="text-muted-foreground">
            View and manage customer complaints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <MessageSquare className="h-4 w-4 mr-2" />
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
              <Label htmlFor="search">Search by Complaint Code</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Enter complaint code..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
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
                  <SelectItem value={ComplaintStatus.Pending}>
                    Pending
                  </SelectItem>
                  <SelectItem value={ComplaintStatus.UnderReview}>
                    Under Review
                  </SelectItem>
                  <SelectItem value={ComplaintStatus.Resolved}>
                    Resolved
                  </SelectItem>
                  <SelectItem value={ComplaintStatus.Rejected}>
                    Rejected
                  </SelectItem>
                  <SelectItem value={ComplaintStatus.Cancelled}>
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="type-filter">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={ComplaintType.ViolationDispute}>
                    Violation Dispute
                  </SelectItem>
                  <SelectItem value={ComplaintType.FalsePositive}>
                    False Positive
                  </SelectItem>
                  <SelectItem value={ComplaintType.MissingViolation}>
                    Missing Violation
                  </SelectItem>
                  <SelectItem value={ComplaintType.OfficerBehavior}>
                    Officer Behavior
                  </SelectItem>
                  <SelectItem value={ComplaintType.SystemError}>
                    System Error
                  </SelectItem>
                  <SelectItem value={ComplaintType.Other}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle>Complaints List</CardTitle>
          <CardDescription>
            {loading
              ? "Loading complaints..."
              : `Showing ${complaints.length} of ${total} complaints`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No complaints found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Complainant</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints.map((complaint) => {
                      const StatusIcon = getStatusIcon(complaint.status);
                      return (
                        <TableRow key={complaint.id}>
                          <TableCell className="font-mono text-sm">
                            {complaint.complaint_code}
                          </TableCell>
                          <TableCell className="font-medium max-w-xs truncate">
                            {complaint.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getTypeLabel(complaint.complaint_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(complaint.status)}
                              className={getStatusColor(complaint.status)}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {complaint.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-semibold ${getPriorityColor(complaint.priority)}`}
                            >
                              {complaint.priority}
                            </span>
                          </TableCell>
                          <TableCell>
                            {complaint.is_anonymous ? (
                              <span className="text-muted-foreground italic">
                                Anonymous
                              </span>
                            ) : (
                              complaint.complainant_name
                            )}
                          </TableCell>
                          <TableCell>
                            {complaint.assigned_officer_id ? (
                              <Badge variant="secondary">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Officer #{complaint.assigned_officer_id}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                Unassigned
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(complaint.created_at)}
                          </TableCell>
                          <TableCell>
                            {complaint.user_rating ? (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">
                                  {complaint.user_rating}/5
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                N/A
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewComplaint(complaint)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {page * limit + 1} to{" "}
                  {Math.min((page + 1) * limit, total)} of {total} complaints
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
            </>
          )}
        </CardContent>
      </Card>

      {/* View Complaint Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Complaint Details
            </DialogTitle>
            <DialogDescription>
              {selectedComplaint?.complaint_code} - {selectedComplaint?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activities">Activity History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                {/* Status and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge
                        variant={getStatusBadgeVariant(
                          selectedComplaint.status,
                        )}
                        className={`${getStatusColor(selectedComplaint.status)} text-base py-1 px-3`}
                      >
                        {selectedComplaint.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Priority</Label>
                    <div
                      className={`mt-1 font-semibold text-lg ${getPriorityColor(selectedComplaint.priority)}`}
                    >
                      {selectedComplaint.priority}
                    </div>
                  </div>
                </div>

                {/* Type and Code */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-base">
                        {getTypeLabel(selectedComplaint.complaint_type)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Complaint Code
                    </Label>
                    <div className="mt-1 font-mono">
                      {selectedComplaint.complaint_code}
                    </div>
                  </div>
                </div>

                {/* Complainant Information */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Complainant Information
                  </h3>
                  {selectedComplaint.is_anonymous ? (
                    <p className="text-muted-foreground italic">
                      This is an anonymous complaint
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-xs">
                          Name
                        </Label>
                        <p className="mt-1">
                          {selectedComplaint.complainant_name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Phone
                        </Label>
                        <p className="mt-1">
                          {selectedComplaint.complainant_phone}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email
                        </Label>
                        <p className="mt-1">
                          {selectedComplaint.complainant_email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-2 p-3 bg-muted rounded-md">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* Desired Resolution */}
                {selectedComplaint.desired_resolution && (
                  <div>
                    <Label className="text-muted-foreground">
                      Desired Resolution
                    </Label>
                    <p className="mt-2 p-3 bg-muted rounded-md">
                      {selectedComplaint.desired_resolution}
                    </p>
                  </div>
                )}

                {/* Related Information */}
                <div className="grid grid-cols-3 gap-4">
                  {selectedComplaint.violation_id && (
                    <div>
                      <Label className="text-muted-foreground text-xs">
                        Violation ID
                      </Label>
                      <p className="mt-1 font-mono">
                        #{selectedComplaint.violation_id}
                      </p>
                    </div>
                  )}
                  {selectedComplaint.vehicle_id && (
                    <div>
                      <Label className="text-muted-foreground text-xs">
                        Vehicle ID
                      </Label>
                      <p className="mt-1 font-mono">
                        #{selectedComplaint.vehicle_id}
                      </p>
                    </div>
                  )}
                  {selectedComplaint.assigned_officer_id && (
                    <div>
                      <Label className="text-muted-foreground text-xs">
                        Assigned Officer
                      </Label>
                      <p className="mt-1">
                        Officer #{selectedComplaint.assigned_officer_id}
                      </p>
                    </div>
                  )}
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <Label className="text-muted-foreground text-xs flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created
                    </Label>
                    <p className="mt-1 text-sm">
                      {formatDate(selectedComplaint.created_at)}
                    </p>
                  </div>
                  {selectedComplaint.assigned_at && (
                    <div>
                      <Label className="text-muted-foreground text-xs flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Assigned
                      </Label>
                      <p className="mt-1 text-sm">
                        {formatDate(selectedComplaint.assigned_at)}
                      </p>
                    </div>
                  )}
                  {selectedComplaint.resolved_at && (
                    <div>
                      <Label className="text-muted-foreground text-xs flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Resolved
                      </Label>
                      <p className="mt-1 text-sm">
                        {formatDate(selectedComplaint.resolved_at)}
                      </p>
                    </div>
                  )}
                </div>

                {/* User Feedback */}
                {selectedComplaint.user_rating && (
                  <div className="border rounded-lg p-4 space-y-2 bg-yellow-50 dark:bg-yellow-950">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      User Feedback
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < selectedComplaint.user_rating!
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">
                        {selectedComplaint.user_rating}/5
                      </span>
                    </div>
                    {selectedComplaint.user_feedback && (
                      <p className="text-sm mt-2">
                        {selectedComplaint.user_feedback}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  {selectedComplaint.status === ComplaintStatus.Pending && (
                    <>
                      <Button
                        onClick={() => setAssignDialogOpen(true)}
                        className="flex-1"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Assign Officer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleUpdateStatus(
                            selectedComplaint.id!,
                            ComplaintStatus.UnderReview,
                          )
                        }
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Mark Under Review
                      </Button>
                    </>
                  )}
                  {selectedComplaint.status === ComplaintStatus.UnderReview && (
                    <>
                      <Button
                        onClick={() => setResolveDialogOpen(true)}
                        variant="default"
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleUpdateStatus(
                            selectedComplaint.id!,
                            ComplaintStatus.Rejected,
                          )
                        }
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activities" className="space-y-4">
                {activityLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Activity className="h-12 w-12 mb-4 opacity-50" />
                    <p>No activities recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {activity.activity_type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              by User #{activity.performed_by}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(activity.performed_at)}
                          </span>
                        </div>
                        <p className="text-sm">{activity.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Officer Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Officer</DialogTitle>
            <DialogDescription>
              Select an officer to handle this complaint
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="officer-select">Select Officer</Label>
              <Select
                value={selectedOfficer}
                onValueChange={setSelectedOfficer}
              >
                <SelectTrigger id="officer-select" className="mt-2">
                  <SelectValue placeholder="Choose an officer" />
                </SelectTrigger>
                <SelectContent>
                  {officers.map((officer) => (
                    <SelectItem
                      key={officer.id}
                      value={officer.id?.toString() || ""}
                    >
                      {officer.full_name} ({officer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignOfficer}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Complaint Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Complaint</DialogTitle>
            <DialogDescription>
              Provide a resolution for this complaint
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="resolution">Resolution</Label>
              <Textarea
                id="resolution"
                placeholder="Describe how this complaint was resolved..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="mt-2 min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResolveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleResolveComplaint}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
