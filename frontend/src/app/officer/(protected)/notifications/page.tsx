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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
    Bell,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Info,
    Loader2,
    RefreshCw,
    Check,
    MessageSquare,
    ClipboardList,
    ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
    id: number;
    title: string;
    message: string;
    type: "complaint" | "violation" | "assignment" | "system";
    status: "READ" | "UNREAD";
    created_at: string;
}

// Mock data for officer notifications
const mockNotifications: Notification[] = [
    {
        id: 1,
        title: "New Complaint Assigned",
        message: "You have been assigned a new complaint (#C-2024-001) regarding a speeding violation dispute.",
        type: "complaint",
        status: "UNREAD",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
        id: 2,
        title: "Violation Review Required",
        message: "A violation (#V-2024-105) needs your review. Evidence has been submitted by the citizen.",
        type: "violation",
        status: "UNREAD",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
        id: 3,
        title: "Case Update",
        message: "Complaint #C-2024-089 has been updated with new information from the citizen.",
        type: "assignment",
        status: "READ",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
        id: 4,
        title: "System Maintenance",
        message: "Scheduled system maintenance on December 28th from 2:00 AM to 4:00 AM.",
        type: "system",
        status: "READ",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
];

export default function OfficerNotificationsPage() {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            // Simulate API call - replace with actual API when available
            await new Promise((resolve) => setTimeout(resolve, 500));
            setNotifications(mockNotifications);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 200));
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, status: "READ" as const } : n
                )
            );
            toast.success("Notification marked as read");
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            toast.error("Failed to update notification");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 300));
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, status: "READ" as const }))
            );
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Failed to mark all as read:", error);
            toast.error("Failed to update notifications");
        }
    };

    const getNotificationIcon = (notification: Notification) => {
        switch (notification.type) {
            case "complaint":
                return <MessageSquare className="h-5 w-5 text-info" />;
            case "violation":
                return <AlertTriangle className="h-5 w-5 text-warning" />;
            case "assignment":
                return <ClipboardList className="h-5 w-5 text-success" />;
            case "system":
                return <ShieldAlert className="h-5 w-5 text-muted-foreground" />;
            default:
                return <Bell className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const unreadCount = notifications.filter((n) => n.status !== "READ").length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Loading notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Bell className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
                        <p className="text-muted-foreground font-medium flex items-center gap-2">
                            {unreadCount > 0 ? (
                                <>
                                    <Badge variant="destructive" className="rounded-full">
                                        {unreadCount} unread
                                    </Badge>
                                </>
                            ) : (
                                "All caught up!"
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            onClick={handleMarkAllAsRead}
                            className="rounded-full"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Mark all read
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={fetchNotifications}
                        disabled={loading}
                        className="rounded-full"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Notifications List */}
            <Card className="border-none shadow-xl bg-card/60 backdrop-blur-3xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Recent Notifications
                    </CardTitle>
                    <CardDescription>
                        {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2 text-muted-foreground">No notifications</h3>
                            <p className="text-sm text-muted-foreground">
                                You'll be notified when something happens
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex items-start gap-4 p-4 rounded-2xl transition-all ${notification.status !== "READ"
                                        ? "bg-primary/5 border-l-4 border-primary"
                                        : "bg-muted/20"
                                        }`}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        {getNotificationIcon(notification)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-foreground">{notification.title}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {notification.status !== "READ" && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            className="rounded-full flex-shrink-0"
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
