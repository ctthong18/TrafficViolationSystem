"use client";

import { useEffect, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ViolationsApi,
  Configuration,
  ViolationResponse,
  ViolationStatus,
} from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Filter,
  Eye,
  AlertTriangle,
  History,
  Car,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import ViolationDetailDialog from "./ViolationDetailDialog";

export default function OfficerViolationsPage() {
  const { token } = useAuth();
  const [violations, setViolations] = useState<ViolationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  // Dialog state
  const [selectedViolation, setSelectedViolation] = useState<ViolationResponse | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchViolations();
  }, [token, statusFilter, page]);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const violationsApi = new ViolationsApi(config);

      const { data } = await violationsApi.getViolationsApiV1ViolationsGet(
        page * limit,
        limit,
        statusFilter !== "all" ? statusFilter : undefined,
        searchTerm || undefined
      );

      setViolations(data.violations || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch violations:", error);
      toast.error("Failed to load violations history");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchViolations();
  };

  const getStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let colorClass = "bg-muted text-muted-foreground";

    switch (status) {
      case ViolationStatus.Approved:
        variant = "default";
        colorClass = "bg-success/10 text-success border-success/20";
        break;
      case ViolationStatus.Rejected:
        variant = "destructive";
        colorClass = "bg-destructive/10 text-destructive border-destructive/20";
        break;
      case ViolationStatus.Paid:
        variant = "outline";
        colorClass = "bg-info/10 text-info border-info/20";
        break;
      case ViolationStatus.Pending:
      case ViolationStatus.Reviewing:
        variant = "secondary";
        colorClass = "bg-warning/10 text-warning border-warning/20";
        break;
      case ViolationStatus.Processed:
        colorClass = "bg-primary/10 text-primary border-primary/20";
        break;
    }

    return (
      <Badge variant={variant} className={`rounded-full px-3 py-0.5 border font-semibold text-[10px] ${colorClass}`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <History className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Violation History</h1>
            <p className="text-muted-foreground">View and manage processed traffic law violations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-4 py-2 bg-background/50 backdrop-blur-sm shadow-sm border-2">
            <AlertTriangle className="h-4 w-4 mr-2 text-primary" />
            Total Records: {total}
          </Badge>
          <Button variant="ghost" size="icon" onClick={fetchViolations} disabled={loading} className="rounded-full">
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Control Panel */}
      <Card className="border-none shadow-lg bg-card/60 backdrop-blur-md rounded-2xl">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-12 lg:col-span-8 space-y-2">
              <Label className="text-sm font-semibold text-foreground ml-1">Universal Search</Label>
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search by license plate number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 rounded-xl bg-background border-border focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>
                <Button onClick={handleSearch} className="rounded-xl px-8 shadow-md hover:shadow-lg transition-all active:scale-95">Search</Button>
              </div>
            </div>
            <div className="md:col-span-12 lg:col-span-4 space-y-2">
              <Label className="text-sm font-semibold text-foreground ml-1">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-xl bg-background border-border">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Statuses" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">✨ All Statuses</SelectItem>
                  <SelectItem value={ViolationStatus.Pending}>⌛ Pending</SelectItem>
                  <SelectItem value={ViolationStatus.Approved}>✅ Approved</SelectItem>
                  <SelectItem value={ViolationStatus.Rejected}>❌ Rejected</SelectItem>
                  <SelectItem value={ViolationStatus.Paid}>💰 Paid</SelectItem>
                  <SelectItem value={ViolationStatus.Processed}>⚙️ Processed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-3xl rounded-3xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-b transition-none hover:bg-transparent">
              <TableHead className="font-bold text-foreground py-6">Incident ID</TableHead>
              <TableHead className="font-bold text-foreground">Vehicle Info</TableHead>
              <TableHead className="font-bold text-foreground">Offense Type</TableHead>
              <TableHead className="font-bold text-foreground">Status</TableHead>
              <TableHead className="font-bold text-foreground">Processed At</TableHead>
              <TableHead className="text-right font-bold text-foreground pr-10">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-80 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative h-16 w-16">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
                    </div>
                    <p className="text-slate-500 font-bold text-lg animate-pulse">Consulting Database Records...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : violations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-80 text-center text-slate-400 font-medium">
                  <div className="flex flex-col items-center gap-2 opacity-50">
                    <AlertTriangle className="h-12 w-12" />
                    <p>No violation records found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              violations.map((violation) => (
                <TableRow key={violation.id} className="hover:bg-primary/5 group cursor-default border-slate-100">
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <div className="p-1 px-2 bg-foreground text-background rounded text-[10px] font-mono leading-none flex items-center gap-1">
                          <Car className="h-2 w-2" />
                          {violation.license_plate}
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">{violation.vehicle_brand || "Generic"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                        <MapPin className="h-2.5 w-2.5" />
                        {violation.location_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-foreground text-sm max-w-[200px] truncate">{violation.violation_type}</p>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(violation.status || "")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-[10px] text-muted-foreground font-medium">
                      <span>{new Date(violation.detected_at).toLocaleDateString()}</span>
                      <span>{new Date(violation.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedViolation(violation);
                        setIsDetailDialogOpen(true);
                      }}
                      className="rounded-full h-10 w-10 p-0 group-hover:bg-primary group-hover:text-white transition-all shadow-none group-hover:shadow-md active:scale-90"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Footer info */}
        <div className="p-6 bg-muted/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-medium tracking-tight">
            Official Traffic Enforcement Records • Security Cleared Access
          </p>
          {total > limit && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl px-4 font-bold border-border"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl px-4 font-bold border-border"
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * limit >= total}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </Card>

      <ViolationDetailDialog
        violation={selectedViolation}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />
    </div>
  );
}
