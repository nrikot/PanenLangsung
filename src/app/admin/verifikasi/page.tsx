"use client";
import DashboardLayout, { StubCard } from "@/components/DashboardLayout";

export default function VerifikasiPage() {
  return (
    <DashboardLayout requiredRole="admin" title="Verifikasi" subtitle="Setujui/tolak pengguna" backHref="/admin/dashboard">
      <StubCard />
    </DashboardLayout>
  );
}
