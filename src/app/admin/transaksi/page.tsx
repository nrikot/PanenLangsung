"use client";
import DashboardLayout, { StubCard } from "@/components/DashboardLayout";

export default function TransaksiPage() {
  return (
    <DashboardLayout requiredRole="admin" title="Transaksi" subtitle="Pantau escrow" backHref="/admin/dashboard">
      <StubCard />
    </DashboardLayout>
  );
}
