"use client";

import React from "react";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { Role } from "@/api";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[Role.Admin]} redirectTo="/admin/login">
      <DashboardShell sidebar={<AdminSidebar />}>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
