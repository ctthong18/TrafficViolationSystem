"use client";

import { useAuth } from "@/contexts/AuthContext";
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
  User,
  Mail,
  Phone,
  Shield,
  Key,
  BadgeCheck,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-background shadow-xl">
          <User className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{user.full_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-foreground text-background font-bold tracking-widest px-3 border-none">
              <Shield className="h-3 w-3 mr-1" />
              {user.role?.toUpperCase()}
            </Badge>
            <span className="text-sm text-muted-foreground font-medium">Internal Security Division</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-card/60 backdrop-blur-xl rounded-2xl overflow-hidden border-t-4 border-primary">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-xl font-bold">Personal Credentials</CardTitle>
              <CardDescription>Manage your identity and contact information</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Full Name</Label>
                  <Input defaultValue={user.full_name} disabled className="bg-muted/50 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Username</Label>
                  <Input defaultValue={user.username} disabled className="bg-muted/50 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input defaultValue={user.email} className="pl-10 font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input defaultValue={user.phone_number || "+84 --- --- ---"} className="pl-10 font-medium" />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button className="rounded-xl px-10 shadow-lg shadow-primary/20">Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-card/60 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Key className="h-5 w-5 text-warning" /> Security
              </CardTitle>
              <CardDescription>Authentication and access control</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-warning/10 border border-warning/20 rounded-xl">
                <div className="space-y-1">
                  <p className="font-bold text-warning">Two-Factor Authentication</p>
                  <p className="text-xs text-warning/80">Add an extra layer of security to your account.</p>
                </div>
                <Button variant="outline" className="bg-background border-warning/20 text-warning hover:bg-warning/10 rounded-lg">Configure</Button>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-muted-foreground">Last Password Change: <span className="text-muted-foreground/60 font-medium">3 months ago</span></p>
                <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5">Change Password →</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-foreground dark:bg-card text-background dark:text-card-foreground rounded-2xl overflow-hidden relative">
            <div className="absolute top-[-20px] right-[-20px] h-32 w-32 bg-primary/20 rounded-full blur-3xl"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BadgeCheck className="h-5 w-5 text-primary" /> Badge Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Badge Number</Label>
                <p className="text-2xl font-black font-mono">{user.badge_number}</p>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
