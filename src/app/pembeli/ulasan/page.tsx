"use client";

import DashboardLayout, { StubCard } from "@/components/DashboardLayout";

export default function UlasanPembeliPage() {
  return (
    <DashboardLayout requiredRole="pembeli" title="Ulasan" subtitle="Beri ulasan" backHref="/pembeli/dashboard">
      <StubCard />
    </DashboardLayout>
  );
}
