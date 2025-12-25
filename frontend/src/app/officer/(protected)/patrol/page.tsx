"use client";

import { useState } from "react";
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
  DrivingLicensesApi,
  Configuration,
  VehicleResponse,
  ViolationResponse,
  DrivingLicenseResponse,
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
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PatrolPage() {
  const { token } = useAuth();
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);

  // Results
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null);
  const [license, setLicense] = useState<DrivingLicenseResponse | null>(null);
  const [violations, setViolations] = useState<ViolationResponse[]>([]);
  const [searched, setSearched] = useState(false);

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
        const { data: vData } = await vehiclesApi.getVehicleByLicensePlateApiV1VehiclesLicensePlateLicensePlateGet(plate);
        setVehicle(vData);

        // 2. Get Owner's License (handled via citizen directory if needed)

        // 3. Get Violations for this plate
        const { data: vioData } = await violationsApi.getViolationsApiV1ViolationsGet(
          0, 10, undefined, vData.license_plate
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

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Active Patrol Tool</h1>
            <p className="text-muted-foreground font-medium">Real-time roadside vehicle and driver verification</p>
          </div>
        </div>

        <div className="bg-foreground text-background px-4 py-2 rounded-xl flex items-center gap-3 shadow-md">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
          <span className="text-xs font-bold tracking-widest uppercase">Field Unit Connected</span>
        </div>
      </div>

      {/* Plate Scanner (Search) */}
      <Card className="border-none shadow-xl bg-card/80 backdrop-blur-md overflow-hidden rounded-2xl border-b-4 border-primary">
        <CardContent className="p-8">
          <div className="max-w-2xl mx-auto space-y-4">
            <Label className="text-center block text-sm font-black uppercase text-muted-foreground tracking-tighter">Enter Plate Number / Scan</Label>
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
                {loading ? <RefreshCw className="animate-spin text-primary-foreground" /> : <Search className="h-6 w-6 text-primary-foreground" />}
              </Button>
            </div>
            <div className="flex justify-center gap-6">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <Camera className="h-4 w-4 mr-2" /> Use Camera Scanner
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
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
                  <span className="text-3xl font-black text-foreground tracking-tighter">{vehicle.license_plate}</span>
                </div>
                <Badge className="bg-primary text-primary-foreground block mx-auto w-fit uppercase tracking-widest text-[10px]">Verified Registry</Badge>
              </div>
              <CardContent className="p-6 space-y-6 bg-muted/30">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-background shadow-sm flex items-center justify-center text-foreground border">
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Vehicle Brand</p>
                      <p className="font-bold text-foreground">{vehicle.vehicle_brand}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-background shadow-sm flex items-center justify-center text-foreground border">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Registered Owner</p>
                      <p className="font-bold text-foreground">{vehicle.owner_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-background shadow-sm flex items-center justify-center text-foreground border">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Technical Status</p>
                      <Badge variant="outline" className="bg-success text-success-foreground border-none font-black text-[10px]">VALID REGISTRY</Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6 font-bold">
                    <History className="mr-2 h-5 w-5" /> Full History Report
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl py-6 border-2 font-bold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all">
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
                <TabsTrigger value="status" className="rounded-xl px-10 h-full data-[state=active]:bg-background data-[state=active]:shadow-md font-bold text-sm">Security Matrix</TabsTrigger>
                <TabsTrigger value="history" className="rounded-xl px-10 h-full data-[state=active]:bg-background data-[state=active]:shadow-md font-bold text-sm">Violation Feed</TabsTrigger>
                <TabsTrigger value="notes" className="rounded-xl px-10 h-full data-[state=active]:bg-background data-[state=active]:shadow-md font-bold text-sm">Unit Log</TabsTrigger>
              </TabsList>

              <TabsContent value="status" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-none shadow-md bg-card rounded-2xl border-l-4 border-success">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" /> Driver Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-black text-foreground tracking-tight">CLASS A-1</p>
                      <p className="text-xs text-muted-foreground font-medium">Valid until Oct 2028</p>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-md bg-card rounded-2xl border-l-4 border-destructive">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" /> Active Risks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-black text-destructive tracking-tight">3 PENDING</p>
                      <p className="text-xs text-muted-foreground font-medium italic underline">Requires immediate resolution</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-xl bg-foreground text-background rounded-2xl overflow-hidden relative">
                  <div className="absolute right-[-20px] top-[-20px] h-48 w-48 bg-primary/10 rounded-full blur-3xl"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-display">
                      <ShieldCheck className="h-6 w-6 text-primary" /> Executive Action
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
                      <h4 className="font-bold text-lg mb-1">Issue Field Ticket</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">Create manual violation record for on-site illegal activity.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-background/5 border border-background/10 hover:bg-background/10 transition-all cursor-pointer group">
                      <div className="h-12 w-12 rounded-xl bg-info/20 flex items-center justify-center text-info mb-4 group-hover:scale-110 transition-transform">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <h4 className="font-bold text-lg mb-1">Record Interaction</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">Log inspection without issuing a formal citation.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-card/80">
                  <CardContent className="p-0">
                    <div className="p-6 border-b flex items-center justify-between">
                      <h4 className="font-bold text-foreground">Violation History Loop</h4>
                      <Badge variant="secondary" className="font-bold">Total Recorded: {violations.length}</Badge>
                    </div>
                    <div className="divide-y max-h-[400px] overflow-y-auto">
                      {violations.length === 0 ? (
                        <div className="p-10 text-center space-y-2 opacity-40">
                          <CheckCircle2 className="h-12 w-12 mx-auto text-success" />
                          <p className="font-bold text-foreground">No Violations Recorded</p>
                        </div>
                      ) : (
                        violations.map((v) => (
                          <div key={v.id} className="p-6 flex items-start justify-between hover:bg-muted/30 transition-colors group">
                            <div className="flex gap-4">
                              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0 font-black text-xs">
                                VIO
                              </div>
                              <div>
                                <p className="font-bold text-foreground leading-none mb-1 group-hover:text-primary transition-colors uppercase tracking-tight">{v.violation_type}</p>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                  <Calendar className="h-3 w-3" /> {new Date(v.detected_at).toLocaleDateString()}
                                  <span className="h-1 w-1 rounded-full bg-border"></span>
                                  <MapPin className="h-3 w-3" /> {v.location_name}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-foreground leading-none mb-1">{v.fine_amount ? `${parseFloat(v.fine_amount).toLocaleString()}đ` : '---'}</p>
                              <Badge className={v.status === ViolationStatus.Paid ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>{v.status}</Badge>
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
      ) : (searched && !vehicle) ? (
        <Card className="p-20 text-center space-y-6 border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-3xl animate-in zoom-in duration-300">
          <div className="h-24 w-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive shadow-inner">
            <XCircle className="h-12 w-12" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-foreground tracking-tighter">NO REGISTRATION FOUND</h2>
            <p className="text-muted-foreground font-medium max-w-md mx-auto mt-2">The plate entry <span className="text-destructive font-black">"{plate}"</span> does not exist in the National Traffic Database or is unregistered.</p>
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="px-8 rounded-xl font-bold border-2" onClick={() => setPlate("")}>Clear Data</Button>
            <Button className="px-8 rounded-xl font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg">Report Unregistered Vehicle</Button>
          </div>
        </Card>
      ) : (
        <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-border rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
          <div className="text-center space-y-4 opacity-50 group-hover:opacity-80 transition-opacity z-10">
            <Car className="h-20 w-20 mx-auto text-muted-foreground group-hover:scale-110 transition-transform duration-500" />
            <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Ready for Scanner Input</p>
          </div>
        </div>
      )}
    </div>
  );
}
