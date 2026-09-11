"use client";

import { useTranslations } from "next-intl";
import DashboardLayout from "@/components/DashboardLayout";
import ChatInterface from "@/components/ChatInterface";

export default function ChatPembeliPage() {
  const t = useTranslations("common");
  return (
    <DashboardLayout
      requiredRole="pembeli"
      title={t("chat")}
      subtitle={t("comingSoon")}
      backHref="/pembeli/dashboard"
    >
      <ChatInterface />
    </DashboardLayout>
  );
}
