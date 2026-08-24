"use client";
import DashboardLayout, { StubCard } from "@/components/DashboardLayout";

export default function UlasanPetaniPage() {
  return (
    <DashboardLayout
      requiredRole="petani"
      title="Ulasan"
      subtitle="Lihat ulasan dari pembeli"
      backHref="/petani/dashboard"
    >
      <StubCard />
    </DashboardLayout>
  );
}
