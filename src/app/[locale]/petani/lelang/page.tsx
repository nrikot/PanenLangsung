"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import { useTranslations } from "next-intl";
import { buildErrorMessage } from "@/lib/utils";

interface Auction {
  id: string; title: string; quantity: number; unit: string; startPrice: number; reservePrice: number;
  startTime: string; endTime: string; selectionMode: string; status: string; createdAt: string;
  farmer: { id: string; name: string; businessName: string };
  commodity: { id: string; name: string }; _count: { bids: number };
}

interface Commodity { id: string; name: string; }

const STATUS_COLORS: Record<string, string> = {
  draft: "dark:bg-yellow-500/15 dark:text-yellow-400 bg-yellow-100 text-yellow-700",
  aktif: "dark:bg-green-500/15 dark:text-green-400 bg-green-100 text-green-700",
  berakhir: "dark:bg-gray-500/15 dark:text-gray-400 bg-gray-100 text-gray-600",
  dibatalkan: "dark:bg-red-500/15 dark:text-red-400 bg-red-100 text-red-700",
  selesai: "dark:bg-blue-500/15 dark:text-blue-400 bg-blue-100 text-blue-700",
};

function formatRupiah(n: number) { return "Rp " + n.toLocaleString("id-ID"); }
function formatDateTime(d: string) { return new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }

export default function LelangPetaniPage() {
  const t = useTranslations("auctions");
  const tc = useTranslations("common");
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [form, setForm] = useState({ commodityId: "", title: "", quantity: "", unit: "kg", startPrice: "", reservePrice: "", startTime: "", endTime: "", selectionMode: "manual" });
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState("");

  const fetchAuctions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const res = await fetch(`/api/v1/auctions?limit=100&sort=newest`);
    const data = await res.json();
    setAuctions((data.auctions || []).filter((a: Auction) => a.farmer.id === user.id));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAuctions();
    fetch("/api/v1/commodities").then(r => r.json()).then(d => { const all: Commodity[] = []; (d.categories || []).forEach((c: { commodities: Commodity[] }) => c.commodities.forEach(x => all.push(x))); setCommodities(all); }).catch(() => {});
  }, [fetchAuctions]);

  async function createAuction(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setFormMsg("");
    try {
      const res = await fetch("/api/v1/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commodityId: form.commodityId, title: form.title,
          quantity: Number(form.quantity), unit: form.unit,
          startPrice: Number(form.startPrice), reservePrice: Number(form.reservePrice),
          startTime: form.startTime, endTime: form.endTime, selectionMode: form.selectionMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(buildErrorMessage(data));
      }
      setFormMsg(t("createSuccess"));
      setShowCreate(false);
      setForm({ commodityId: "", title: "", quantity: "", unit: "kg", startPrice: "", reservePrice: "", startTime: "", endTime: "", selectionMode: "manual" });
      fetchAuctions();
    } catch (e: unknown) { setFormMsg(e instanceof Error ? e.message : t("createError")); }
    finally { setSubmitting(false); }
  }

  async function cancelAuction(id: string) {
    if (!confirm(t("confirmCancel"))) return;
    const res = await fetch(`/api/v1/auctions/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "dibatalkan" }) });
    const data = await res.json();
    if (res.ok) fetchAuctions(); else alert(buildErrorMessage(data));
  }

  return (
    <DashboardLayout requiredRole="petani" title={t("title")} subtitle={t("manageAuction")} backHref="/petani/dashboard">
      <div className="mb-6">
        <button onClick={() => setShowCreate(!showCreate)} className="rounded-lg bg-green-700 px-6 py-2 text-sm font-semibold text-white hover:bg-green-800">
          {showCreate ? t("closeForm") : t("openAuction")}
        </button>
      </div>

      {showCreate && (
        <div className="mb-8 rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold dark:text-gray-100 text-slate-900">{t("openAuction")}</h2>
          <form onSubmit={createAuction} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("title")}</label>
                <input required minLength={3} maxLength={200} placeholder="Contoh: Lelang Cabai Merah Panen Juli" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("commodities")}</label>
                <select required value={form.commodityId} onChange={e => setForm({ ...form, commodityId: e.target.value })}
                  className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm">
                  <option value="">{t("selectCommodity")}</option>
                  {commodities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("quantity")}</label>
                <input type="number" required min="1" step="any" placeholder="Contoh: 500" value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("unitType")}</label>
                <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                  className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm">
                  <option value="kg">{t("kilogram")}</option><option value="ikat">{t("ikat")}</option><option value="ekor">{t("ekor")}</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("startPriceRp")}</label>
                <input type="number" required min="1" placeholder="Contoh: 15000" value={form.startPrice}
                  onChange={e => setForm({ ...form, startPrice: e.target.value })}
                  className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("minPriceReserve")}</label>
                <input type="number" required min="1" placeholder="Contoh: 12000" value={form.reservePrice}
                  onChange={e => setForm({ ...form, reservePrice: e.target.value })}
                  className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("startTime")}</label>
                <input type="datetime-local" required value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })}
                  className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("endTime")}</label>
                <input type="datetime-local" required value={form.endTime}
                  onChange={e => setForm({ ...form, endTime: e.target.value })}
                  className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("selectionMode")}</label>
                <select value={form.selectionMode} onChange={e => setForm({ ...form, selectionMode: e.target.value })}
                  className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm">
                  <option value="manual">{t("manualSelection")}</option><option value="otomatis">{t("autoSelection")}</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="rounded-lg bg-green-700 px-6 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50">
              {submitting ? tc("creating") : t("openAuctionButton")}
            </button>
            {formMsg && <p className={`text-sm ${formMsg.includes("berhasil") ? "dark:text-green-400 text-green-600" : "dark:text-red-400 text-red-600"}`}>{formMsg}</p>}
          </form>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center dark:text-[#8b9e93] text-slate-500">{t("loading")}</div>
      ) : auctions.length === 0 ? (
        <div className="rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-12 text-center shadow-sm">
          <p className="dark:text-gray-400 text-slate-500">{t("noAuctionsYet")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {auctions.map(a => (
            <div key={a.id} className="rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[a.status] || ""}`}>{a.status}</span>
                    <span className="rounded dark:bg-green-500/15 dark:text-green-400 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{a.commodity.name}</span>
                    <span className="rounded dark:bg-blue-500/15 dark:text-blue-400 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{a.selectionMode}</span>
                  </div>
                  <h3 className="text-base font-semibold dark:text-gray-100 text-slate-900">{a.title}</h3>
                </div>
                <div className="flex gap-2">
                  <Link href={`/lelang/${a.id}`} className="rounded-lg dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-1.5 text-xs font-medium">{t("view")}</Link>
                  <Link href={`/lelang/${a.id}`} className="rounded-lg dark:bg-blue-500/15 dark:text-blue-400 bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-1.5 text-xs font-medium">{t("edit")}</Link>
                  {(a.status === "draft" || a.status === "aktif") && (
                    <button onClick={() => cancelAuction(a.id)} className="rounded-lg dark:bg-red-500/15 dark:text-red-400 bg-red-100 text-red-700 hover:bg-red-200 px-4 py-1.5 text-xs font-medium">{t("cancel")}</button>
                  )}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div><span className="dark:text-[#8b9e93] text-slate-500">{t("priceLabel")}</span><span className="font-medium dark:text-gray-100 text-slate-900">{formatRupiah(a.startPrice)}/{a.unit}</span></div>
                <div><span className="dark:text-[#8b9e93] text-slate-500">{t("quantityLabel")}</span><span className="dark:text-gray-100 text-slate-900">{a.quantity.toLocaleString("id-ID")} {a.unit}</span></div>
                <div><span className="dark:text-[#8b9e93] text-slate-500">{t("bidsLabel")}</span><span className="dark:text-gray-100 text-slate-900">{a._count.bids}</span></div>
                <div><span className="dark:text-[#8b9e93] text-slate-500">{t("endsLabel")}</span><span className="dark:text-gray-100 text-slate-900">{formatDateTime(a.endTime)}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
