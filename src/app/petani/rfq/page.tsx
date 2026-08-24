"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

interface Rfq {
  id: string; quantity: number; unit: string; targetPrice: number | null;
  deliveryLocation: string; neededBy: string; status: string; createdAt: string;
  buyer: { id: string; name: string; businessName: string };
  commodity: { id: string; name: string };
  _count: { quotes: number };
}

const STATUS_COLORS: Record<string, string> = {
  open: "dark:bg-green-500/15 dark:text-green-400 bg-green-100 text-green-700",
  closed: "dark:bg-gray-500/15 dark:text-gray-400 bg-gray-100 text-gray-600",
  cancelled: "dark:bg-red-500/15 dark:text-red-400 bg-red-100 text-red-700",
};

function formatDate(d: string) { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }

export default function RfqPetaniPage() {
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");

  const fetchRfqs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100", sort: "newest" });
    if (filter) params.set("status", filter);
    const res = await fetch(`/api/v1/rfqs?${params}`);
    const data = await res.json();
    setRfqs(data.rfqs || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchRfqs(); }, [fetchRfqs]);

  return (
    <DashboardLayout requiredRole="petani" title="RFQ" subtitle="Lihat permintaan penawaran dari pembeli" backHref="/petani/dashboard">
      <div className="mb-6 flex gap-2">
        {["open", "closed", ""].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${filter === s ? "bg-green-700 text-white" : "dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
            {s === "open" ? "Open" : s === "closed" ? "Closed" : "Semua"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center dark:text-[#8b9e93] text-slate-500">Memuat RFQ...</div>
      ) : rfqs.length === 0 ? (
        <div className="rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-12 text-center shadow-sm">
          <p className="dark:text-gray-400 text-slate-500">Tidak ada RFQ ditemukan.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rfqs.map(r => (
            <Link key={r.id} href={`/rfq/${r.id}`}
              className="block rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] || ""}`}>{r.status}</span>
                    <span className="rounded dark:bg-green-500/15 dark:text-green-400 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{r.commodity.name}</span>
                  </div>
                  <p className="text-sm dark:text-gray-100 text-slate-900">{r.quantity.toLocaleString("id-ID")} {r.unit}{r.targetPrice ? ` — Target Rp ${r.targetPrice.toLocaleString("id-ID")}` : ""}</p>
                </div>
                <div className="text-right text-xs dark:text-[#8b9e93] text-slate-500">
                  <p>{r.buyer.businessName || r.buyer.name}</p>
                  <p>Kebutuhan: {formatDate(r.neededBy)}</p>
                  <p>{r._count.quotes} penawaran</p>
                </div>
              </div>
              <p className="mt-2 text-xs dark:text-[#8b9e93] text-slate-500">Lokasi: {r.deliveryLocation}</p>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
