"use client";

import DashboardLayout, { StubCard } from "@/components/DashboardLayout";

export default function PesananPembeliPage() {
  return (
    <DashboardLayout requiredRole="pembeli" title="Pesanan" subtitle="Riwayat & tracking" backHref="/pembeli/dashboard">
      <StubCard />
    </DashboardLayout>
  );
}
