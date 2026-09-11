"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

interface Auction {
  id: string; title: string; quantity: number; unit: string; startPrice: number; reservePrice: number;
  endTime: string; selectionMode: string; status: string;
  farmer: { id: string; name: string; businessName: string };
  commodity: { id: string; name: string };
  _count: { bids: number };
}

const STATUS_COLORS: Record<string, string> = {
  draft: "dark:bg-yellow-500/15 dark:text-yellow-400 bg-yellow-100 text-yellow-700",
  aktif: "dark:bg-green-500/15 dark:text-green-400 bg-green-100 text-green-700",
  berakhir: "dark:bg-gray-500/15 dark:text-gray-400 bg-gray-100 text-gray-600",
  dibatalkan: "dark:bg-red-500/15 dark:text-red-400 bg-red-100 text-red-700",
  selesai: "dark:bg-blue-500/15 dark:text-blue-400 bg-blue-100 text-blue-700",
};

function formatRupiah(n: number) { return "Rp " + n.toLocaleString("id-ID"); }
function formatDateTime(d: string) { return new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }

export default function LelangPembeliPage() {
  const t = useTranslations("auctions");
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("aktif");

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100", sort: "newest" });
    if (filter) params.set("status", filter);
    const res = await fetch(`/api/v1/auctions?${params}`);
    const data = await res.json();
    setAuctions(data.auctions || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchAuctions(); }, [fetchAuctions]);

  return (
    <DashboardLayout requiredRole="pembeli" title={t("title")} subtitle={t("manageAuction")} backHref="/pembeli/dashboard">
      <div className="mb-6 flex gap-2">
        {["aktif", "berakhir", "selesai", ""].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${filter === s ? "bg-green-700 text-white" : "dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
            {s === "aktif" ? t("status.active") : s === "berakhir" ? t("status.ended") : s === "selesai" ? t("status.completed") : t("allAuctions")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center dark:text-[#8b9e93] text-slate-500">{t("loading")}</div>
      ) : auctions.length === 0 ? (
        <div className="rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-12 text-center shadow-sm">
          <p className="dark:text-gray-400 text-slate-500">{t("noAuctions")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {auctions.map(a => (
            <Link key={a.id} href={`/lelang/${a.id}`}
              className="block rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[a.status] || ""}`}>{a.status}</span>
                    <span className="rounded dark:bg-green-500/15 dark:text-green-400 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{a.commodity.name}</span>
                    <span className="rounded dark:bg-blue-500/15 dark:text-blue-400 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{a.selectionMode}</span>
                  </div>
                  <h3 className="text-base font-semibold dark:text-gray-100 text-slate-900">{a.title}</h3>
                </div>
                <div className="text-right text-xs dark:text-[#8b9e93] text-slate-500">
                  <p>{a.farmer.businessName || a.farmer.name}</p>
                  <p>Berakhir: {formatDateTime(a.endTime)}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-4 text-sm">
                <span className="dark:text-gray-100 text-slate-900 font-medium">{formatRupiah(a.startPrice)}/{a.unit}</span>
                <span className="dark:text-[#8b9e93] text-slate-500">{a.quantity.toLocaleString("id-ID")} {a.unit}</span>
                <span className="dark:text-[#8b9e93] text-slate-500">{a._count.bids} {t("bids")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
