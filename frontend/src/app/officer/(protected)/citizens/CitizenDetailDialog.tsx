"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    UserResponse,
    VehicleResponse,
    ViolationResponse,
    VehiclesApi,
    ViolationsApi,
    Configuration,
    DrivingLicensesApi,
    DrivingLicenseResponse,
} from "@/api";
import {
    User,
    Mail,
    Phone,
    CreditCard,
    Car,
    AlertTriangle,
    Calendar,
    ShieldCheck,
    FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface CitizenDetailDialogProps {
    citizen: UserResponse | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CitizenDetailDialog({
    citizen,
    open,
    onOpenChange,
}: CitizenDetailDialogProps) {
    const { token } = useAuth();
    const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
    const [violations, setViolations] = useState<ViolationResponse[]>([]);
    const [license, setLicense] = useState<DrivingLicenseResponse | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && citizen && token) {
            fetchCitizenData();
        }
    }, [open, citizen, token]);

    const fetchCitizenData = async () => {
        if (!citizen) return;
        try {
            setLoading(true);
            const config = new Configuration({
                basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
                accessToken: token || undefined,
            });

            const vehiclesApi = new VehiclesApi(config);
            const violationsApi = new ViolationsApi(config);
            const licensesApi = new DrivingLicensesApi(config);

            // Fetch vehicles by owner name (assuming full_name can be used)
            // Note: This might need a better API if available, but based on docs this is what we have
            const { data: vehiclesData } = await vehiclesApi.getVehiclesApiV1VehiclesGet(
                undefined,
                citizen.full_name
            );
            setVehicles(vehiclesData || []);

            // Fetch violations for each vehicle
            let allViolations: ViolationResponse[] = [];
            if (vehiclesData && vehiclesData.length > 0) {
                for (const vehicle of vehiclesData) {
                    const { data: vData } = await violationsApi.getViolationsApiV1ViolationsGet(
                        0,
                        100,
                        undefined,
                        vehicle.license_plate
                    );
                    if (vData.violations) {
                        allViolations = [...allViolations, ...vData.violations];
                    }
                }
            }
            setViolations(allViolations);

            // Fetch license status (trying identification_number as license number)
            try {
                const { data: licenseData } = await licensesApi.checkLicenseStatusApiV1DrivingLicensesLicenseNumberStatusGet(
                    citizen.identification_number
                );
                setLicense(licenseData);
            } catch (e) {
                console.log("Could not find license for citizen");
                setLicense(null);
            }
        } catch (error) {
            console.error("Failed to fetch citizen data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!citizen) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-sm border-white/10">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
                        <div className="p-2 rounded-full bg-primary/10">
                            <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <span className="truncate">Citizen Profile: {citizen.full_name}</span>
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Detailed information, vehicles, and violation history
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 mt-4">
                    {/* Header Info */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 bg-muted/30 p-4 rounded-xl border border-white/5">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                                        <User className="h-3 w-3" /> Username
                                    </Label>
                                    <p className="font-semibold">{citizen.username}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                                        <Mail className="h-3 w-3" /> Email
                                    </Label>
                                    <p className="font-semibold break-all">{citizen.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                                        <CreditCard className="h-3 w-3" /> ID Number
                                    </Label>
                                    <p className="font-mono font-semibold tracking-tighter">{citizen.identification_number}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                                        <Phone className="h-3 w-3" /> Phone
                                    </Label>
                                    <p className="font-semibold">{citizen.phone_number || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-48 xl:w-56">
                            <Card className="bg-primary/5 border-primary/20 h-full flex items-center justify-center">
                                <CardContent className="p-4 w-full">
                                    <div className="text-center space-y-3">
                                        <Badge
                                            variant={citizen.is_active ? "default" : "secondary"}
                                            className={citizen.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" : ""}
                                        >
                                            <div className={`h-1.5 w-1.5 rounded-full mr-2 ${citizen.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                                            {citizen.is_active ? "Active Account" : "Inactive Account"}
                                        </Badge>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Member Since</p>
                                            <p className="text-sm font-semibold">
                                                {new Date(citizen.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="flex flex-wrap h-auto p-1 bg-muted/50 md:grid md:grid-cols-4 w-full">
                            <TabsTrigger value="overview" className="flex-1 py-2">Overview</TabsTrigger>
                            <TabsTrigger value="vehicles" className="flex-1 py-2">
                                Vehicles ({vehicles.length})
                            </TabsTrigger>
                            <TabsTrigger value="violations" className="flex-1 py-2">
                                Violations ({violations.length})
                            </TabsTrigger>
                            <TabsTrigger value="license" className="flex-1 py-2">License</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-4 space-y-6 outline-none">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Card className="bg-blue-500/5 border-blue-500/10">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-blue-500 flex items-center gap-2">
                                            <Car className="h-4 w-4" /> Registered Vehicles
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{vehicles.length}</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-rose-500/5 border-rose-500/10">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-rose-500 flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" /> Total Violations
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{violations.length}</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-amber-500/5 border-amber-500/10">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4" /> Points Deducted
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">
                                            {violations.reduce((acc, v) => acc + (v.points_deducted || 0), 0)}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {violations.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium">Recent Violations</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-white/5">
                                            {violations.slice(0, 3).map((violation) => (
                                                <div key={violation.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold tracking-tight">{violation.violation_type}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span className="font-mono">{violation.license_plate}</span>
                                                            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                                            <span>{violation.location_name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-1.5">
                                                        <Badge variant="outline" className="text-[10px] font-bold tracking-wider uppercase border-primary/20 bg-primary/5">{violation.status}</Badge>
                                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                                                            <Calendar className="h-2.5 w-2.5" />
                                                            {new Date(violation.detected_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="vehicles" className="mt-4">
                            <Card>
                                <CardContent className="pt-6">
                                    {loading ? (
                                        <div className="flex justify-center p-8">
                                            <div className="animate-pulse flex flex-col items-center gap-2">
                                                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                                <span className="text-sm text-muted-foreground">Loading vehicles...</span>
                                            </div>
                                        </div>
                                    ) : vehicles.length === 0 ? (
                                        <div className="py-12 text-center space-y-2">
                                            <Car className="h-12 w-12 text-muted-foreground/20 mx-auto" />
                                            <p className="text-muted-foreground font-medium">No vehicles registered</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto rounded-lg border border-white/5">
                                            <Table>
                                                <TableHeader className="bg-muted/50">
                                                    <TableRow>
                                                        <TableHead className="w-[120px]">Plate</TableHead>
                                                        <TableHead>Type</TableHead>
                                                        <TableHead>Brand/Model</TableHead>
                                                        <TableHead>Color</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {vehicles.map((vehicle) => (
                                                        <TableRow key={vehicle.id}>
                                                            <TableCell className="font-mono font-bold">{vehicle.license_plate}</TableCell>
                                                            <TableCell>{vehicle.vehicle_type}</TableCell>
                                                            <TableCell>{vehicle.vehicle_brand}</TableCell>
                                                            <TableCell>{vehicle.vehicle_color}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="violations" className="mt-4">
                            <Card>
                                <CardContent className="pt-6">
                                    {loading ? (
                                        <div className="flex justify-center p-8">
                                            <div className="animate-pulse flex flex-col items-center gap-2">
                                                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                                <span className="text-sm text-muted-foreground">Loading violations...</span>
                                            </div>
                                        </div>
                                    ) : violations.length === 0 ? (
                                        <div className="py-12 text-center space-y-2">
                                            <AlertTriangle className="h-12 w-12 text-muted-foreground/20 mx-auto" />
                                            <p className="text-muted-foreground font-medium">No violations found</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto rounded-lg border border-white/5">
                                            <Table>
                                                <TableHeader className="bg-muted/50">
                                                    <TableRow>
                                                        <TableHead className="min-w-[200px]">Violation Type</TableHead>
                                                        <TableHead>Vehicle</TableHead>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="text-right">Fine Amount</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {violations.map((violation) => (
                                                        <TableRow key={violation.id}>
                                                            <TableCell className="text-sm">{violation.violation_type}</TableCell>
                                                            <TableCell className="font-mono text-xs">{violation.license_plate}</TableCell>
                                                            <TableCell className="text-xs">
                                                                {new Date(violation.detected_at).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="text-[10px]">
                                                                    {violation.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="font-semibold text-right text-xs whitespace-nowrap">
                                                                {violation.fine_amount ? `${parseFloat(violation.fine_amount).toLocaleString()} VND` : "N/A"}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="license" className="mt-4">
                            {license ? (
                                <Card className="border-2 border-primary/20">
                                    <CardHeader className="bg-primary/5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-primary" />
                                                <CardTitle className="text-lg">Driving License</CardTitle>
                                            </div>
                                            <Badge className={license.status === "active" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                                                {license.status?.toUpperCase() || "UNKNOWN"}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6 grid grid-cols-2 gap-y-4">
                                        <div>
                                            <Label className="text-muted-foreground">License Number</Label>
                                            <p className="font-mono font-bold">{license.license_number}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Class</Label>
                                            <p className="font-semibold">{license.license_class}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Issued Date</Label>
                                            <p className="flex items-center gap-1 text-sm">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(license.issue_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Expiry Date</Label>
                                            <p className="flex items-center gap-1 text-sm">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(license.expiry_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="pt-6 text-center py-8">
                                        <p className="text-muted-foreground">No driving license record found for this identification number.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
