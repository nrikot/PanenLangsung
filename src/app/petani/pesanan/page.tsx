"use client";
import DashboardLayout, { StubCard } from "@/components/DashboardLayout";

export default function PesananPetaniPage() {
  return (
    <DashboardLayout
      requiredRole="petani"
      title="Pesanan"
      subtitle="Kelola pesanan masuk"
      backHref="/petani/dashboard"
    >
      <StubCard />
    </DashboardLayout>
  );
}
