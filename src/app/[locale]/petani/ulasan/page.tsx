"use client";
import DashboardLayout, { StubCard } from "@/components/DashboardLayout";
import { useTranslations } from "next-intl";

export default function UlasanPetaniPage() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  return (
    <DashboardLayout
      requiredRole="petani"
      title={t("reviews")}
      subtitle={tc("comingSoon")}
      backHref="/petani/dashboard"
    >
      <StubCard />
    </DashboardLayout>
  );
}
