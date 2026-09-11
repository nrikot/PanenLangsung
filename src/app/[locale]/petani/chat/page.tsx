"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { useTranslations } from "next-intl";
import ChatInterface from "@/components/ChatInterface";

export default function ChatPetaniPage() {
  const t = useTranslations("nav");
  const tc = useTranslations("chat");
  return (
    <DashboardLayout
      requiredRole="petani"
      title={t("chat")}
      subtitle={tc("typeMessage")}
      backHref="/petani/dashboard"
    >
      <ChatInterface />
    </DashboardLayout>
  );
}
