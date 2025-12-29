import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ViolationResponse } from "@/api";
import {
  AlertTriangle,
  Calendar,
  Car,
  Camera,
  FileText,
  DollarSign,
  Image as ImageIcon,
  MapPin,
  Video,
} from "lucide-react";
import { getStatusBadgeVariant, getStatusColor } from "@/lib/violation-utils";

interface ViolationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  violation: ViolationResponse | null;
}

export function ViolationDetailsDialog({
  open,
  onOpenChange,
  violation,
}: ViolationDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Violation Details #{violation?.id}
          </DialogTitle>
          <DialogDescription>
            Complete information about this traffic violation
          </DialogDescription>
        </DialogHeader>

        {violation && (
          <div className="space-y-6 mt-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge
                variant={getStatusBadgeVariant(violation.status || "")}
                className={`${getStatusColor(violation.status || "")} text-base px-4 py-2`}
              >
                {violation.status}
              </Badge>
              <div className="text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 inline mr-1" />
                {new Date(violation.detected_at).toLocaleString()}
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
                  <Label className="text-muted-foreground">License Plate</Label>
                  <p className="font-mono font-bold text-lg">
                    {violation.license_plate}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Vehicle Type</Label>
                  <p className="font-semibold">
                    {violation.vehicle_type || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Color</Label>
                  <p className="font-semibold">
                    {violation.vehicle_color || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Brand</Label>
                  <p className="font-semibold">
                    {violation.vehicle_brand || "N/A"}
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
                    {violation.violation_type}
                  </p>
                </div>
                {violation.violation_description && (
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="text-sm">{violation.violation_description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">
                      Confidence Score
                    </Label>
                    <p className="font-semibold">
                      {violation.confidence_score
                        ? `${(violation.confidence_score * 100).toFixed(2)}%`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Priority</Label>
                    <p className="font-semibold">{violation.priority}</p>
                  </div>
                </div>
                {violation.legal_reference && (
                  <div>
                    <Label className="text-muted-foreground">
                      Legal Reference
                    </Label>
                    <p className="text-sm">{violation.legal_reference}</p>
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
                    {violation.location_name || "N/A"}
                  </p>
                </div>
                {(violation.latitude || violation.longitude) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Latitude</Label>
                      <p className="font-mono text-sm">{violation.latitude}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Longitude</Label>
                      <p className="font-mono text-sm">{violation.longitude}</p>
                    </div>
                  </div>
                )}
                {violation.camera_id && (
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-1">
                      <Camera className="h-4 w-4" />
                      Camera ID
                    </Label>
                    <p className="font-mono">{violation.camera_id}</p>
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
                    {violation.fine_amount
                      ? `${parseFloat(violation.fine_amount).toLocaleString()} VND`
                      : "N/A"}
                  </p>
                </div>
                {violation.points_deducted && (
                  <div>
                    <Label className="text-muted-foreground">
                      Points Deducted
                    </Label>
                    <p className="font-bold text-xl text-orange-600">
                      {violation.points_deducted}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Evidence */}
            {violation.video_evidence &&
              violation.video_evidence.cloudinary_url && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Video Evidence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden bg-black">
                      <video
                        controls
                        className="w-full h-auto"
                        poster={
                          violation.video_evidence.thumbnail_url || undefined
                        }
                      >
                        <source
                          src={violation.video_evidence.cloudinary_url}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    {violation.video_evidence.duration && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Duration: {violation.video_evidence.duration}s
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

            {/* Evidence Images */}
            {violation.evidence_images &&
              violation.evidence_images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Evidence Images
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {violation.evidence_images.map((image, idx) => (
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
            {violation.evidence_gif && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evidence GIF</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={violation.evidence_gif}
                      alt="Evidence GIF"
                      className="w-full h-auto"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Information */}
            {violation.reviewed_by && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Review Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">
                        Reviewed By
                      </Label>
                      <p className="font-semibold">
                        User #{violation.reviewed_by}
                      </p>
                    </div>
                    {violation.reviewed_at && (
                      <div>
                        <Label className="text-muted-foreground">
                          Reviewed At
                        </Label>
                        <p className="font-semibold">
                          {new Date(violation.reviewed_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                  {violation.review_notes && (
                    <div>
                      <Label className="text-muted-foreground">
                        Review Notes
                      </Label>
                      <p className="text-sm bg-muted p-3 rounded-md">
                        {violation.review_notes}
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
                  <p>{new Date(violation.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Updated At</Label>
                  <p>{new Date(violation.updated_at).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
