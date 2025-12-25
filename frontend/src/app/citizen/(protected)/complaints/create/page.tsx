"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getCitizenApi, createComplaint } from "@/api/citizen-api";
import { ComplaintType, ViolationResponse } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CreateComplaintPage() {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [violations, setViolations] = useState<ViolationResponse[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        complaint_type: "OTHER" as ComplaintType,
        desired_resolution: "",
        violation_id: "" as string | number,
        vehicle_id: "" as string | number,
        is_anonymous: false,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const citizenApi = getCitizenApi(token);
                const { data: violationsData } = await citizenApi.getMyViolationsApiV1CitizenMyViolationsGet();
                setViolations(violationsData.violations || []);

                const { data: vehiclesData } = await citizenApi.getMyVehiclesApiV1CitizenMyVehiclesGet();
                setVehicles(vehiclesData || []);
            } catch (error) {
                console.error("Failed to fetch reference data:", error);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            setLoading(true);

            // Prepare request data
            const requestData = {
                title: formData.title,
                description: formData.description,
                complaint_type: formData.complaint_type,
                desired_resolution: formData.desired_resolution || undefined,
                violation_id: formData.violation_id ? Number(formData.violation_id) : undefined,
                vehicle_id: formData.vehicle_id ? Number(formData.vehicle_id) : undefined,
                is_anonymous: formData.is_anonymous,
            };

            await createComplaint(token, requestData);

            toast.success("Complaint filed successfully");
            router.push("/citizen/complaints");
        } catch (error) {
            console.error("Failed to file complaint:", error);
            toast.error("Failed to file complaint. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/citizen/complaints">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">File a Complaint</h1>
                    <p className="text-muted-foreground font-medium">
                        Report a system error, dispute a violation, or provide feedback
                    </p>
                </div>
            </div>

            <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-3xl rounded-3xl overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="border-b bg-muted/30">
                        <CardTitle>Complaint Details</CardTitle>
                        <CardDescription>Please provide accurate information to help us resolve your case quickly.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="Brief summary of your complaint"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="type">Complaint Type</Label>
                                <Select
                                    value={formData.complaint_type}
                                    onValueChange={(value) => setFormData({ ...formData, complaint_type: value as ComplaintType })}
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VIOLATION_DISPUTE">Violation Dispute</SelectItem>
                                        <SelectItem value="FALSE_POSITIVE">False Positive</SelectItem>
                                        <SelectItem value="MISSING_VIOLATION">Missing Violation</SelectItem>
                                        <SelectItem value="OFFICER_BEHAVIOR">Officer Behavior</SelectItem>
                                        <SelectItem value="SYSTEM_ERROR">System Error</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="violation">Related Violation (Optional)</Label>
                                <Select
                                    value={formData.violation_id?.toString()}
                                    onValueChange={(value) => setFormData({ ...formData, violation_id: value })}
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value=" ">None</SelectItem>
                                        {violations.map((v) => (
                                            <SelectItem key={v.id} value={v.id.toString()}>
                                                {v.violation_type} - {v.license_plate} ({new Date(v.detected_at).toLocaleDateString()})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Detailed Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe exactly what happened..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                className="min-h-[150px] rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="resolution">Desired Resolution</Label>
                            <Input
                                id="resolution"
                                placeholder="What would you like us to do?"
                                value={formData.desired_resolution}
                                onChange={(e) => setFormData({ ...formData, desired_resolution: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-3 bg-muted/30 border-t py-4">
                        <Link href="/citizen/complaints">
                            <Button type="button" variant="outline" className="rounded-full">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit Complaint
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
