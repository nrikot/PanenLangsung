"use client";
import DashboardLayout, { DashCard } from "@/components/DashboardLayout";
import { useTranslations } from "next-intl";

export default function PetaniDashboard() {
  const t = useTranslations("dashboard.farmer");
  return (
    <DashboardLayout requiredRole="petani" title={t("title")} subtitle={t("subtitle")}>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashCard title={t("products")} desc={t("productsDesc")} href="/petani/produk" />
        <DashCard title={t("auctions")} desc={t("auctionsDesc")} href="/petani/lelang" />
        <DashCard title={t("rfq")} desc={t("rfqDesc")} href="/petani/rfq" />
        <DashCard title={t("orders")} desc={t("ordersDesc")} href="/petani/pesanan" />
        <DashCard title={t("chat")} desc={t("chatDesc")} href="/petani/chat" />
        <DashCard title={t("reviews")} desc={t("reviewsDesc")} href="/petani/ulasan" />
        <DashCard title={t("profile")} desc={t("profileDesc")} href="/petani/profil" />
      </div>
    </DashboardLayout>
  );
}
