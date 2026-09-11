"use client";

import { useTranslations } from "next-intl";
import DashboardLayout, { StubCard } from "@/components/DashboardLayout";

export default function UlasanPembeliPage() {
  const t = useTranslations("common");
  return (
    <DashboardLayout requiredRole="pembeli" title={t("reviews")} subtitle={t("comingSoon")} backHref="/pembeli/dashboard">
      <StubCard />
    </DashboardLayout>
  );
}
