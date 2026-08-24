"use client";
import DashboardLayout, { StubCard } from "@/components/DashboardLayout";

export default function ChatPetaniPage() {
  return (
    <DashboardLayout
      requiredRole="petani"
      title="Chat"
      subtitle="Inbox negosiasi"
      backHref="/petani/dashboard"
    >
      <StubCard />
    </DashboardLayout>
  );
}
