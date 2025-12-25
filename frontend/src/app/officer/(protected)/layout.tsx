"use client";

import React from "react";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { Role } from "@/api";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { OfficerSidebar } from "@/components/officer/OfficerSidebar";

export default function ProtectedOfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[Role.Officer]} redirectTo="/officer/login">
      <DashboardShell sidebar={<OfficerSidebar />}>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
