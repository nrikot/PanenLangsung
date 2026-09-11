"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTranslations } from "next-intl";
import { buildErrorMessage } from "@/lib/utils";
import Header from "@/components/Header";

interface Commodity {
  id: string;
  name: string;
  category: { name: string };
}

export default function TambahProdukPage() {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const tg = useTranslations("gps");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [form, setForm] = useState({
    commodityId: "",
    title: "",
    description: "",
    price: "",
    unit: "kg",
    grade: "A",
    quantityAvailable: "",
    harvestDate: "",
    isPreorder: false,
    latitude: "",
    longitude: "",
    status: "aktif",
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "petani")) {
      router.push("/masuk");
      return;
    }
    if (user) {
      fetchCommodities();
    }
  }, [user, authLoading, router]);

  async function fetchCommodities() {
    const res = await fetch("/api/v1/commodities");
    const data = await res.json();
    const all: Commodity[] = [];
    (data.categories || []).forEach((cat: { commodities: Commodity[] }) => {
      cat.commodities.forEach((c) => all.push(c));
    });
    setCommodities(all);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body = {
        ...form,
        price: parseFloat(form.price),
        quantityAvailable: parseFloat(form.quantityAvailable),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        harvestDate: form.harvestDate || null,
      };

      const res = await fetch("/api/v1/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(buildErrorMessage(data));
      }

      router.push("/petani/produk");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : tc("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen dark:bg-[#0d1410] bg-slate-50">
      <Header />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <Link href="/petani/produk" className="mb-4 inline-block text-sm dark:text-green-400 text-green-600 hover:underline">&larr; {tc("back")}</Link>
        <h1 className="mb-6 text-2xl font-bold dark:text-gray-100 text-slate-900">{t("addProduct")}</h1>

        {error && <div className="dark:bg-red-500/15 dark:text-red-400 mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="dark:bg-white/[0.03] dark:border-white/10 space-y-4 rounded-xl border bg-white border-black/10 p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("commodities")} <span className="text-red-500">*</span></label>
            <select required value={form.commodityId} onChange={(e) => setForm({ ...form, commodityId: e.target.value })}
              className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm">
              <option value="">{t("selectCommodity")}</option>
              {commodities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("productTitle")} <span className="text-red-500">*</span></label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t("productTitlePlaceholder")}
              className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("description")} <span className="text-red-500">*</span></label>
            <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t("descriptionPlaceholder")}
              className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("pricePerUnit")} <span className="text-red-500">*</span></label>
              <input required type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("unitType")} <span className="text-red-500">*</span></label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm">
                <option value="kg">{t("kg")}</option>
                <option value="ikat">{t("ikat")}</option>
                <option value="ekor">{t("ekor")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("grade")} <span className="text-red-500">*</span></label>
              <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm">
                <option value="A">{t("gradeAPremium")}</option>
                <option value="B">{t("gradeBStandard")}</option>
                <option value="C">{t("gradeCEconomy")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("availableQuantity")} <span className="text-red-500">*</span></label>
              <input required type="number" min="1" value={form.quantityAvailable} onChange={(e) => setForm({ ...form, quantityAvailable: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("status")}</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm">
                <option value="aktif">{t("statusAktif")}</option>
                <option value="pre_order">{t("statusPreOrder")}</option>
                <option value="nonaktif">{t("statusNonaktif")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("harvestEstimate")}</label>
              <input type="date" value={form.harvestDate} onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("latitude")} <span className="text-red-500">*</span></label>
              <input required type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{t("longitude")} <span className="text-red-500">*</span></label>
              <input required type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
            </div>
          </div>

          <button type="button" disabled={geoLoading} onClick={() => {
            if (!navigator.geolocation) { alert(tg("browserNotSupported")); return; }
            if (!window.isSecureContext) { alert(tg("httpsRequired")); return; }
            if (geoLoading) return;
            setGeoLoading(true);
            function doGeo(attempt = 0) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setGeoLoading(false);
                  setForm((f) => ({
                    ...f,
                    latitude: pos.coords.latitude.toFixed(6),
                    longitude: pos.coords.longitude.toFixed(6),
                  }));
                },
                (err) => {
                  console.error("Geolocation error:", err.code, err.message);
                  if (err.code === 1 && attempt === 0) {
                    doGeo(1);
                  } else {
                    setGeoLoading(false);
                    if (err.code === 1) alert(tg("denied"));
                    else if (err.code === 2) alert(tg("unavailableMessage"));
                    else alert(tg("error"));
                  }
                },
                { timeout: 10000, maximumAge: 300000 }
              );
            }
            doGeo();
          }} className="w-full rounded-lg border dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10 border-green-600 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50">
            {geoLoading ? tg("searching") : t("fillGpsLocation")}
          </button>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPreorder" checked={form.isPreorder} onChange={(e) => setForm({ ...form, isPreorder: e.target.checked })} className="rounded" />
            <label htmlFor="isPreorder" className="text-sm dark:text-gray-300 text-slate-700">{t("preOrder")}</label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50">
            {loading ? tc("saving") : t("saveProduct")}
          </button>
        </form>
      </main>
    </div>
  );
}
