"use client";
import DashboardLayout, { StubCard } from "@/components/DashboardLayout";

export default function SengketaPage() {
  return (
    <DashboardLayout requiredRole="admin" title="Sengketa" subtitle="Kelola sengketa" backHref="/admin/dashboard">
      <StubCard />
    </DashboardLayout>
  );
}
