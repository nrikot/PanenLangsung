"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { buildErrorMessage } from "@/lib/utils";
import Header from "@/components/Header";

interface Commodity {
  id: string;
  name: string;
  category: { name: string };
}

export default function TambahProdukPage() {
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
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen dark:bg-[#0d1410] bg-slate-50">
      <Header />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <Link href="/petani/produk" className="mb-4 inline-block text-sm dark:text-green-400 text-green-600 hover:underline">&larr; Kembali</Link>
        <h1 className="mb-6 text-2xl font-bold dark:text-gray-100 text-slate-900">Tambah Produk Baru</h1>

        {error && <div className="dark:bg-red-500/15 dark:text-red-400 mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="dark:bg-white/[0.03] dark:border-white/10 space-y-4 rounded-xl border bg-white border-black/10 p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Komoditas <span className="text-red-500">*</span></label>
            <select required value={form.commodityId} onChange={(e) => setForm({ ...form, commodityId: e.target.value })}
              className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm">
              <option value="">Pilih Komoditas</option>
              {commodities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Judul Produk <span className="text-red-500">*</span></label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Contoh: Padi Varietas IR64 Super"
              className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Deskripsi <span className="text-red-500">*</span></label>
            <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Jelaskan kualitas, asal, dan keunggulan produk..."
              className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Harga per Unit (Rp) <span className="text-red-500">*</span></label>
              <input required type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Satuan <span className="text-red-500">*</span></label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm">
                <option value="kg">Kilogram (kg)</option>
                <option value="ikat">Ikat</option>
                <option value="ekor">Ekor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Grade <span className="text-red-500">*</span></label>
              <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm">
                <option value="A">Grade A (Premium)</option>
                <option value="B">Grade B (Standar)</option>
                <option value="C">Grade C (Ekonomis)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Kuantitas Tersedia <span className="text-red-500">*</span></label>
              <input required type="number" min="1" value={form.quantityAvailable} onChange={(e) => setForm({ ...form, quantityAvailable: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm">
                <option value="aktif">Aktif</option>
                <option value="pre_order">Pre-Order</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Estimasi Panen</label>
              <input type="date" value={form.harvestDate} onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Latitude <span className="text-red-500">*</span></label>
              <input required type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Longitude <span className="text-red-500">*</span></label>
              <input required type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
            </div>
          </div>

          <button type="button" disabled={geoLoading} onClick={() => {
            if (!navigator.geolocation) { alert("Browser tidak mendukung geolokasi"); return; }
            if (!window.isSecureContext) { alert("Geolokasi membutuhkan HTTPS. Akses situs melalui HTTPS atau localhost."); return; }
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
                    if (err.code === 1) alert("Izin lokasi ditolak. Pastikan izin lokasi aktif di browser DAN di sistem operasi (Windows: Settings › Privacy › Location › 'Let desktop apps access your location').");
                    else if (err.code === 2) alert("Lokasi tidak tersedia. Pastikan GPS aktif.");
                    else alert("Gagal mendapatkan lokasi. Coba lagi.");
                  }
                },
                { timeout: 10000, maximumAge: 300000 }
              );
            }
            doGeo();
          }} className="w-full rounded-lg border dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10 border-green-600 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50">
            {geoLoading ? "Mencari lokasi..." : "Isi Lokasi dari GPS"}
          </button>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPreorder" checked={form.isPreorder} onChange={(e) => setForm({ ...form, isPreorder: e.target.checked })} className="rounded" />
            <label htmlFor="isPreorder" className="text-sm dark:text-gray-300 text-slate-700">Produk Pre-Order (belum panen)</label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </form>
      </main>
    </div>
  );
}
