"use client";
import DashboardLayout from "@/components/DashboardLayout";
import ChatInterface from "@/components/ChatInterface";

export default function ChatPetaniPage() {
  return (
    <DashboardLayout
      requiredRole="petani"
      title="Chat"
      subtitle="Inbox negosiasi"
      backHref="/petani/dashboard"
    >
      <ChatInterface />
    </DashboardLayout>
  );
}
