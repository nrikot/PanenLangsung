"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

interface Buyer {
  id: string;
  email: string;
  name: string;
  phone: string;
  businessName: string | null;
  verificationStatus: string;
  createdAt: string;
  _count: { rfqs: number; ordersAsBuyer: number };
}

const STATUS_COLORS: Record<string, string> = {
  verified: "dark:bg-green-500/15 dark:text-green-400 bg-green-100 text-green-700",
  pending: "dark:bg-yellow-500/15 dark:text-yellow-400 bg-yellow-100 text-yellow-700",
  rejected: "dark:bg-red-500/15 dark:text-red-400 bg-red-100 text-red-700",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminPembeliPage() {
  const t = useTranslations("admin.users");
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchBuyers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ role: "pembeli", page: String(page), limit: "20", sort: "newest" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/v1/admin/users?${params}`);
    const data = await res.json();
    setBuyers(data.users || []);
    setTotalPages(data.pagination?.totalPages || 1);
    setTotal(data.pagination?.total || 0);
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchBuyers(); }, [fetchBuyers]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <DashboardLayout requiredRole="admin" title={t("totalBuyers", { count: total })} subtitle={t("searchPlaceholder")} backHref="/admin/dashboard">
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-64 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800">{t("search")}</button>
        </form>
        <div className="flex gap-2">
          {[
            { val: "", label: t("all") },
            { val: "verified", label: t("status.verified") },
            { val: "pending", label: t("status.pending") },
            { val: "rejected", label: t("status.rejected") },
          ].map(s => (
            <button key={s.val} onClick={() => { setStatusFilter(s.val); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${statusFilter === s.val ? "bg-green-700 text-white" : "dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-sm dark:text-[#8b9e93] text-slate-500">{t("totalBuyers", { count: total })}</p>

      {loading ? (
        <div className="py-12 text-center dark:text-[#8b9e93] text-slate-500">{t("loading")}</div>
      ) : buyers.length === 0 ? (
        <div className="rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-12 text-center shadow-sm">
          <p className="dark:text-gray-400 text-slate-500">{t("noBuyers")}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="dark:border-white/10 dark:bg-white/5 dark:text-[#8b9e93] border-b bg-slate-100 text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium">{t("tableHeaders.name")}</th>
                  <th className="px-4 py-3 font-medium">{t("tableHeaders.email")}</th>
                  <th className="px-4 py-3 font-medium">{t("tableHeaders.business")}</th>
                  <th className="px-4 py-3 font-medium">{t("tableHeaders.verification")}</th>
                  <th className="px-4 py-3 font-medium">{t("tableHeaders.rfq")}</th>
                  <th className="px-4 py-3 font-medium">{t("tableHeaders.orders")}</th>
                  <th className="px-4 py-3 font-medium">{t("tableHeaders.registered")}</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {buyers.map(b => (
                  <tr key={b.id} className="dark:border-white/5 border-b border-gray-100 hover:dark:bg-white/[0.02] hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium dark:text-gray-100 text-slate-900">{b.name}</div>
                      {b.phone && <div className="text-xs dark:text-[#8b9e93] text-slate-500">{b.phone}</div>}
                    </td>
                    <td className="px-4 py-3 dark:text-gray-300 text-slate-600">{b.email}</td>
                    <td className="px-4 py-3 dark:text-gray-300 text-slate-600">{b.businessName || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[b.verificationStatus] || ""}`}>
                        {b.verificationStatus === "verified" ? t("status.verified") : b.verificationStatus === "rejected" ? t("status.rejected") : t("status.pending")}
                      </span>
                    </td>
                    <td className="px-4 py-3 dark:text-gray-300 text-slate-600 text-center">{b._count.rfqs}</td>
                    <td className="px-4 py-3 dark:text-gray-300 text-slate-600 text-center">{b._count.ordersAsBuyer}</td>
                    <td className="px-4 py-3 dark:text-[#8b9e93] text-slate-500 text-xs">{formatDate(b.createdAt)}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <Link href={`/admin/profil/${b.id}`} className="rounded-lg dark:bg-white/5 dark:text-green-400 dark:hover:bg-white/10 bg-slate-100 text-green-600 hover:bg-slate-200 px-3 py-1.5 text-xs font-medium">
                        {t("view")}
                      </Link>
                      <Link href={`/admin/profil/${b.id}`} className="rounded-lg dark:bg-white/5 dark:text-blue-400 dark:hover:bg-white/10 bg-slate-100 text-blue-600 hover:bg-slate-200 px-3 py-1.5 text-xs font-medium">
                        {t("edit")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="rounded-lg border dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                {t("previous")}
              </button>
              <span className="text-sm dark:text-[#8b9e93] text-slate-500">{t("pageOf", { page, total: totalPages })}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="rounded-lg border dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                {t("next")}
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
