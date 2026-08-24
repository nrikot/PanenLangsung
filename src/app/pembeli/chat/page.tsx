"use client";

import DashboardLayout, { StubCard } from "@/components/DashboardLayout";

export default function ChatPembeliPage() {
  return (
    <DashboardLayout requiredRole="pembeli" title="Chat" subtitle="Inbox negosiasi" backHref="/pembeli/dashboard">
      <StubCard />
    </DashboardLayout>
  );
}
