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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  CamerasApi,
  Configuration,
  CameraCreate,
  CameraUpdate,
  CameraResponse,
} from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Filter,
  Camera,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Activity,
  AlertCircle,
  CheckCircle,
  Calendar,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

export default function CamerasManagementPage() {
  const { token } = useAuth();
  const [cameras, setCameras] = useState<CameraResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Selected camera states
  const [selectedCamera, setSelectedCamera] = useState<CameraResponse | null>(
    null,
  );
  const [cameraToDelete, setCameraToDelete] = useState<CameraResponse | null>(
    null,
  );

  // Form states
  const [newCamera, setNewCamera] = useState<CameraCreate>({
    camera_id: "",
    name: "",
    location_name: "",
    latitude: undefined,
    longitude: undefined,
    address: "",
    camera_type: "fixed",
    resolution: "1080p",
    status: "active",
    enabled_detections: {},
    ai_model_version: "1.0",
    confidence_threshold: 0.8,
  });

  const [editCamera, setEditCamera] = useState<CameraUpdate>({});

  useEffect(() => {
    fetchCameras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter, page]);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const camerasApi = new CamerasApi(config);

      const { data } = await camerasApi.listCamerasApiV1CamerasGet(
        page * limit,
        limit,
        statusFilter !== "all" ? statusFilter || undefined : undefined,
        searchTerm || undefined,
      );

      setCameras(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch cameras:", error);
      toast.error("Failed to load cameras");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchCameras();
  };

  const handleCreateCamera = async () => {
    try {
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const camerasApi = new CamerasApi(config);

      await camerasApi.createCameraApiV1CamerasPost(newCamera);
      toast.success("Camera created successfully");
      setIsCreateDialogOpen(false);
      resetNewCameraForm();
      fetchCameras();
    } catch (error) {
      console.error("Failed to create camera:", error);
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Failed to create camera");
    }
  };

  const handleUpdateCamera = async () => {
    if (!selectedCamera) return;

    try {
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const camerasApi = new CamerasApi(config);

      await camerasApi.updateCameraApiV1CamerasCameraIdPut(
        selectedCamera.camera_id,
        editCamera,
      );
      toast.success("Camera updated successfully");
      setIsEditDialogOpen(false);
      setSelectedCamera(null);
      setEditCamera({});
      fetchCameras();
    } catch (error) {
      console.error("Failed to update camera:", error);
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Failed to update camera");
    }
  };

  const handleDeleteCamera = async () => {
    if (!cameraToDelete) return;

    try {
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const camerasApi = new CamerasApi(config);

      await camerasApi.deleteCameraApiV1CamerasCameraIdDelete(
        cameraToDelete.camera_id,
      );
      toast.success("Camera deleted successfully");
      setIsDeleteDialogOpen(false);
      setCameraToDelete(null);
      fetchCameras();
    } catch (error) {
      console.error("Failed to delete camera:", error);
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Failed to delete camera");
    }
  };

  const handleViewCamera = (camera: CameraResponse) => {
    setSelectedCamera(camera);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (camera: CameraResponse) => {
    setSelectedCamera(camera);
    setEditCamera({
      name: camera.name,
      location_name: camera.location_name,
      latitude: camera.latitude,
      longitude: camera.longitude,
      address: camera.address,
      camera_type: camera.camera_type,
      resolution: camera.resolution,
      status: camera.status,
      enabled_detections: camera.enabled_detections,
      ai_model_version: camera.ai_model_version,
      confidence_threshold: camera.confidence_threshold,
      last_maintenance: camera.last_maintenance,
      next_maintenance: camera.next_maintenance,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (camera: CameraResponse) => {
    setCameraToDelete(camera);
    setIsDeleteDialogOpen(true);
  };

  const resetNewCameraForm = () => {
    setNewCamera({
      camera_id: "",
      name: "",
      location_name: "",
      latitude: undefined,
      longitude: undefined,
      address: "",
      camera_type: "fixed",
      resolution: "1080p",
      status: "active",
      enabled_detections: {},
      ai_model_version: "1.0",
      confidence_threshold: 0.8,
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        );
      case "maintenance":
        return (
          <Badge className="bg-yellow-500">
            <Settings className="h-3 w-3 mr-1" />
            Maintenance
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Camera Management
          </h1>
          <p className="text-muted-foreground">
            Manage traffic monitoring cameras and their configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Camera className="h-4 w-4 mr-2" />
            Total: {total}
          </Badge>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Camera
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Camera</DialogTitle>
                <DialogDescription>
                  Create a new traffic monitoring camera in the system
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="camera_id">Camera ID *</Label>
                    <Input
                      id="camera_id"
                      placeholder="CAM-001"
                      value={newCamera.camera_id}
                      onChange={(e) =>
                        setNewCamera({
                          ...newCamera,
                          camera_id: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Main Street Camera"
                      value={newCamera.name}
                      onChange={(e) =>
                        setNewCamera({ ...newCamera, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_name">Location Name</Label>
                  <Input
                    id="location_name"
                    placeholder="Main Street & 1st Ave"
                    value={newCamera.location_name ?? ""}
                    onChange={(e) =>
                      setNewCamera({
                        ...newCamera,
                        location_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="123 Main Street, City, State"
                    value={newCamera.address ?? ""}
                    onChange={(e) =>
                      setNewCamera({ ...newCamera, address: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.000001"
                      placeholder="40.7128"
                      value={newCamera.latitude ?? ""}
                      onChange={(e) =>
                        setNewCamera({
                          ...newCamera,
                          latitude: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      placeholder="-74.0060"
                      value={newCamera.longitude ?? ""}
                      onChange={(e) =>
                        setNewCamera({
                          ...newCamera,
                          longitude: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="camera_type">Camera Type</Label>
                    <Select
                      value={newCamera.camera_type || ""}
                      onValueChange={(value) =>
                        setNewCamera({ ...newCamera, camera_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="ptz">PTZ (Pan-Tilt-Zoom)</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="speed">Speed Camera</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resolution">Resolution</Label>
                    <Select
                      value={newCamera.resolution || ""}
                      onValueChange={(value) =>
                        setNewCamera({ ...newCamera, resolution: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p HD</SelectItem>
                        <SelectItem value="1080p">1080p Full HD</SelectItem>
                        <SelectItem value="2K">2K</SelectItem>
                        <SelectItem value="4K">4K Ultra HD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newCamera.status || ""}
                      onValueChange={(value) =>
                        setNewCamera({ ...newCamera, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ai_model_version">AI Model Version</Label>
                    <Input
                      id="ai_model_version"
                      placeholder="1.0"
                      value={newCamera.ai_model_version || ""}
                      onChange={(e) =>
                        setNewCamera({
                          ...newCamera,
                          ai_model_version: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confidence_threshold">
                    Confidence Threshold (0.0 - 1.0)
                  </Label>
                  <Input
                    id="confidence_threshold"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    placeholder="0.8"
                    value={newCamera.confidence_threshold || ""}
                    onChange={(e) =>
                      setNewCamera({
                        ...newCamera,
                        confidence_threshold: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetNewCameraForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateCamera}>Create Camera</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              <Label htmlFor="search">Search</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by camera ID, name, or location..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cameras Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cameras</CardTitle>
          <CardDescription>
            {loading
              ? "Loading cameras..."
              : `Showing ${cameras.length} of ${total} cameras`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Camera ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Violations Today</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : cameras.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No cameras found
                    </TableCell>
                  </TableRow>
                ) : (
                  cameras.map((camera) => (
                    <TableRow key={camera.id}>
                      <TableCell className="font-mono font-medium">
                        {camera.camera_id}
                      </TableCell>
                      <TableCell>{camera.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {camera.location_name ?? "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {camera.camera_type ?? "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(camera.status ?? undefined)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-red-500" />
                          <span className="font-semibold">
                            {camera.violations_today || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {camera.last_violation_at
                          ? formatDate(camera.last_violation_at)
                          : "No violations"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCamera(camera)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(camera)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(camera)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

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
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / limit) - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Camera Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Camera Details</DialogTitle>
            <DialogDescription>
              Detailed information about the camera
            </DialogDescription>
          </DialogHeader>
          {selectedCamera && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedCamera.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedCamera.camera_id}
                  </p>
                </div>
                {getStatusBadge(selectedCamera.status ?? undefined)}
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Camera Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {selectedCamera.camera_type || "N/A"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Resolution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {selectedCamera.resolution || "N/A"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Violations Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-red-600">
                      {selectedCamera.violations_today || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      AI Model Version
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {selectedCamera.ai_model_version || "N/A"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Location Information */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location Information
                </h4>
                <div className="space-y-2 text-sm bg-muted p-4 rounded-lg">
                  <div>
                    <span className="font-medium">Location Name:</span>{" "}
                    {selectedCamera.location_name ?? "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Address:</span>{" "}
                    {selectedCamera.address ?? "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Coordinates:</span>{" "}
                    {selectedCamera.latitude && selectedCamera.longitude
                      ? `${selectedCamera.latitude.toFixed(6)}, ${selectedCamera.longitude.toFixed(6)}`
                      : "N/A"}
                  </div>
                </div>
              </div>

              {/* AI Configuration */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  AI Configuration
                </h4>
                <div className="space-y-2 text-sm bg-muted p-4 rounded-lg">
                  <div>
                    <span className="font-medium">Confidence Threshold:</span>{" "}
                    {selectedCamera.confidence_threshold
                      ? `${(selectedCamera.confidence_threshold * 100).toFixed(0)}%`
                      : "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Enabled Detections:</span>{" "}
                    {selectedCamera.enabled_detections
                      ? JSON.stringify(selectedCamera.enabled_detections)
                      : "None"}
                  </div>
                </div>
              </div>

              {/* Maintenance Information */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Maintenance Schedule
                </h4>
                <div className="space-y-2 text-sm bg-muted p-4 rounded-lg">
                  <div>
                    <span className="font-medium">Last Maintenance:</span>{" "}
                    {formatDate(selectedCamera.last_maintenance ?? undefined)}
                  </div>
                  <div>
                    <span className="font-medium">Next Maintenance:</span>{" "}
                    {formatDate(selectedCamera.next_maintenance ?? undefined)}
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-2">
                <h4 className="font-semibold">System Information</h4>
                <div className="space-y-2 text-sm bg-muted p-4 rounded-lg">
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {selectedCamera.created_at
                      ? new Date(selectedCamera.created_at).toLocaleString()
                      : "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>{" "}
                    {selectedCamera.updated_at
                      ? new Date(selectedCamera.updated_at).toLocaleString()
                      : "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Last Violation:</span>{" "}
                    {selectedCamera.last_violation_at
                      ? new Date(
                          selectedCamera.last_violation_at,
                        ).toLocaleString()
                      : "No violations"}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Camera Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Camera</DialogTitle>
            <DialogDescription>
              Update camera information and configuration
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_name">Name</Label>
              <Input
                id="edit_name"
                value={editCamera.name || ""}
                onChange={(e) =>
                  setEditCamera({ ...editCamera, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_location_name">Location Name</Label>
              <Input
                id="edit_location_name"
                value={editCamera.location_name || ""}
                onChange={(e) =>
                  setEditCamera({
                    ...editCamera,
                    location_name: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_address">Address</Label>
              <Textarea
                id="edit_address"
                value={editCamera.address || ""}
                onChange={(e) =>
                  setEditCamera({ ...editCamera, address: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_latitude">Latitude</Label>
                <Input
                  id="edit_latitude"
                  type="number"
                  step="0.000001"
                  value={editCamera.latitude || ""}
                  onChange={(e) =>
                    setEditCamera({
                      ...editCamera,
                      latitude: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_longitude">Longitude</Label>
                <Input
                  id="edit_longitude"
                  type="number"
                  step="0.000001"
                  value={editCamera.longitude || ""}
                  onChange={(e) =>
                    setEditCamera({
                      ...editCamera,
                      longitude: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_camera_type">Camera Type</Label>
                <Select
                  value={editCamera.camera_type ?? ""}
                  onValueChange={(value) =>
                    setEditCamera({
                      ...editCamera,
                      camera_type: value || undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="ptz">PTZ (Pan-Tilt-Zoom)</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="speed">Speed Camera</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_resolution">Resolution</Label>
                <Select
                  value={editCamera.resolution || ""}
                  onValueChange={(value) =>
                    setEditCamera({ ...editCamera, resolution: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p HD</SelectItem>
                    <SelectItem value="1080p">1080p Full HD</SelectItem>
                    <SelectItem value="2K">2K</SelectItem>
                    <SelectItem value="4K">4K Ultra HD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={editCamera.status || ""}
                  onValueChange={(value) =>
                    setEditCamera({ ...editCamera, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_ai_model_version">AI Model Version</Label>
                <Input
                  id="edit_ai_model_version"
                  value={editCamera.ai_model_version || ""}
                  onChange={(e) =>
                    setEditCamera({
                      ...editCamera,
                      ai_model_version: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_confidence_threshold">
                Confidence Threshold (0.0 - 1.0)
              </Label>
              <Input
                id="edit_confidence_threshold"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={editCamera.confidence_threshold || ""}
                onChange={(e) =>
                  setEditCamera({
                    ...editCamera,
                    confidence_threshold: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_last_maintenance">Last Maintenance</Label>
                <Input
                  id="edit_last_maintenance"
                  type="date"
                  value={
                    editCamera.last_maintenance &&
                    editCamera.last_maintenance !== ""
                      ? editCamera.last_maintenance.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditCamera({
                      ...editCamera,
                      last_maintenance: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : "",
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_next_maintenance">Next Maintenance</Label>
                <Input
                  id="edit_next_maintenance"
                  type="date"
                  value={
                    editCamera.next_maintenance &&
                    editCamera.next_maintenance !== ""
                      ? editCamera.next_maintenance.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditCamera({
                      ...editCamera,
                      next_maintenance: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : "",
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedCamera(null);
                setEditCamera({});
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCamera}>Update Camera</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the camera{" "}
              <span className="font-semibold">
                {cameraToDelete?.name} ({cameraToDelete?.camera_id})
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCameraToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCamera}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
