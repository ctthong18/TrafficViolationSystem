"use client";

import React from "react";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { Role } from "@/api";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { CitizenSidebar } from "@/components/citizen/CitizenSidebar";

export default function ProtectedCitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[Role.Citizen]} redirectTo="/citizen/login">
      <DashboardShell sidebar={<CitizenSidebar />}>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
