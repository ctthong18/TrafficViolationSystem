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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getCitizenApi } from "@/api/citizen-api";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Car,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Edit,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface PersonalInfo {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  identification_number?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  vehicles_count?: number;
  violations_count?: number;
}

export default function ProfilePage() {
  const { token, user } = useAuth();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (token) {
      fetchPersonalInfo();
    }
  }, [token]);

  const fetchPersonalInfo = async () => {
    try {
      setLoading(true);
      const citizenApi = getCitizenApi(token);
      const { data } = await citizenApi.getPersonalInfoApiV1CitizenPersonalInfoGet();
      setPersonalInfo(data);
    } catch (error) {
      console.error("Failed to fetch personal info:", error);
      toast.error("Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading profile...</p>
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
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
            <p className="text-muted-foreground font-medium">
              Manage your personal information
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={fetchPersonalInfo}
          disabled={loading}
          className="rounded-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border-none shadow-xl bg-card/60 backdrop-blur-3xl rounded-3xl overflow-hidden">
          <CardContent className="pt-8 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {getInitials(personalInfo?.full_name || user?.full_name || "U")}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-foreground">
              {personalInfo?.full_name || user?.full_name || "User"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {personalInfo?.email || user?.email}
            </p>
            <Badge
              variant={personalInfo?.is_active ? "default" : "secondary"}
              className="rounded-full px-4 py-1"
            >
              {personalInfo?.is_active ? "Active Account" : "Inactive"}
            </Badge>

            <Separator className="my-6 w-full" />

            {/* Quick Stats */}
            <div className="w-full grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-2xl p-4 text-center">
                <Car className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-foreground">
                  {personalInfo?.vehicles_count || 0}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Vehicles</p>
              </div>
              <div className="bg-muted/30 rounded-2xl p-4 text-center">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-warning" />
                <p className="text-2xl font-bold text-foreground">
                  {personalInfo?.violations_count || 0}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Violations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2 border-none shadow-xl bg-card/60 backdrop-blur-3xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your account details and personal data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Full Name
                </Label>
                <p className="text-foreground font-medium bg-muted/20 p-3 rounded-xl border border-border/50">
                  {personalInfo?.full_name || "Not provided"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Email Address
                </Label>
                <p className="text-foreground font-medium bg-muted/20 p-3 rounded-xl border border-border/50">
                  {personalInfo?.email || "Not provided"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  Phone Number
                </Label>
                <p className="text-foreground font-medium bg-muted/20 p-3 rounded-xl border border-border/50">
                  {personalInfo?.phone || "Not provided"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  ID Number
                </Label>
                <p className="text-foreground font-medium bg-muted/20 p-3 rounded-xl border border-border/50">
                  {personalInfo?.identification_number || "Not provided"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Address
                </Label>
                <p className="text-foreground font-medium bg-muted/20 p-3 rounded-xl border border-border/50">
                  {personalInfo?.address || "Not provided"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Date of Birth
                </Label>
                <p className="text-foreground font-medium bg-muted/20 p-3 rounded-xl border border-border/50">
                  {personalInfo?.date_of_birth
                    ? formatDate(personalInfo.date_of_birth)
                    : "Not provided"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                  Account Role
                </Label>
                <Badge variant="outline" className="rounded-full px-4 py-2 text-sm">
                  {personalInfo?.role || "Citizen"}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                  Member Since
                </Label>
                <p className="text-foreground font-medium">
                  {personalInfo?.created_at
                    ? formatDate(personalInfo.created_at)
                    : "Unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Section */}
      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-3xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Manage your account security and password</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-muted/20 rounded-2xl border border-border/50">
            <div>
              <h3 className="font-bold text-foreground">Password</h3>
              <p className="text-sm text-muted-foreground">
                Last changed: Unknown
              </p>
            </div>
            <Button variant="outline" className="rounded-full" disabled>
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
