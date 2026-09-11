"use client";

import { useTranslations } from "next-intl";
import DashboardLayout, { DashCard } from "@/components/DashboardLayout";

export default function PembeliDashboard() {
  const t = useTranslations("dashboard.buyer");
  return (
    <DashboardLayout requiredRole="pembeli" title={t("title")} subtitle={t("subtitle")}>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashCard title={t("products")} desc={t("productsDesc")} href="/produk" />
        <DashCard title={t("rfq")} desc={t("rfqDesc")} href="/pembeli/rfq" />
        <DashCard title={t("auctions")} desc={t("auctionsDesc")} href="/pembeli/lelang" />
        <DashCard title={t("orders")} desc={t("ordersDesc")} href="/pembeli/pesanan" />
        <DashCard title={t("chat")} desc={t("chatDesc")} href="/pembeli/chat" />
        <DashCard title={t("reviews")} desc={t("reviewsDesc")} href="/pembeli/ulasan" />
        <DashCard title={t("profile")} desc={t("profileDesc")} href="/pembeli/profil" />
      </div>
    </DashboardLayout>
  );
}
