"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
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
    ComplaintResponse,
    ComplaintStatus,
} from "@/api";
import { getComplaintsApi } from "@/api/citizen-api";
import { useAuth } from "@/contexts/AuthContext";
import {
    MessageSquare,
    Clock,
    CheckCircle2,
    RefreshCw,
    Search,
    ChevronRight,
    AlertTriangle,
    History,
    Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function CitizenComplaintsPage() {
    const { token } = useAuth();
    const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchComplaints();
    }, [token]);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const complaintsApi = getComplaintsApi(token);
            const { data } = await complaintsApi.getMyComplaintsApiV1ComplaintsMyComplaintsGet();
            setComplaints(data.complaints || []);
        } catch (error) {
            console.error("Failed to fetch complaints:", error);
            toast.error("Failed to load your complaints");
        } finally {
            setLoading(false);
        }
    };

    const filteredComplaints = complaints.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.complaint_code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case ComplaintStatus.Resolved:
                return <Badge className="bg-success text-success-foreground rounded-full font-bold">Resolved</Badge>;
            case ComplaintStatus.UnderReview:
                return <Badge className="bg-info text-info-foreground rounded-full font-bold">In Review</Badge>;
            case ComplaintStatus.Pending:
                return <Badge className="bg-warning text-warning-foreground rounded-full font-bold">Pending</Badge>;
            default:
                return <Badge variant="secondary" className="rounded-full">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <MessageSquare className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">My Complaints</h1>
                        <p className="text-muted-foreground font-medium flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Track and manage your filed complaints
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href="/citizen/complaints/create">
                        <Button className="rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all">
                            <Plus className="h-4 w-4 mr-2" />
                            File Complaint
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        onClick={fetchComplaints}
                        disabled={loading}
                        className="rounded-full bg-background shadow-sm border-2 hover:shadow-md active:scale-95 transition-all"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-lg bg-warning/5 border-l-4 border-warning">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-warning uppercase tracking-widest opacity-60">Pending</p>
                                <p className="text-4xl font-black text-warning">{complaints.filter(c => c.status === ComplaintStatus.Pending).length}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-warning/40" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-info/5 border-l-4 border-info">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-info uppercase tracking-widest opacity-60">In Review</p>
                                <p className="text-4xl font-black text-info">{complaints.filter(c => c.status === ComplaintStatus.UnderReview).length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-info/40" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-success/5 border-l-4 border-success">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-success uppercase tracking-widest opacity-60">Resolved</p>
                                <p className="text-4xl font-black text-success">{complaints.filter(c => c.status === ComplaintStatus.Resolved).length}</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-success/40" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-card/40 backdrop-blur-xl p-4 rounded-3xl border shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by code or title..."
                        className="pl-12 rounded-2xl bg-background/80 border-border shadow-inner focus:ring-4 focus:ring-primary/5 transition-all h-12"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Tabs value={statusFilter} onValueChange={setStatusFilter} className="bg-muted/50 p-1.5 rounded-2xl border">
                    <TabsList className="bg-transparent gap-1">
                        <TabsTrigger value="all" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">All</TabsTrigger>
                        <TabsTrigger value={ComplaintStatus.Pending} className="rounded-xl px-6 data-[state=active]:bg-warning data-[state=active]:text-warning-foreground">Pending</TabsTrigger>
                        <TabsTrigger value={ComplaintStatus.UnderReview} className="rounded-xl px-6 data-[state=active]:bg-info data-[state=active]:text-info-foreground">Reviewing</TabsTrigger>
                        <TabsTrigger value={ComplaintStatus.Resolved} className="rounded-xl px-6 data-[state=active]:bg-success data-[state=active]:text-success-foreground">Resolved</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Complaint List */}
            <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-3xl rounded-3xl overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="border-b transition-none hover:bg-transparent">
                                <TableHead className="font-black text-foreground py-6 pl-8">Complaint ID</TableHead>
                                <TableHead className="font-black text-foreground">Title & Description</TableHead>
                                <TableHead className="font-black text-foreground">Status</TableHead>
                                <TableHead className="font-black text-foreground">Date Filed</TableHead>
                                <TableHead className="text-right pr-10">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                            <p className="text-muted-foreground font-bold tracking-tight">Fetching your complaints...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredComplaints.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="opacity-20 flex flex-col items-center gap-2">
                                            <MessageSquare className="h-16 w-16" />
                                            <p className="text-xl font-bold">No complaints found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredComplaints.map((complaint) => (
                                    <TableRow key={complaint.id} className="group border-border hover:bg-accent/30 transition-all cursor-default relative overflow-hidden">
                                        <TableCell className="pl-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-foreground text-sm tracking-tight">{complaint.complaint_code}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{complaint.complaint_type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 max-w-md">
                                                <p className="font-bold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">{complaint.title}</p>
                                                <p className="text-xs text-muted-foreground truncate">{complaint.description}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(complaint.status || "")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-[10px] font-bold">
                                                <span className="text-foreground">{new Date(complaint.created_at).toLocaleDateString()}</span>
                                                <span className="text-muted-foreground uppercase tracking-tighter">{new Date(complaint.created_at).toLocaleTimeString()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="rounded-full shadow-none hover:bg-primary hover:text-primary-foreground group-hover:shadow-lg transition-all active:scale-90"
                                            >
                                                <Link href={`/citizen/complaints/${complaint.id}`}>
                                                    View <ChevronRight className="h-4 w-4 ml-1" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                                ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
