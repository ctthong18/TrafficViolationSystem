"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  VehiclesApi,
  ViolationsApi,
  CamerasApi, // Add this
  DrivingLicensesApi,
  Configuration,
  VehicleResponse,
  ViolationResponse,
  DrivingLicenseResponse,
  CameraResponse, // Add this
  ViolationStatus,
} from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Car,
  User,
  AlertTriangle,
  History,
  FileText,
  MapPin,
  Camera,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calendar,
  Play,
  Siren,
  Video,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { recordStream } from "@/utils/videoRecorder";
import { uploadToCloudinary, generateVideoFilename } from "@/utils/cloudinary";
import { CreateViolationDialog } from "@/components/CreateViolationDialog";

export default function PatrolPage() {
  const { token } = useAuth();
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);

  // Results
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null);
  const [license, setLicense] = useState<DrivingLicenseResponse | null>(null);
  const [violations, setViolations] = useState<ViolationResponse[]>([]);
  const [searched, setSearched] = useState(false);

  // Camera State
  const [isCameraListOpen, setIsCameraListOpen] = useState(false);
  const [cameras, setCameras] = useState<CameraResponse[]>([]);
  const [loadingCameras, setLoadingCameras] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<CameraResponse | null>(
    null,
  );
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  // Video Recording State
  const streamImgRef = useRef<HTMLImageElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isViolationDialogOpen, setIsViolationDialogOpen] = useState(false);

  const handleOpenCameras = async () => {
    try {
      setLoadingCameras(true);
      setIsCameraListOpen(true);
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const camerasApi = new CamerasApi(config);
      const { data } = await camerasApi.listCamerasApiV1CamerasGet();
      setCameras(data.items);
    } catch (error) {
      console.error("Failed to load cameras:", error);
      toast.error("Failed to load camera feed");
    } finally {
      setLoadingCameras(false);
    }
  };

  const handleSelectCamera = async (camera: CameraResponse) => {
    try {
      setSelectedCamera(camera);
      setStreamUrl(null); // Reset stream URL

      // Fetch stream URL
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/cameras/${camera.camera_id}/stream`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();

        // Check stream status
        if (data.status === "offline") {
          toast.warning(
            `Camera ${camera.name} is offline. Waiting for feed...`,
          );
        } else {
          toast.success("Stream connected");
        }

        // Add cache busting to prevent browser caching
        const streamUrlWithCache = `${data.stream_url}?t=${Date.now()}`;
        setStreamUrl(streamUrlWithCache);
      } else {
        toast.error("Failed to start stream");
      }
    } catch (error) {
      console.error("Stream connection error:", error);
      toast.error("Stream connection failed");
    }
  };

  const handleSimulateAI = async () => {
    if (!selectedCamera) return;
    try {
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const payload = {
        license_plate: "30A-" + Math.floor(10000 + Math.random() * 90000),
        violation_type: "RED_LIGHT",
        latitude: selectedCamera.latitude || 21.0,
        longitude: selectedCamera.longitude || 105.8,
        location_name: selectedCamera.location_name || "Unknown Location",
        camera_id: selectedCamera.camera_id,
        detected_at: new Date().toISOString(),
        confidence_score: 0.85 + Math.random() * 0.14,
        evidence_images: [],
        ai_metadata: { simulated: true },
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/violations/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create violation");
      }

      toast.success("AI Violation Simulated & Sent!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to simulate violation");
    }
  };

  const handleSearch = async () => {
    if (!plate) return;

    try {
      setLoading(true);
      setSearched(false);
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });

      const vehiclesApi = new VehiclesApi(config);
      const violationsApi = new ViolationsApi(config);
      const licensesApi = new DrivingLicensesApi(config);

      // 1. Get Vehicle
      try {
        const { data: vData } =
          await vehiclesApi.getVehicleByLicensePlateApiV1VehiclesLicensePlateLicensePlateGet(
            plate,
          );
        setVehicle(vData);

        // 2. Get Owner's License (handled via citizen directory if needed)

        // 3. Get Violations for this plate
        const { data: vioData } =
          await violationsApi.getViolationsApiV1ViolationsGet(
            0,
            10,
            undefined,
            vData.license_plate,
          );
        setViolations(vioData.violations || []);
      } catch (e) {
        toast.error("Vehicle record not found");
        setVehicle(null);
        setViolations([]);
      }

      setSearched(true);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Failed to retrieve roadside data");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordAndCreateViolation = async () => {
    if (!streamImgRef.current || !selectedCamera) {
      toast.error("No active stream to record");
      return;
    }

    try {
      setIsRecording(true);
      toast.info("Recording last 1 second of stream...");

      // Record 1 second of video
      const recordedData = await recordStream(streamImgRef.current, {
        duration: 1000, // 1 second
        frameRate: 10, // 10 fps
        quality: 0.8,
      });

      toast.success(`Captured ${recordedData.frameCount} frames`);
      toast.info("Uploading to Cloudinary...");

      // Create a file from the blob
      const filename = generateVideoFilename(selectedCamera.camera_id);
      const file = new File([recordedData.blob], `${filename}.webm`, {
        type: recordedData.blob.type,
      });

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary({
        file,
        folder: "traffic_violations",
        resourceType: "video",
        publicId: filename,
      });

      toast.success("Video uploaded successfully!");

      // Set the recorded video URL and open the violation dialog
      setRecordedVideoUrl(uploadResult.secure_url);
      setIsViolationDialogOpen(true);
    } catch (error) {
      console.error("Failed to record and upload video:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to record video. Please check Cloudinary configuration.",
      );
    } finally {
      setIsRecording(false);
    }
  };

  const handleViolationSuccess = () => {
    // Clear the recorded video URL
    setRecordedVideoUrl(null);
    // Optionally refresh data or show success message
    toast.success("Violation recorded successfully!");
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Active Patrol Tool
            </h1>
            <p className="text-muted-foreground font-medium">
              Real-time roadside vehicle and driver verification
            </p>
          </div>
        </div>

        <div className="bg-foreground text-background px-4 py-2 rounded-xl flex items-center gap-3 shadow-md">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
          <span className="text-xs font-bold tracking-widest uppercase">
            Field Unit Connected
          </span>
        </div>
      </div>

      {/* Plate Scanner (Search) */}
      <Card className="border-none shadow-xl bg-card/80 backdrop-blur-md overflow-hidden rounded-2xl border-b-4 border-primary">
        <CardContent className="p-8">
          <div className="max-w-2xl mx-auto space-y-4">
            <Label className="text-center block text-sm font-black uppercase text-muted-foreground tracking-tighter">
              Enter Plate Number / Scan
            </Label>
            <div className="flex gap-3 h-16">
              <div className="relative flex-1">
                <Car className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <Input
                  placeholder="e.g. 30A-12345"
                  className="h-full pl-14 text-2xl font-black rounded-xl border-2 border-border focus:border-primary transition-all uppercase"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="h-full px-10 bg-primary hover:bg-primary/90 shadow-lg rounded-xl"
              >
                {loading ? (
                  <RefreshCw className="animate-spin text-primary-foreground" />
                ) : (
                  <Search className="h-6 w-6 text-primary-foreground" />
                )}
              </Button>
            </div>
            <div className="flex justify-center gap-6">
              <Dialog
                open={isCameraListOpen}
                onOpenChange={setIsCameraListOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                    onClick={handleOpenCameras}
                  >
                    <Camera className="h-4 w-4 mr-2" /> Use Camera Scanner
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                  <div className="p-6 border-b flex justify-between items-center bg-muted/20">
                    <div>
                      <DialogTitle>Traffic Camera Network</DialogTitle>
                      <DialogDescription>
                        Live feed access and AI monitoring control
                      </DialogDescription>
                    </div>
                    {selectedCamera && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCamera(null);
                          setStreamUrl(null);
                        }}
                      >
                        Back to List
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 overflow-auto p-6 bg-black/95">
                    {!selectedCamera ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loadingCameras ? (
                          <div className="text-white col-span-full text-center py-20">
                            Loading feeds...
                          </div>
                        ) : cameras.length === 0 ? (
                          <div className="text-muted-foreground col-span-full text-center py-20">
                            No cameras available.
                          </div>
                        ) : (
                          cameras.map((cam) => (
                            <Card
                              key={cam.id}
                              className="bg-zinc-900 border-zinc-800 hover:border-primary/50 cursor-pointer transition-all group"
                              onClick={() => handleSelectCamera(cam)}
                            >
                              <div className="aspect-video bg-zinc-950 relative flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>
                                <Play className="h-12 w-12 text-white/20 group-hover:text-primary group-hover:scale-110 transition-all" />
                                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                  <Badge
                                    variant={
                                      cam.status === "ONLINE"
                                        ? "default"
                                        : "destructive"
                                    }
                                    className="text-[10px] h-5"
                                  >
                                    {cam.status}
                                  </Badge>
                                  <span className="text-xs text-zinc-400 font-mono">
                                    {cam.resolution || "1080p"}
                                  </span>
                                </div>
                              </div>
                              <div className="p-3">
                                <h4 className="text-zinc-200 font-bold truncate">
                                  {cam.name}
                                </h4>
                                <p className="text-zinc-500 text-xs truncate">
                                  {cam.location_name}
                                </p>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col">
                        <div className="relative flex-1 bg-black rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                          {streamUrl ? (
                            <img
                              ref={streamImgRef}
                              key={streamUrl}
                              src={streamUrl}
                              alt="Live Stream"
                              crossOrigin="anonymous"
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                console.error(
                                  "Stream error - attempting recovery",
                                );
                                const img = e.target as HTMLImageElement;

                                // Try to reload stream after 2 seconds
                                setTimeout(() => {
                                  if (selectedCamera) {
                                    const baseUrl = streamUrl.split("?")[0];
                                    img.src = `${baseUrl}?t=${Date.now()}`;
                                  }
                                }, 2000);
                              }}
                              onLoad={() => {
                                console.log("Stream loaded successfully");
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <RefreshCw className="animate-spin text-zinc-500 h-8 w-8" />
                              <span className="text-zinc-500 text-sm">
                                Initializing MJPEG stream...
                              </span>
                              <span className="text-zinc-600 text-xs">
                                Waiting for camera feed
                              </span>
                            </div>
                          )}
                          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded text-white text-xs font-mono border border-white/10">
                            LIVE • {selectedCamera.name}
                          </div>
                          <div className="absolute top-4 right-4 flex gap-2">
                            <Badge className="bg-red-500 animate-pulse">
                              STREAMING
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <div className="text-zinc-400 text-sm">
                            <p>
                              Camera ID:{" "}
                              <span className="text-zinc-200 font-mono">
                                {selectedCamera.camera_id}
                              </span>
                            </p>
                            <p>
                              Location:{" "}
                              <span className="text-zinc-200">
                                {selectedCamera.location_name}
                              </span>
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (selectedCamera && streamUrl) {
                                  const baseUrl = streamUrl.split("?")[0];
                                  setStreamUrl(`${baseUrl}?t=${Date.now()}`);
                                  toast.info("Refreshing stream...");
                                }
                              }}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refresh Feed
                            </Button>
                            <Button
                              variant="default"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              onClick={handleRecordAndCreateViolation}
                              disabled={isRecording || !streamUrl}
                            >
                              {isRecording ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Recording...
                                </>
                              ) : (
                                <>
                                  <Video className="h-4 w-4 mr-2" />
                                  Record & Create Violation
                                </>
                              )}
                            </Button>
                            <Button
                              variant="default"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={handleSimulateAI}
                            >
                              <Siren className="h-4 w-4 mr-2" />
                              Triển khai AI Violation
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
              >
                <MapPin className="h-4 w-4 mr-2" /> Current Location: Sector 7-B
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {searched && vehicle ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
          {/* Left: Vehicle Identity Card */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border-none shadow-lg overflow-hidden rounded-2xl">
              <div className="bg-foreground p-6 text-center space-y-2">
                <div className="inline-block bg-background p-2 px-8 rounded-lg border-4 border-primary/20 mb-2">
                  <span className="text-3xl font-black text-foreground tracking-tighter">
                    {vehicle.license_plate}
                  </span>
                </div>
                <Badge className="bg-primary text-primary-foreground block mx-auto w-fit uppercase tracking-widest text-[10px]">
                  Verified Registry
                </Badge>
              </div>
              <CardContent className="p-6 space-y-6 bg-muted/30">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-background shadow-sm flex items-center justify-center text-foreground border">
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">
                        Vehicle Brand
                      </p>
                      <p className="font-bold text-foreground">
                        {vehicle.vehicle_brand}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-background shadow-sm flex items-center justify-center text-foreground border">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">
                        Registered Owner
                      </p>
                      <p className="font-bold text-foreground">
                        {vehicle.owner_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-background shadow-sm flex items-center justify-center text-foreground border">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">
                        Technical Status
                      </p>
                      <Badge
                        variant="outline"
                        className="bg-success text-success-foreground border-none font-black text-[10px]"
                      >
                        VALID REGISTRY
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6 font-bold">
                    <History className="mr-2 h-5 w-5" /> Full History Report
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl py-6 border-2 font-bold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
                  >
                    <ShieldAlert className="mr-2 h-5 w-5" /> Flag / BOLO Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Driver & Violations */}
          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="status" className="w-full">
              <TabsList className="bg-muted p-1.5 rounded-2xl w-full justify-start h-14 border shadow-inner">
                <TabsTrigger
                  value="status"
                  className="rounded-xl px-10 h-full data-[state=active]:bg-background data-[state=active]:shadow-md font-bold text-sm"
                >
                  Security Matrix
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-xl px-10 h-full data-[state=active]:bg-background data-[state=active]:shadow-md font-bold text-sm"
                >
                  Violation Feed
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="rounded-xl px-10 h-full data-[state=active]:bg-background data-[state=active]:shadow-md font-bold text-sm"
                >
                  Unit Log
                </TabsTrigger>
              </TabsList>

              <TabsContent value="status" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-none shadow-md bg-card rounded-2xl border-l-4 border-success">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" /> Driver
                        Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-black text-foreground tracking-tight">
                        CLASS A-1
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        Valid until Oct 2028
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-md bg-card rounded-2xl border-l-4 border-destructive">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />{" "}
                        Active Risks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-black text-destructive tracking-tight">
                        3 PENDING
                      </p>
                      <p className="text-xs text-muted-foreground font-medium italic underline">
                        Requires immediate resolution
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-xl bg-foreground text-background rounded-2xl overflow-hidden relative">
                  <div className="absolute right-[-20px] top-[-20px] h-48 w-48 bg-primary/10 rounded-full blur-3xl"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-display">
                      <ShieldCheck className="h-6 w-6 text-primary" /> Executive
                      Action
                    </CardTitle>
                    <CardDescription className="text-muted-foreground font-medium tracking-tight">
                      Select enforcement procedure for current interaction
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
                    <div className="p-6 rounded-2xl bg-background/5 border border-background/10 hover:bg-background/10 transition-all cursor-pointer group">
                      <div className="h-12 w-12 rounded-xl bg-warning/20 flex items-center justify-center text-warning mb-4 group-hover:scale-110 transition-transform">
                        <FileText className="h-6 w-6" />
                      </div>
                      <h4 className="font-bold text-lg mb-1">
                        Issue Field Ticket
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        Create manual violation record for on-site illegal
                        activity.
                      </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-background/5 border border-background/10 hover:bg-background/10 transition-all cursor-pointer group">
                      <div className="h-12 w-12 rounded-xl bg-info/20 flex items-center justify-center text-info mb-4 group-hover:scale-110 transition-transform">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <h4 className="font-bold text-lg mb-1">
                        Record Interaction
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        Log inspection without issuing a formal citation.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-card/80">
                  <CardContent className="p-0">
                    <div className="p-6 border-b flex items-center justify-between">
                      <h4 className="font-bold text-foreground">
                        Violation History Loop
                      </h4>
                      <Badge variant="secondary" className="font-bold">
                        Total Recorded: {violations.length}
                      </Badge>
                    </div>
                    <div className="divide-y max-h-[400px] overflow-y-auto">
                      {violations.length === 0 ? (
                        <div className="p-10 text-center space-y-2 opacity-40">
                          <CheckCircle2 className="h-12 w-12 mx-auto text-success" />
                          <p className="font-bold text-foreground">
                            No Violations Recorded
                          </p>
                        </div>
                      ) : (
                        violations.map((v) => (
                          <div
                            key={v.id}
                            className="p-6 flex items-start justify-between hover:bg-muted/30 transition-colors group"
                          >
                            <div className="flex gap-4">
                              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0 font-black text-xs">
                                VIO
                              </div>
                              <div>
                                <p className="font-bold text-foreground leading-none mb-1 group-hover:text-primary transition-colors uppercase tracking-tight">
                                  {v.violation_type}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                  <Calendar className="h-3 w-3" />{" "}
                                  {new Date(v.detected_at).toLocaleDateString()}
                                  <span className="h-1 w-1 rounded-full bg-border"></span>
                                  <MapPin className="h-3 w-3" />{" "}
                                  {v.location_name}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-foreground leading-none mb-1">
                                {v.fine_amount
                                  ? `${parseFloat(v.fine_amount).toLocaleString()}đ`
                                  : "---"}
                              </p>
                              <Badge
                                className={
                                  v.status === ViolationStatus.Paid
                                    ? "bg-success text-success-foreground"
                                    : "bg-destructive text-destructive-foreground"
                                }
                              >
                                {v.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : searched && !vehicle ? (
        <Card className="p-20 text-center space-y-6 border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-3xl animate-in zoom-in duration-300">
          <div className="h-24 w-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive shadow-inner">
            <XCircle className="h-12 w-12" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-foreground tracking-tighter">
              NO REGISTRATION FOUND
            </h2>
            <p className="text-muted-foreground font-medium max-w-md mx-auto mt-2">
              The plate entry{" "}
              <span className="text-destructive font-black">
                &quot;{plate}&quot;
              </span>{" "}
              does not exist in the National Traffic Database or is
              unregistered.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              className="px-8 rounded-xl font-bold border-2"
              onClick={() => setPlate("")}
            >
              Clear Data
            </Button>
            <Button className="px-8 rounded-xl font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg">
              Report Unregistered Vehicle
            </Button>
          </div>
        </Card>
      ) : (
        <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-border rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
          <div className="text-center space-y-4 opacity-50 group-hover:opacity-80 transition-opacity z-10">
            <Car className="h-20 w-20 mx-auto text-muted-foreground group-hover:scale-110 transition-transform duration-500" />
            <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">
              Ready for Scanner Input
            </p>
          </div>
        </div>
      )}

      {/* Violation Creation Dialog */}
      <CreateViolationDialog
        open={isViolationDialogOpen}
        onOpenChange={setIsViolationDialogOpen}
        camera={selectedCamera}
        videoUrl={recordedVideoUrl}
        token={token}
        onSuccess={handleViolationSuccess}
      />
    </div>
  );
}
