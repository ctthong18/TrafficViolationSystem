"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    ComplaintResponse,
    ComplaintActivityResponse,
    ComplaintStatus,
} from "@/api";
import { getComplaintsApi } from "@/api/citizen-api";
import { useAuth } from "@/contexts/AuthContext";
import {
    MessageSquare,
    History,
    CheckCircle2,
    Clock,
    ArrowLeft,
    AlertTriangle,
    Star,
    Send,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

export default function CitizenComplaintDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { token } = useAuth();
    const [complaint, setComplaint] = useState<ComplaintResponse | null>(null);
    const [activities, setActivities] = useState<ComplaintActivityResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => {
        if (token && id) {
            fetchComplaintDetails();
        }
    }, [token, id]);

    const fetchComplaintDetails = async () => {
        try {
            setLoading(true);
            const complaintsApi = getComplaintsApi(token);
            const { data } = await complaintsApi.getComplaintDetailApiV1ComplaintsComplaintIdGet(Number(id));
            setComplaint(data);

            const { data: activityData } = await complaintsApi.getComplaintActivitiesApiV1ComplaintsComplaintIdActivitiesGet(Number(id));
            setActivities(activityData || []);

            if (data.user_rating) setRating(data.user_rating);
            if (data.user_feedback) setFeedback(data.user_feedback);
        } catch (error) {
            console.error("Failed to fetch complaint details:", error);
            toast.error("Failed to load complaint details");
        } finally {
            setLoading(false);
        }
    };

    const handleRate = async () => {
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        try {
            setSubmittingRating(true);
            const complaintsApi = getComplaintsApi(token);
            await complaintsApi.rateComplaintResolutionApiV1ComplaintsComplaintIdRatePost(
                Number(id),
                rating,
                feedback
            );
            toast.success("Thank you for your feedback!");
            fetchComplaintDetails();
        } catch (error) {
            console.error("Failed to submit rating:", error);
            toast.error("Failed to submit rating");
        } finally {
            setSubmittingRating(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case ComplaintStatus.Resolved:
                return <Badge className="bg-success text-success-foreground rounded-full">Resolved</Badge>;
            case ComplaintStatus.UnderReview:
                return <Badge className="bg-info text-info-foreground rounded-full">In Review</Badge>;
            case ComplaintStatus.Pending:
                return <Badge className="bg-warning text-warning-foreground rounded-full">Pending</Badge>;
            default:
                return <Badge variant="secondary" className="rounded-full">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-bold">Complaint not found</h2>
                <Link href="/citizen/complaints">
                    <Button variant="link">Back to list</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/citizen/complaints">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">Case: {complaint.complaint_code}</h1>
                            {getStatusBadge(complaint.status)}
                        </div>
                        <p className="text-muted-foreground font-medium">Filed on {new Date(complaint.created_at).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-xl bg-card/60 backdrop-blur-3xl rounded-3xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Complaint Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Title</Label>
                                <p className="text-xl font-bold text-foreground">{complaint.title}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Description</Label>
                                <p className="text-foreground bg-muted/20 p-4 rounded-2xl border border-border/50 leading-relaxed">
                                    {complaint.description}
                                </p>
                            </div>
                            {complaint.desired_resolution && (
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Desired Resolution</Label>
                                    <p className="text-info font-medium italic">"{complaint.desired_resolution}"</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Type</Label>
                                    <p className="text-xs font-black">{complaint.complaint_type}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Priority</Label>
                                    <p className="text-xs font-black">{complaint.priority}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Violation ID</Label>
                                    <p className="text-xs font-black">#{complaint.violation_id || "None"}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Vehicle ID</Label>
                                    <p className="text-xs font-black">#{complaint.vehicle_id || "None"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {complaint.status === ComplaintStatus.Resolved && (
                        <Card className="border-none shadow-xl bg-success/5 border-2 border-success/20 rounded-3xl overflow-hidden">
                            <CardHeader className="bg-success/10 border-b border-success/20">
                                <CardTitle className="text-success flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Resolution Content
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <p className="text-foreground leading-relaxed">
                                    The officer has resolved your complaint. Please check the history for detailed steps.
                                </p>

                                <div className="pt-6 border-t border-success/20 space-y-4">
                                    <Label className="text-sm font-bold">Rate our resolution</Label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <button
                                                key={i}
                                                onClick={() => !complaint.user_rating && setRating(i)}
                                                className={`transition-all ${complaint.user_rating ? 'cursor-default' : 'hover:scale-110 active:scale-95'}`}
                                            >
                                                <Star
                                                    className={`h-8 w-8 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {!complaint.user_rating ? (
                                        <div className="space-y-4">
                                            <Textarea
                                                placeholder="Additional feedback (optional)..."
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                                className="rounded-2xl bg-background/50 border-success/20 focus:ring-success"
                                            />
                                            <Button
                                                onClick={handleRate}
                                                disabled={submittingRating || rating === 0}
                                                className="w-full rounded-full bg-success hover:bg-success/90 shadow-lg shadow-success/20"
                                            >
                                                {submittingRating ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4 mr-2" />
                                                        Submit Feedback
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="bg-success/10 p-4 rounded-2xl italic text-success text-sm">
                                            " {complaint.user_feedback} "
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-xl bg-card/60 backdrop-blur-3xl rounded-3xl overflow-hidden min-h-[400px]">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                <History className="h-4 w-4" />
                                Processing History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6 relative">
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border"></div>
                                {activities.length === 0 ? (
                                    <p className="text-xs text-center py-8 text-muted-foreground italic">No activities yet</p>
                                ) : (
                                    activities.map((activity, idx) => (
                                        <div key={activity.id} className="relative pl-8">
                                            <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-background border-2 border-primary z-10"></div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase text-primary tracking-tighter">{activity.activity_type}</span>
                                                    <span className="text-[10px] text-muted-foreground">{new Date(activity.performed_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs font-bold text-foreground">{activity.description}</p>
                                                <p className="text-[10px] text-muted-foreground">{new Date(activity.performed_at).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-card/60 backdrop-blur-3xl rounded-3xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="text-sm font-bold">Assigned Officer</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {complaint.assigned_officer_id ? (
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Officer ID: {complaint.assigned_officer_id}</p>
                                        <p className="text-xs text-muted-foreground">Assigned at {new Date(complaint.assigned_at!).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Clock className="h-10 w-10 p-2 bg-muted rounded-full" />
                                    <p className="text-xs italic">Waiting for officer assignment...</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
