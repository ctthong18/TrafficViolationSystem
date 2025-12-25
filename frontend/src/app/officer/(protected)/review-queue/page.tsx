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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  OfficerApi,
  Configuration,
  ViolationResponse,
} from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  ClipboardList,
  RefreshCw,
  Search,
  AlertCircle,
  Clock,
  Car,
  MapPin,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import ReviewDialog from "./ReviewDialog";
import { Input } from "@/components/ui/input";

export default function ReviewQueuePage() {
  const { token } = useAuth();
  const [violations, setViolations] = useState<ViolationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);

  // Filter state
  const [searchPlate, setSearchPlate] = useState("");

  // Dialog state
  const [selectedViolation, setSelectedViolation] = useState<ViolationResponse | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  useEffect(() => {
    fetchReviewQueue();
  }, [token, skip]);

  const fetchReviewQueue = async () => {
    try {
      setLoading(true);
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const officerApi = new OfficerApi(config);

      const { data } = await officerApi.getReviewQueueApiV1OfficerViolationsReviewQueueGet(
        skip,
        limit
      );

      setViolations(data.violations || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch review queue:", error);
      toast.error("Failed to load review queue");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (violation: ViolationResponse) => {
    setSelectedViolation(violation);
    setIsReviewDialogOpen(true);
  };

  const filteredViolations = violations.filter(v =>
    v.license_plate?.toLowerCase().includes(searchPlate.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ClipboardList className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Review Queue</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              There are {total} violations waiting for your review
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={fetchReviewQueue}
          disabled={loading}
          className="rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </Button>
      </div>

      {/* Stats Summary Area (Optional visually) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {total > 0 && (
          <div className="col-span-full bg-info/10 border border-info/20 rounded-xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="h-10 w-10 rounded-full bg-info flex items-center justify-center text-info-foreground shrink-0">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-info">Attention Required</p>
              <p className="text-sm text-info/80">You have high-priority violations that need approval to issue tickets.</p>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-md p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by license plate..."
            className="pl-10 rounded-full bg-background border-border focus:ring-primary/20"
            value={searchPlate}
            onChange={(e) => setSearchPlate(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          Showing {filteredViolations.length} of {total} in queue
        </div>
      </div>

      {/* Queue Grid/Table */}
      <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-2xl overflow-hidden rounded-2xl">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold">Violation</TableHead>
              <TableHead className="font-bold">License Plate</TableHead>
              <TableHead className="font-bold">Location & Time</TableHead>
              <TableHead className="font-bold">Confidence</TableHead>
              <TableHead className="text-right font-bold pr-8">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-muted-foreground font-medium">Loading Queue...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredViolations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <ClipboardList className="h-12 w-12 opacity-20" />
                    <p className="text-lg font-medium">Queue is empty!</p>
                    <p className="text-sm">Great job, you've processed all assigned violations.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredViolations.map((violation) => (
                <TableRow key={violation.id} className="hover:bg-primary/5 transition-colors group">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{violation.violation_type}</span>
                      <span className="text-xs text-muted-foreground">ID: #{violation.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-muted rounded group-hover:bg-background transition-colors">
                        <Car className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-mono font-black text-foreground tracking-wider">
                        {violation.license_plate}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {violation.location_name}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                        <Calendar className="h-3 w-3" /> {new Date(violation.detected_at).toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 w-32">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>Score</span>
                        <span className={violation.confidence_score && violation.confidence_score > 0.8 ? "text-success" : "text-warning"}>
                          {(violation.confidence_score || 0) * 100}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${violation.confidence_score && violation.confidence_score > 0.8 ? "bg-success" : "bg-warning"}`}
                          style={{ width: `${(violation.confidence_score || 0) * 100}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <Button
                      onClick={() => handleReviewClick(violation)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-6 shadow-sm hover:shadow-lg transition-all active:scale-95"
                    >
                      Process →
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        {total > limit && (
          <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
            <div className="text-xs font-medium text-muted-foreground">
              Queue Page {Math.floor(skip / limit) + 1}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setSkip(Math.max(0, skip - limit))}
                disabled={skip === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setSkip(skip + limit)}
                disabled={skip + limit >= total}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ReviewDialog
        violation={selectedViolation}
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        onReviewed={fetchReviewQueue}
      />
    </div>
  );
}
