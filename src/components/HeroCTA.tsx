"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight } from "lucide-react";

export default function HeroCTA() {
  const { user, loading } = useAuth();
  const t = useTranslations();

  function getHref() {
    if (loading) return "/daftar";
    if (!user) return "/daftar";
    switch (user.role) {
      case "admin": return "/admin/dashboard";
      case "petani": return "/petani/dashboard";
      case "pembeli": return "/pembeli/dashboard";
      default: return "/daftar";
    }
  }

  function getLabel() {
    if (loading || !user) return t("home.startNow");
    return t("common.dashboard");
  }

  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      <Link
        href={getHref()}
        className="group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-[var(--btn-primary-shadow)] ring-1 ring-green-500/20 transition-all duration-200 hover:scale-105 hover:shadow-lg sm:px-7 sm:py-3.5"
        style={{ backgroundColor: "var(--btn-primary-bg)" }}
      >
        {getLabel()}
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
      <Link
        href="/produk"
        className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold transition-all duration-200 hover:shadow-sm sm:px-7 sm:py-3.5"
        style={{ borderColor: "var(--btn-outline-border)", color: "var(--btn-outline-text)" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-outline-hover-bg)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        {t("home.viewCatalog")}
      </Link>
    </div>
  );
}
