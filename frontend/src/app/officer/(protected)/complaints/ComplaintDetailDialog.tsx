"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    ComplaintResponse,
    ComplaintsApi,
    Configuration,
    ComplaintActivityResponse,
    ComplaintStatus,
} from "@/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
    MessageSquare,
    History,
    CheckCircle2,
    Clock,
    User,
    ExternalLink,
    ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface ComplaintDetailDialogProps {
    complaint: ComplaintResponse | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated: () => void;
}

export default function ComplaintDetailDialog({
    complaint,
    open,
    onOpenChange,
    onUpdated,
}: ComplaintDetailDialogProps) {
    const { token } = useAuth();
    const [resolution, setResolution] = useState("");
    const [activities, setActivities] = useState<ComplaintActivityResponse[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && complaint && token) {
            fetchActivities();
        }
    }, [open, complaint, token]);

    const fetchActivities = async () => {
        if (!complaint) return;
        try {
            const config = new Configuration({
                basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
                accessToken: token || undefined,
            });
            const complaintsApi = new ComplaintsApi(config);
            const { data } = await complaintsApi.getComplaintActivitiesApiV1ComplaintsComplaintIdActivitiesGet(
                complaint.id
            );
            setActivities(data || []);
        } catch (error) {
            console.error("Failed to fetch complaint activities:", error);
        }
    };

    const handleResolve = async () => {
        if (!complaint || !resolution) {
            toast.error("Please provide a resolution description");
            return;
        }

        try {
            setLoading(true);
            const config = new Configuration({
                basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
                accessToken: token || undefined,
            });
            const complaintsApi = new ComplaintsApi(config);

            await complaintsApi.resolveComplaintApiV1ComplaintsComplaintIdResolvePost(
                complaint.id,
                resolution
            );

            toast.success("Complaint resolved successfully");
            onOpenChange(false);
            setResolution("");
            onUpdated();
        } catch (error) {
            console.error("Failed to resolve complaint:", error);
            toast.error("Failed to resolve complaint");
        } finally {
            setLoading(false);
        }
    };

    if (!complaint) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-md bg-background/95">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="h-6 w-6 text-warning" />
                        <DialogTitle className="text-2xl text-foreground">
                            Complaint Detail: {complaint.complaint_code}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-base text-muted-foreground">
                        Processing citizen complaint regarding traffic violation or service.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Left Column: Complaint Info */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm bg-muted/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center justify-between">
                                    <span>Basic Information</span>
                                    <Badge className={
                                        complaint.status === ComplaintStatus.Resolved ? "bg-success text-success-foreground" :
                                            complaint.status === ComplaintStatus.UnderReview ? "bg-info text-info-foreground" : "bg-warning text-warning-foreground"
                                    }>
                                        {complaint.status?.toUpperCase()}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Title</Label>
                                    <p className="font-bold text-foreground">{complaint.title}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Description</Label>
                                    <p className="text-sm text-foreground leading-relaxed bg-background p-3 rounded border border-border">
                                        {complaint.description}
                                    </p>
                                </div>
                                {complaint.desired_resolution && (
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Desired Resolution</Label>
                                        <p className="text-sm text-slate-600 italic">"{complaint.desired_resolution}"</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Type</Label>
                                        <p className="text-xs font-semibold">{complaint.complaint_type}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Priority</Label>
                                        <p className="text-xs font-semibold">{complaint.priority}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-muted/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                                    <User className="h-4 w-4" /> Complainant Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {!complaint.is_anonymous ? (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Name</span>
                                            <span className="font-medium">{complaint.complainant_name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Phone</span>
                                            <span className="font-medium font-mono">{complaint.complainant_phone}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Email</span>
                                            <span className="font-medium">{complaint.complainant_email}</span>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-center text-muted-foreground italic py-2">Anonymous Complainant</p>
                                )}
                            </CardContent>
                        </Card>

                        {complaint.violation_id && (
                            <Link href={`/officer/violations?id=${complaint.violation_id}`}>
                                <div className="p-4 rounded-xl bg-info/10 border border-info/20 flex items-center justify-between hover:bg-info/20 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-info flex items-center justify-center text-info-foreground">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-info font-bold uppercase tracking-wider">Related Violation</p>
                                            <p className="text-sm font-bold text-info italic">Record #{complaint.violation_id}</p>
                                        </div>
                                    </div>
                                    <ExternalLink className="h-5 w-5 text-info/60 group-hover:text-info" />
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* Right Column: Activities & Resolution */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <History className="h-4 w-4" /> Case History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    {activities.length === 0 ? (
                                        <p className="text-xs text-center py-4 text-muted-foreground italic">No activities recorded yet</p>
                                    ) : (
                                        activities.map((activity) => (
                                            <div key={activity.id} className="relative pl-6 border-l-2 border-border pb-4 last:pb-0">
                                                <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold uppercase text-muted-foreground">{activity.activity_type}</span>
                                                        <span className="text-[10px] text-muted-foreground">{new Date(activity.performed_at).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-xs font-semibold text-foreground">{activity.description}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium italic">By User #{activity.performed_by}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {complaint.status !== ComplaintStatus.Resolved ? (
                            <Card className="border-none shadow-md bg-warning/10 border border-warning/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-warning">
                                        <CheckCircle2 className="h-4 w-4" /> Resolution Action
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="resolution" className="text-xs font-bold text-warning">Official Resolution Statement</Label>
                                        <Textarea
                                            id="resolution"
                                            placeholder="Describe what action was taken to resolve this complaint..."
                                            className="min-h-[120px] bg-background border-warning/20 focus:ring-warning"
                                            value={resolution}
                                            onChange={(e) => setResolution(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        className="w-full bg-warning text-warning-foreground hover:bg-warning/90 shadow-lg shadow-warning/20"
                                        onClick={handleResolve}
                                        disabled={loading}
                                    >
                                        {loading ? "Processing..." : "Submit Resolution"}
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-none shadow-sm bg-success/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-success">
                                        <CheckCircle2 className="h-4 w-4" /> Resolved Case
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-success font-medium">
                                        <Clock className="h-3 w-3" />
                                        Closed on {new Date(complaint.resolved_at!).toLocaleString()}
                                    </div>
                                    {complaint.user_rating && (
                                        <div className="pt-2 border-t border-success/20">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-success">Citizen Rating</span>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < complaint.user_rating! ? "text-yellow-500" : "text-muted-foreground/30"}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                            {complaint.user_feedback && (
                                                <p className="text-[11px] text-success mt-1 italic">"{complaint.user_feedback}"</p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
