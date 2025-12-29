"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CameraResponse, ViolationCreate } from "@/api";
import { Loader2, FileVideo, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface CreateViolationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  camera: CameraResponse | null;
  videoUrl?: string | null;
  token: string | null;
  onSuccess?: () => void;
}

const VIOLATION_TYPES = [
  { value: "RED_LIGHT", label: "Red Light Violation" },
  { value: "SPEEDING", label: "Speeding" },
  { value: "WRONG_LANE", label: "Wrong Lane" },
  { value: "NO_HELMET", label: "No Helmet" },
  { value: "ILLEGAL_PARKING", label: "Illegal Parking" },
  { value: "PHONE_WHILE_DRIVING", label: "Phone While Driving" },
  { value: "NO_SEATBELT", label: "No Seatbelt" },
  { value: "OVERLOAD", label: "Overload" },
  { value: "OTHER", label: "Other" },
];

const VEHICLE_TYPES = [
  { value: "car", label: "Car" },
  { value: "motorcycle", label: "Motorcycle" },
  { value: "truck", label: "Truck" },
  { value: "bus", label: "Bus" },
  { value: "other", label: "Other" },
];

export function CreateViolationDialog({
  open,
  onOpenChange,
  camera,
  videoUrl,
  token,
  onSuccess,
}: CreateViolationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    licensePlate: "",
    violationType: "",
    vehicleType: "",
    vehicleColor: "",
    vehicleBrand: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.licensePlate || !formData.violationType) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload: ViolationCreate = {
        license_plate: formData.licensePlate,
        violation_type: formData.violationType,
        vehicle_type: formData.vehicleType || null,
        vehicle_color: formData.vehicleColor || null,
        vehicle_brand: formData.vehicleBrand || null,
        latitude: camera?.latitude || null,
        longitude: camera?.longitude || null,
        location_name: camera?.location_name || null,
        camera_id: camera?.camera_id || null,
        detected_at: new Date().toISOString(),
        confidence_score: 1.0, // Officer-recorded violations have 100% confidence
        evidence_images: videoUrl ? [videoUrl] : [],
        ai_metadata: {
          officer_recorded: true,
          has_video_evidence: !!videoUrl,
          recorded_at: new Date().toISOString(),
        },
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
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create violation");
      }

      toast.success("Violation created successfully!");

      // Reset form
      setFormData({
        licensePlate: "",
        violationType: "",
        vehicleType: "",
        vehicleColor: "",
        vehicleBrand: "",
      });

      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create violation:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create violation"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileVideo className="h-5 w-5 text-primary" />
            Create Traffic Violation
          </DialogTitle>
          <DialogDescription>
            Record a traffic violation with video evidence. All fields marked
            with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Video Evidence Indicator */}
          {videoUrl && (
            <div className="p-3 bg-success/10 border border-success/20 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-success">
                  Video Evidence Attached
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {videoUrl}
                </p>
              </div>
            </div>
          )}

          {/* Camera Info */}
          {camera && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Camera Location
              </p>
              <p className="text-sm font-semibold">
                {camera.name} - {camera.location_name}
              </p>
            </div>
          )}

          {/* License Plate */}
          <div className="space-y-2">
            <Label htmlFor="licensePlate">
              License Plate <span className="text-destructive">*</span>
            </Label>
            <Input
              id="licensePlate"
              placeholder="e.g., 30A-12345"
              value={formData.licensePlate}
              onChange={(e) =>
                handleInputChange("licensePlate", e.target.value.toUpperCase())
              }
              className="uppercase font-mono"
              required
            />
          </div>

          {/* Violation Type */}
          <div className="space-y-2">
            <Label htmlFor="violationType">
              Violation Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.violationType}
              onValueChange={(value) =>
                handleInputChange("violationType", value)
              }
              required
            >
              <SelectTrigger id="violationType">
                <SelectValue placeholder="Select violation type" />
              </SelectTrigger>
              <SelectContent>
                {VIOLATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select
                value={formData.vehicleType}
                onValueChange={(value) =>
                  handleInputChange("vehicleType", value)
                }
              >
                <SelectTrigger id="vehicleType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleColor">Vehicle Color</Label>
              <Input
                id="vehicleColor"
                placeholder="e.g., Black"
                value={formData.vehicleColor}
                onChange={(e) =>
                  handleInputChange("vehicleColor", e.target.value)
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleBrand">Vehicle Brand</Label>
            <Input
              id="vehicleBrand"
              placeholder="e.g., Honda, Toyota"
              value={formData.vehicleBrand}
              onChange={(e) =>
                handleInputChange("vehicleBrand", e.target.value)
              }
            />
          </div>

          {/* Warning about missing video */}
          {!videoUrl && (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning">
                  No Video Evidence
                </p>
                <p className="text-xs text-muted-foreground">
                  This violation will be created without video evidence. Consider
                  recording the stream first.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Violation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
