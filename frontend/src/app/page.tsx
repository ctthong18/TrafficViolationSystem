"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User, UserCog, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.refresh();
  };
  const roles = [
    {
      title: "Citizen Portal",
      description: "View and pay traffic violations, check your driving record",
      icon: User,
      href: "/citizen",
      loginHref: "/citizen/login",
      color: "bg-info hover:bg-info/90",
    },
    {
      title: "Officer Portal",
      description: "Record violations, manage cases, and patrol assignments",
      icon: Shield,
      href: "/officer",
      loginHref: "/officer/login",
      color: "bg-success hover:bg-success/90",
    },
    {
      title: "Admin Portal",
      description: "System administration, reports, and user management",
      icon: UserCog,
      href: "/admin",
      loginHref: "/admin/login",
      color: "bg-primary hover:bg-primary/90",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        {/* Theme Toggle and Logout */}
        <div className="flex justify-end items-center gap-4 mb-8">
          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Logged in as:{" "}
                <span className="font-medium">{user?.username}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          )}
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Traffic Violation System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage traffic violations efficiently and transparently
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.href}
                className="hover:shadow-xl transition-shadow duration-300"
              >
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300`}
                  >
                    <Icon className="w-8 h-8 text-foreground" />
                  </div>
                  <CardTitle className="text-2xl">{role.title}</CardTitle>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <Link href={role.href}>
                    <Button className="w-full" size="lg">
                      Enter Portal
                    </Button>
                  </Link>
                  <Link href={role.loginHref}>
                    <Button className="w-full" size="lg" variant="outline">
                      Login
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground">
          <p className="text-sm">
            © {new Date().getFullYear()} Traffic Violation System. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
