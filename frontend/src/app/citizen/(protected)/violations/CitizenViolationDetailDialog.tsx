"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ViolationResponse } from "@/api";
import {
  AlertTriangle,
  Calendar,
  MapPin,
  Car,
  FileText,
  DollarSign,
  Image as ImageIcon,
  Camera,
  Video,
} from "lucide-react";
import { getStatusBadgeVariant } from "@/lib/violation-utils";

interface CitizenViolationDetailDialogProps {
  violation: ViolationResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CitizenViolationDetailDialog({
  violation,
  open,
  onOpenChange,
}: CitizenViolationDetailDialogProps) {
  if (!violation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-gradient-to-br from-slate-950 to-slate-900 border-white/10 text-white shadow-2xl">
        <DialogHeader className="border-b border-white/5 pb-4">
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-3 font-bold tracking-tight">
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span>Violation #{violation.id}</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            View details and evidence for this traffic violation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Top Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <Badge
                variant={getStatusBadgeVariant(violation.status || "")}
                className={`text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full border border-white/10 shadow-lg`}
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full mr-2 bg-current animate-pulse`}
                />
                {violation.status}
              </Badge>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(violation.detected_at).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            {violation.fine_amount && (
              <div className="flex items-center gap-2 bg-rose-500/10 text-rose-500 px-5 py-2 rounded-full border border-rose-500/20 font-black text-sm tracking-tight shadow-inner">
                <DollarSign className="h-4 w-4" />
                {parseFloat(violation.fine_amount).toLocaleString()} VND
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Vehicle & Violation Details */}
            <div className="space-y-6">
              <Card className="border-white/5 bg-white/5 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 bg-white/5 border-b border-white/5">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-slate-300">
                    <Car className="h-4 w-4 text-blue-400" /> Vehicle
                    Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4">
                  <div>
                    <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 mb-1 block">
                      License Plate
                    </Label>
                    <p className="font-mono font-black text-xl text-blue-400 tracking-tighter">
                      {violation.license_plate}
                    </p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 mb-1 block">
                      Type
                    </Label>
                    <p className="font-bold text-slate-200">
                      {violation.vehicle_type || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 mb-1 block">
                      Brand/Model
                    </Label>
                    <p className="font-semibold text-slate-300 text-sm">
                      {violation.vehicle_brand || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 mb-1 block">
                      Color
                    </Label>
                    <p className="font-semibold text-slate-300 text-sm">
                      {violation.vehicle_color || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-rose-500/20 bg-rose-500/5 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 bg-rose-500/5 border-b border-rose-500/10">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-rose-300">
                    <FileText className="h-4 w-4 text-rose-500" /> Violation
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-4">
                  <div>
                    <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-rose-500/60 mb-1 block">
                      Violation Type
                    </Label>
                    <p className="font-black text-lg text-slate-100 leading-tight">
                      {violation.violation_type}
                    </p>
                  </div>
                  {violation.violation_description && (
                    <div>
                      <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-rose-500/60 mb-1 block">
                        Description
                      </Label>
                      <div className="bg-white/5 border-l-4 border-rose-500 p-3 rounded-r-lg">
                        <p className="text-sm text-slate-300 leading-relaxed italic">
                          {violation.violation_description}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 shadow-inner">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 block">
                        Penalty Points
                      </Label>
                      <p className="text-3xl font-black text-rose-500">
                        -{violation.points_deducted || 0}
                      </p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 shadow-inner">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 block">
                        Fine Amount
                      </Label>
                      <p className="text-2xl font-black text-rose-500">
                        {violation.fine_amount
                          ? `${parseFloat(violation.fine_amount).toLocaleString()}`
                          : "0"}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">VND</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-white/5 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 bg-white/5 border-b border-white/5">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-slate-300">
                    <MapPin className="h-4 w-4 text-emerald-400" /> Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                      Location
                    </span>
                    <span className="text-sm font-bold text-slate-200">
                      {violation.location_name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                      Camera Unit
                    </span>
                    <span className="font-mono text-xs font-black text-emerald-400 flex items-center gap-2">
                      <Camera className="h-3 w-3" />{" "}
                      {violation.camera_id || "N/A"}
                    </span>
                  </div>
                  {violation.latitude && violation.longitude && (
                    <div className="text-[10px] text-right font-mono text-slate-600 pt-1">
                      COORD: {Number(violation.latitude).toFixed(6)},{" "}
                      {Number(violation.longitude).toFixed(6)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Evidence */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-slate-500">
                  <ImageIcon className="h-4 w-4" /> Evidence
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {/* Video Evidence */}
                  {violation.video_evidence &&
                  violation.video_evidence.cloudinary_url ? (
                    <div className="space-y-4">
                      <div className="relative group rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all duration-500 shadow-2xl bg-black">
                        <video
                          controls
                          className="w-full h-auto max-h-96"
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
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                          <div className="flex items-center gap-2">
                            <Video className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              Video Evidence
                            </span>
                          </div>
                        </div>
                      </div>
                      {violation.video_evidence.duration && (
                        <p className="text-xs text-slate-400 text-center">
                          Duration: {violation.video_evidence.duration} seconds
                        </p>
                      )}
                    </div>
                  ) : violation.evidence_images &&
                    violation.evidence_images.length > 0 ? (
                    violation.evidence_images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all duration-500 shadow-2xl"
                      >
                        <img
                          src={img}
                          alt={`Evidence ${idx + 1}`}
                          className="w-full h-auto object-cover max-h-80 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                          <p className="text-white font-bold text-xs uppercase tracking-widest">
                            Evidence Photo {idx + 1}
                          </p>
                          <p className="text-slate-400 text-[10px]">
                            {new Date(violation.detected_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : violation.evidence_gif ? (
                    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                      <img
                        src={violation.evidence_gif}
                        alt="Evidence GIF"
                        className="w-full h-auto"
                      />
                    </div>
                  ) : (
                    <div className="h-64 bg-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5">
                      <Camera className="h-10 w-10 mb-2 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">
                        No evidence available
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {violation.legal_reference && (
                <Card className="border-amber-500/20 bg-amber-500/5 shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="pb-3 bg-amber-500/5 border-b border-amber-500/10">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-amber-300">
                      <FileText className="h-4 w-4 text-amber-500" /> Legal
                      Reference
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {violation.legal_reference}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card className="border-white/5 bg-white/5 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 bg-white/5 border-b border-white/5">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-slate-300">
                    <AlertTriangle className="h-4 w-4 text-blue-400" /> Next
                    Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3 text-sm text-slate-300">
                    {violation.status === "PENDING" && (
                      <p>
                        This violation is currently under review. You will be
                        notified once it has been processed.
                      </p>
                    )}
                    {violation.status === "APPROVED" && (
                      <div className="space-y-2">
                        <p className="font-semibold text-amber-400">
                          Payment Required
                        </p>
                        <p>
                          This violation has been approved. Please proceed to
                          payment to avoid additional penalties.
                        </p>
                      </div>
                    )}
                    {violation.status === "PAID" && (
                      <p className="text-green-400 font-semibold">
                        ✓ Payment received. This violation has been settled.
                      </p>
                    )}
                    {violation.status === "REJECTED" && (
                      <p className="text-slate-400">
                        This violation has been rejected and no payment is
                        required.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
