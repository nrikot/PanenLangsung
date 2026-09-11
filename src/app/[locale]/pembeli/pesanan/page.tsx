"use client";

import { useTranslations } from "next-intl";
import DashboardLayout, { StubCard } from "@/components/DashboardLayout";

export default function PesananPembeliPage() {
  const t = useTranslations("common");
  return (
    <DashboardLayout requiredRole="pembeli" title={t("orders")} subtitle={t("comingSoon")} backHref="/pembeli/dashboard">
      <StubCard />
    </DashboardLayout>
  );
}
