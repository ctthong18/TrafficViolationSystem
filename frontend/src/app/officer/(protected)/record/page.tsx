"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  OfficerApi,
  Configuration,
} from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  History,
  Activity,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  Clock,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface RecentActivity {
  id: number;
  activity: string;
  type?: string | null;
  date: string;
}

export default function RecordPage() {
  const { token } = useAuth();
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [token]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const config = new Configuration({
        basePath: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        accessToken: token || undefined,
      });
      const officerApi = new OfficerApi(config);

      const { data } = await officerApi.getOfficerActivitiesApiV1OfficerDashboardActivitiesGet();
      setActivities(data || []);
    } catch (error) {
      console.error("Failed to fetch officer activities:", error);
      toast.error("Failed to load your duty records");
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "violation_review":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "complaint_resolution":
        return <MessageSquare className="h-4 w-4 text-info" />;
      case "fine_payment":
        return <FileText className="h-4 w-4 text-primary" />;
      case "login":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-inner">
            <Briefcase className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-display">Duty logs</h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Comprehensive record of your administrative actions
            </p>
          </div>
        </div>
        <div className="bg-card/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-border shadow-sm">
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none">Session Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-none shadow-lg bg-primary/10">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-1">Total Actions</p>
            <p className="text-3xl font-black text-primary">{activities.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-success/10">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-success/60 uppercase tracking-widest mb-1">Reviews</p>
            <p className="text-3xl font-black text-success">{activities.filter(a => a.type?.toLowerCase().includes('review')).length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-info/10">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-info/60 uppercase tracking-widest mb-1">Cases</p>
            <p className="text-3xl font-black text-info">{activities.filter(a => a.type?.toLowerCase().includes('complaint')).length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-card/60">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Service Type</p>
            <Badge className="bg-primary text-primary-foreground font-bold px-3">Standard Duty</Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-3xl rounded-3xl overflow-hidden min-h-[500px]">
        <CardHeader className="bg-muted/50 border-b p-8">
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-foreground">
            <History className="h-7 w-7 text-primary" />
            Service Chronology
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium">Timeline of all system interactions performed by your account</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 text-center space-y-4">
              <div className="h-10 w-10 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Accessing Log...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-20 text-center opacity-30 flex flex-col items-center gap-4 text-muted-foreground">
              <Activity className="h-16 w-16" />
              <p className="text-xl font-bold">No duty logs found for this period</p>
            </div>
          ) : (
            <div className="p-8 space-y-8 relative">
              <div className="absolute left-[59px] top-12 bottom-12 w-0.5 bg-border hidden md:block"></div>

              {activities.map((activity, idx) => (
                <div key={activity.id} className="relative flex flex-col md:flex-row gap-6 group animate-in slide-in-from-left-2 fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="hidden md:flex flex-col items-center w-24 shrink-0 pt-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase leading-none mb-1">{new Date(activity.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    <span className="text-lg font-black text-foreground leading-none">{new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                  </div>

                  <div className="relative z-10 h-10 w-10 rounded-xl bg-background shadow-md border border-border flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all group-hover:scale-110 duration-300">
                    {getActivityIcon(activity.type || "")}
                  </div>

                  <div className="flex-1 bg-card/60 p-5 rounded-2xl border border-border group-hover:border-primary/30 group-hover:bg-primary/5 transition-all group-hover:shadow-lg shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">{(activity.type || "Activity").replace(/_/g, ' ')}</h4>
                      <Badge variant="outline" className="text-[10px] bg-background">ID#{activity.id}</Badge>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed mb-3">
                      {activity.activity}
                    </p>

                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
