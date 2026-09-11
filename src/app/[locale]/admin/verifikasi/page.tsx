"use client";

import { useTranslations } from "next-intl";
import DashboardLayout, { StubCard } from "@/components/DashboardLayout";

export default function VerifikasiPage() {
  const t = useTranslations("common");
  return (
    <DashboardLayout requiredRole="admin" title={t("verification")} subtitle={t("comingSoon")} backHref="/admin/dashboard">
      <StubCard />
    </DashboardLayout>
  );
}
