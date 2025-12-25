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
import {
    ViolationResponse,
    ViolationStatus,
} from "@/api";
import {
    AlertTriangle,
    Calendar,
    MapPin,
    Car,
    FileText,
    DollarSign,
    Image as ImageIcon,
    Camera,
    User,
    History,
} from "lucide-react";

interface ViolationDetailDialogProps {
    violation: ViolationResponse | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ViolationDetailDialog({
    violation,
    open,
    onOpenChange,
}: ViolationDetailDialogProps) {
    if (!violation) return null;

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
            default:
                return "text-gray-600";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-slate-950/90 border-white/10 text-white shadow-2xl">
                <DialogHeader className="border-b border-white/5 pb-4">
                    <DialogTitle className="text-xl sm:text-2xl flex items-center gap-3 font-bold tracking-tight">
                        <div className="p-2 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <span>Violation Record #{violation.id}</span>
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Official record of traffic law violation
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
                                <div className={`h-1.5 w-1.5 rounded-full mr-2 bg-current animate-pulse`} />
                                {violation.status}
                            </Badge>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(violation.detected_at).toLocaleString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
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
                                        <Car className="h-4 w-4 text-blue-400" /> Vehicle Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4">
                                    <div>
                                        <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 mb-1 block">License Plate</Label>
                                        <p className="font-mono font-black text-xl text-blue-400 tracking-tighter">{violation.license_plate}</p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 mb-1 block">Type</Label>
                                        <p className="font-bold text-slate-200">{violation.vehicle_type || "N/A"}</p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 mb-1 block">Brand/Model</Label>
                                        <p className="font-semibold text-slate-300 text-sm">{violation.vehicle_brand || "N/A"}</p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 mb-1 block">Color</Label>
                                        <p className="font-semibold text-slate-300 text-sm">{violation.vehicle_color || "N/A"}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-rose-500/20 bg-rose-500/5 shadow-2xl rounded-2xl overflow-hidden">
                                <CardHeader className="pb-3 bg-rose-500/5 border-b border-rose-500/10">
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-rose-300">
                                        <FileText className="h-4 w-4 text-rose-500" /> Offense Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5 pt-4">
                                    <div>
                                        <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-rose-500/60 mb-1 block">Violation Type</Label>
                                        <p className="font-black text-lg text-slate-100 leading-tight">{violation.violation_type}</p>
                                    </div>
                                    {violation.violation_description && (
                                        <div>
                                            <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-rose-500/60 mb-1 block">Legal Statement</Label>
                                            <div className="bg-white/5 border-l-4 border-rose-500 p-3 rounded-r-lg">
                                                <p className="text-sm text-slate-300 leading-relaxed italic">
                                                    {violation.violation_description}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 shadow-inner">
                                            <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 block">Penalty Points</Label>
                                            <p className="text-3xl font-black text-rose-500">-{violation.points_deducted || 0}</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 shadow-inner">
                                            <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 block">AI Confidence</Label>
                                            <div className="flex items-end gap-2">
                                                <p className="text-3xl font-black text-blue-500">{(violation.confidence_score ? violation.confidence_score * 100 : 0).toFixed(0)}%</p>
                                                <div className="h-2 w-full bg-white/10 rounded-full mb-2 overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${(violation.confidence_score || 0) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-white/5 bg-white/5 shadow-2xl rounded-2xl overflow-hidden">
                                <CardHeader className="pb-3 bg-white/5 border-b border-white/5">
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-slate-300">
                                        <MapPin className="h-4 w-4 text-emerald-400" /> Incident Scene
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-4">
                                    <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Location</span>
                                        <span className="text-sm font-bold text-slate-200">{violation.location_name || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Camera Unit</span>
                                        <span className="font-mono text-xs font-black text-emerald-400 flex items-center gap-2">
                                            <Camera className="h-3 w-3" /> {violation.camera_id || "N/A"}
                                        </span>
                                    </div>
                                    {violation.latitude && violation.longitude && (
                                        <div className="text-[10px] text-right font-mono text-slate-600 pt-1">
                                            COORD: {Number(violation.latitude).toFixed(6)}, {Number(violation.longitude).toFixed(6)}
                                        </div>
                                    )}

                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Evidence & History */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-slate-500">
                                    <ImageIcon className="h-4 w-4" /> Digital Evidence
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {violation.evidence_images && violation.evidence_images.length > 0 ? (
                                        violation.evidence_images.map((img, idx) => (
                                            <div key={idx} className="relative group rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
                                                <img
                                                    src={img}
                                                    alt={`Evidence ${idx + 1}`}
                                                    className="w-full h-auto object-cover max-h-80 group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                                    <p className="text-white font-bold text-xs uppercase tracking-widest">Capture Point {idx + 1}</p>
                                                    <p className="text-slate-400 text-[10px]">{new Date(violation.detected_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : violation.evidence_gif ? (
                                        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                            <img src={violation.evidence_gif} alt="Evidence Record" className="w-full h-auto" />
                                        </div>
                                    ) : (
                                        <div className="h-64 bg-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5 group hover:border-white/10 transition-colors">
                                            <Camera className="h-10 w-10 mb-2 opacity-20" />
                                            <p className="text-xs font-bold uppercase tracking-widest">No evidence found</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {violation.reviewed_by && (
                                <Card className="border-white/10 bg-white/5 shadow-2xl rounded-2xl overflow-hidden">
                                    <CardHeader className="pb-3 bg-white/5 border-b border-white/10">
                                        <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-slate-300">
                                            <History className="h-4 w-4 text-amber-400" /> Administrative Action
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-5 pt-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shadow-inner">
                                                <User className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-0.5">Reviewed By</p>
                                                <p className="text-sm font-bold text-slate-200">Officer ID #{violation.reviewed_by}</p>
                                            </div>
                                        </div>
                                        {violation.review_notes && (
                                            <div className="bg-white/5 p-4 rounded-xl border-l-4 border-amber-500/50">
                                                <p className="text-[10px] uppercase font-black text-amber-500/60 mb-2 tracking-widest">Administrative Notes</p>
                                                <p className="text-sm text-slate-400 leading-relaxed italic">
                                                    "{violation.review_notes}"
                                                </p>
                                            </div>
                                        )}
                                        {violation.reviewed_at && (
                                            <div className="text-[10px] text-right font-mono text-slate-600 italic">
                                                PROCESSED {new Date(violation.reviewed_at).toLocaleString().toUpperCase()}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
