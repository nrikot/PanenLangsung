"use client";
import DashboardLayout from "@/components/DashboardLayout";
import ChatInterface from "@/components/ChatInterface";

export default function ChatPembeliPage() {
  return (
    <DashboardLayout
      requiredRole="pembeli"
      title="Chat"
      subtitle="Inbox negosiasi"
      backHref="/pembeli/dashboard"
    >
      <ChatInterface />
    </DashboardLayout>
  );
}
