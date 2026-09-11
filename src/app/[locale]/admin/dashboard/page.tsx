"use client";

import { useTranslations } from "next-intl";
import DashboardLayout, { DashCard } from "@/components/DashboardLayout";

export default function AdminDashboard() {
  const t = useTranslations("dashboard.admin");
  return (
    <DashboardLayout requiredRole="admin" title={t("title")} subtitle={t("subtitle")}>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashCard title={t("products")} desc={t("productsDesc")} href="/admin/produk" />
        <DashCard title={t("verification")} desc={t("verificationDesc")} href="/admin/verifikasi" />
        <DashCard title={t("farmers")} desc={t("farmersDesc")} href="/admin/petani" />
        <DashCard title={t("buyers")} desc={t("buyersDesc")} href="/admin/pembeli" />
        <DashCard title={t("transactions")} desc={t("transactionsDesc")} href="/admin/transaksi" />
        <DashCard title={t("disputes")} desc={t("disputesDesc")} href="/admin/sengketa" />
      </div>
    </DashboardLayout>
  );
}
