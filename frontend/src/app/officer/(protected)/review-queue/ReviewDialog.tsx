"use client";

import { useState } from "react";
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
    ViolationResponse,
    OfficerApi,
    Configuration,
    ViolationReview,
} from "@/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, CheckCircle2, XCircle, FileSearch, Calendar, MapPin, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ReviewDialogProps {
    violation: ViolationResponse | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReviewed: () => void;
}

export default function ReviewDialog({
    violation,
    open,
    onOpenChange,
    onReviewed,
}: ReviewDialogProps) {
    const { token } = useAuth();
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReview = async (action: "approve" | "reject") => {
        if (!violation) return;

        try {
            setLoading(true);
            const config = new Configuration({
                basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
                accessToken: token || undefined,
            });
            const officerApi = new OfficerApi(config);

            const review: ViolationReview = {
                action,
                notes: notes || undefined,
            };

            await officerApi.reviewViolationApiV1OfficerViolationsViolationIdReviewPost(
                violation.id,
                review
            );

            toast.success(`Violation ${action}ed successfully`);
            onOpenChange(false);
            setNotes("");
            onReviewed();
        } catch (error) {
            console.error(`Failed to ${action} violation:`, error);
            toast.error(`Failed to ${action} violation`);
        } finally {
            setLoading(false);
        }
    };

    if (!violation) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto backdrop-blur-md bg-background/90">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <FileSearch className="h-6 w-6" />
                        <DialogTitle className="text-2xl">Review Violation #{violation.id}</DialogTitle>
                    </div>
                    <DialogDescription className="text-base text-muted-foreground">
                        Carefully review the evidence and the AI detection result before taking action.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Evidence Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-success" /> Evidence Images
                            </h3>
                            <Card className="overflow-hidden border-2 border-muted">
                                <CardContent className="p-0">
                                    <div className="grid grid-cols-1 gap-2 bg-muted/20 p-2">
                                        {violation.evidence_images && violation.evidence_images.length > 0 ? (
                                            violation.evidence_images.map((img, idx) => (
                                                <img
                                                    key={idx}
                                                    src={img}
                                                    alt="Violation evidence"
                                                    className="w-full h-auto rounded-md object-contain max-h-64"
                                                />
                                            ))
                                        ) : violation.evidence_gif ? (
                                            <img
                                                src={violation.evidence_gif}
                                                alt="Violation evidence"
                                                className="w-full h-auto rounded-md object-contain max-h-64"
                                            />
                                        ) : (
                                            <div className="h-48 flex items-center justify-center text-muted-foreground">
                                                No visual evidence available
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold">Violation Details</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground flex items-center gap-1">
                                            <Car className="h-3 w-3" /> Vehicle Plate
                                        </Label>
                                        <p className="font-mono font-bold text-lg">{violation.license_plate}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> Type
                                        </Label>
                                        <p className="font-semibold text-destructive">{violation.violation_type}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> Location
                                        </Label>
                                        <p className="text-xs">{violation.location_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> Date & Time
                                        </Label>
                                        <p className="text-xs">{new Date(violation.detected_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>AI Confidence Score</Label>
                                    <Badge variant={violation.confidence_score && violation.confidence_score > 0.8 ? "default" : "secondary"}>
                                        {violation.confidence_score ? `${(violation.confidence_score * 100).toFixed(1)}%` : "N/A"}
                                    </Badge>
                                </div>
                                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${violation.confidence_score && violation.confidence_score > 0.8 ? "bg-success" : "bg-warning"}`}
                                        style={{ width: `${(violation.confidence_score || 0) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Review Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Enter your notes here about the approval or rejection..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-[100px] border-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            onClick={() => handleReview("reject")}
                            disabled={loading}
                            className="px-6"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject Violation
                        </Button>
                        <Button
                            variant="default"
                            onClick={() => handleReview("approve")}
                            disabled={loading}
                            className="bg-success hover:bg-success/90 text-success-foreground px-6"
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve Violation
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
